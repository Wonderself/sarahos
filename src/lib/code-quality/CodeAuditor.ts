import { spawn } from 'child_process';
import { existsSync, statSync } from 'fs';
import path from 'path';

export interface AuditResult {
  score: number;
  timestamp: string;
  checks: AuditCheck[];
  summary: string;
  recommendations: string[];
}

export interface AuditCheck {
  name: string;
  category: 'security' | 'performance' | 'quality' | 'compliance';
  status: 'pass' | 'warn' | 'fail';
  score: number;
  maxScore: number;
  message: string;
  files?: string[];
}

function runCommand(cmd: string, args: string[], cwd: string): Promise<string> {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, {
      cwd,
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('close', () => {
      resolve(stdout.trim() || stderr.trim());
    });

    proc.on('error', () => {
      resolve('');
    });
  });
}

async function countGrepMatches(
  pattern: string,
  searchPath: string,
  includes: string[],
  cwd: string
): Promise<{ count: number; files: string[] }> {
  const includeArgs = includes.map((inc) => `--include="${inc}"`).join(' ');
  const raw = await runCommand(
    'grep',
    ['-rn', pattern, searchPath, includeArgs, '--exclude-dir=node_modules'],
    cwd
  );

  if (!raw || raw.length === 0) {
    return { count: 0, files: [] };
  }

  const lines = raw.split('\n').filter((l) => l.length > 0);
  const fileSet = new Set<string>();
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      fileSet.add(line.substring(0, colonIdx));
    }
  }

  return { count: lines.length, files: Array.from(fileSet) };
}

async function runSecurityChecks(projectRoot: string): Promise<AuditCheck[]> {
  const checks: AuditCheck[] = [];

  // 1. Exposed API keys
  const apiKeys = await countGrepMatches(
    'sk-ant\\|sk_live\\|AKIA',
    'src/',
    ['*.ts', '*.tsx'],
    projectRoot
  );
  checks.push({
    name: 'Exposed API Keys',
    category: 'security',
    status: apiKeys.count === 0 ? 'pass' : 'fail',
    score: apiKeys.count === 0 ? 5 : 0,
    maxScore: 5,
    message:
      apiKeys.count === 0
        ? 'No exposed API keys found'
        : `${apiKeys.count} potential API key(s) exposed in source`,
    files: apiKeys.files.length > 0 ? apiKeys.files.slice(0, 10) : undefined,
  });

  // 2. .env in .gitignore
  const gitignoreCheck = await runCommand(
    'grep',
    ['^.env$', '.gitignore'],
    projectRoot
  );
  const envProtected = gitignoreCheck.includes('.env');
  checks.push({
    name: '.env in .gitignore',
    category: 'security',
    status: envProtected ? 'pass' : 'fail',
    score: envProtected ? 5 : 0,
    maxScore: 5,
    message: envProtected
      ? '.env is properly listed in .gitignore'
      : '.env is NOT in .gitignore — secrets at risk',
  });

  // 3. console.log in prod code
  const consoleLogs = await countGrepMatches(
    'console\\.log',
    'src/dashboard/app/',
    ['*.ts', '*.tsx'],
    projectRoot
  );
  const consoleStatus: AuditCheck['status'] =
    consoleLogs.count === 0 ? 'pass' : consoleLogs.count <= 20 ? 'warn' : 'fail';
  const consoleScore =
    consoleLogs.count === 0 ? 5 : consoleLogs.count <= 20 ? 3 : 1;
  checks.push({
    name: 'console.log in production',
    category: 'security',
    status: consoleStatus,
    score: consoleScore,
    maxScore: 5,
    message: `${consoleLogs.count} console.log statement(s) in dashboard app`,
    files:
      consoleLogs.files.length > 0
        ? consoleLogs.files.slice(0, 10)
        : undefined,
  });

  // 4. any types
  const anyTypes = await countGrepMatches(
    ': any',
    'src/dashboard/',
    ['*.ts', '*.tsx'],
    projectRoot
  );
  const anyStatus: AuditCheck['status'] =
    anyTypes.count === 0 ? 'pass' : anyTypes.count <= 10 ? 'warn' : 'fail';
  const anyScore =
    anyTypes.count === 0 ? 5 : anyTypes.count <= 10 ? 3 : 1;
  checks.push({
    name: 'TypeScript any usage',
    category: 'security',
    status: anyStatus,
    score: anyScore,
    maxScore: 5,
    message: `${anyTypes.count} usage(s) of ": any" in dashboard`,
    files:
      anyTypes.files.length > 0 ? anyTypes.files.slice(0, 10) : undefined,
  });

  // 5. @ts-ignore / @ts-nocheck
  const tsIgnore = await countGrepMatches(
    '@ts-ignore\\|@ts-nocheck',
    'src/',
    ['*.ts', '*.tsx'],
    projectRoot
  );
  checks.push({
    name: 'TypeScript suppression directives',
    category: 'security',
    status: tsIgnore.count === 0 ? 'pass' : 'fail',
    score: tsIgnore.count === 0 ? 5 : 0,
    maxScore: 5,
    message:
      tsIgnore.count === 0
        ? 'No @ts-ignore or @ts-nocheck found'
        : `${tsIgnore.count} suppression directive(s) found`,
    files:
      tsIgnore.files.length > 0 ? tsIgnore.files.slice(0, 10) : undefined,
  });

  return checks;
}

async function runPerformanceChecks(projectRoot: string): Promise<AuditCheck[]> {
  const checks: AuditCheck[] = [];

  // 1. TypeScript check
  const tscOutput = await runCommand(
    'npx',
    ['tsc', '--noEmit', '2>&1', '|', 'grep', '-c', '"error"'],
    projectRoot
  );
  const errorCount = parseInt(tscOutput, 10) || 0;
  checks.push({
    name: 'TypeScript compilation',
    category: 'performance',
    status: errorCount === 0 ? 'pass' : 'fail',
    score: errorCount === 0 ? 8 : 0,
    maxScore: 8,
    message:
      errorCount === 0
        ? 'TypeScript compiles with 0 errors'
        : `TypeScript has ${errorCount} error(s)`,
  });

  // 2. Build freshness — check .next/BUILD_ID
  const buildIdPath = path.join(projectRoot, 'src', 'dashboard', '.next', 'BUILD_ID');
  let buildFresh = false;
  if (existsSync(buildIdPath)) {
    const stat = statSync(buildIdPath);
    const ageMs = Date.now() - stat.mtime.getTime();
    const ageHours = ageMs / (1000 * 60 * 60);
    buildFresh = ageHours < 24;
  }
  checks.push({
    name: 'Build freshness',
    category: 'performance',
    status: buildFresh ? 'pass' : 'warn',
    score: buildFresh ? 7 : 3,
    maxScore: 7,
    message: buildFresh
      ? 'Build is fresh (less than 24h old)'
      : 'Build is stale or missing — consider rebuilding',
  });

  // 3. Page count (informational)
  const pageCountRaw = await runCommand(
    'find',
    ['src/dashboard/app', '-name', '"page.tsx"', '|', 'wc', '-l'],
    projectRoot
  );
  const pageCount = parseInt(pageCountRaw, 10) || 0;
  checks.push({
    name: 'Page count',
    category: 'performance',
    status: 'pass',
    score: 5,
    maxScore: 5,
    message: `${pageCount} page(s) in dashboard app`,
  });

  // 4. Large page files (>50KB)
  const largePagesRaw = await runCommand(
    'find',
    ['src/dashboard/app', '-name', '"*.tsx"', '-size', '+50k', '|', 'wc', '-l'],
    projectRoot
  );
  const largePages = parseInt(largePagesRaw, 10) || 0;
  const largePagesStatus: AuditCheck['status'] =
    largePages === 0 ? 'pass' : largePages <= 5 ? 'warn' : 'fail';
  checks.push({
    name: 'Large files (>50KB)',
    category: 'performance',
    status: largePagesStatus,
    score: largePages === 0 ? 5 : largePages <= 5 ? 3 : 1,
    maxScore: 5,
    message: `${largePages} file(s) exceed 50KB in dashboard app`,
  });

  return checks;
}

async function runQualityChecks(projectRoot: string): Promise<AuditCheck[]> {
  const checks: AuditCheck[] = [];

  // 1. TODO/FIXME/HACK count
  const todos = await countGrepMatches(
    'TODO\\|FIXME\\|HACK',
    'src/',
    ['*.ts', '*.tsx'],
    projectRoot
  );
  const todoStatus: AuditCheck['status'] =
    todos.count === 0 ? 'pass' : todos.count <= 10 ? 'warn' : 'fail';
  checks.push({
    name: 'TODO/FIXME/HACK markers',
    category: 'quality',
    status: todoStatus,
    score: todos.count === 0 ? 8 : todos.count <= 10 ? 5 : 2,
    maxScore: 8,
    message: `${todos.count} TODO/FIXME/HACK marker(s) in source`,
    files: todos.files.length > 0 ? todos.files.slice(0, 10) : undefined,
  });

  // 2. Dead code: files with no exports used (basic heuristic — empty files or stub files)
  const emptyFilesRaw = await runCommand(
    'find',
    ['src/dashboard/app', '-name', '"*.tsx"', '-empty', '|', 'wc', '-l'],
    projectRoot
  );
  const emptyFiles = parseInt(emptyFilesRaw, 10) || 0;
  checks.push({
    name: 'Empty/dead files',
    category: 'quality',
    status: emptyFiles === 0 ? 'pass' : 'warn',
    score: emptyFiles === 0 ? 5 : 3,
    maxScore: 5,
    message:
      emptyFiles === 0
        ? 'No empty .tsx files detected'
        : `${emptyFiles} empty .tsx file(s) found`,
  });

  // 3. Consistent naming: snake_case in tsx filenames (should be kebab-case or PascalCase)
  const snakeCaseRaw = await runCommand(
    'find',
    ['src/dashboard/app', '-name', '"*_*.tsx"', '|', 'wc', '-l'],
    projectRoot
  );
  const snakeCaseCount = parseInt(snakeCaseRaw, 10) || 0;
  checks.push({
    name: 'Filename conventions',
    category: 'quality',
    status: snakeCaseCount === 0 ? 'pass' : 'warn',
    score: snakeCaseCount === 0 ? 7 : 4,
    maxScore: 7,
    message:
      snakeCaseCount === 0
        ? 'All .tsx filenames follow naming conventions'
        : `${snakeCaseCount} .tsx file(s) use snake_case naming`,
  });

  // 4. Duplicate code indicator: very large single files
  const veryLargeRaw = await runCommand(
    'find',
    ['src/dashboard', '-name', '"*.ts"', '-o', '-name', '"*.tsx"', '|', 'xargs', 'wc', '-l', '2>/dev/null', '|', 'sort', '-rn', '|', 'head', '-1'],
    projectRoot
  );
  const largestFileLines = parseInt(veryLargeRaw, 10) || 0;
  const largestStatus: AuditCheck['status'] =
    largestFileLines < 500 ? 'pass' : largestFileLines < 2000 ? 'warn' : 'fail';
  checks.push({
    name: 'Largest file size',
    category: 'quality',
    status: largestStatus,
    score: largestFileLines < 500 ? 5 : largestFileLines < 2000 ? 3 : 1,
    maxScore: 5,
    message: `Largest file has ~${largestFileLines} lines`,
  });

  return checks;
}

async function runComplianceChecks(projectRoot: string): Promise<AuditCheck[]> {
  const checks: AuditCheck[] = [];

  // 1. CLAUDE.md exists
  const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');
  const claudeMdExists = existsSync(claudeMdPath);
  checks.push({
    name: 'CLAUDE.md present',
    category: 'compliance',
    status: claudeMdExists ? 'pass' : 'fail',
    score: claudeMdExists ? 7 : 0,
    maxScore: 7,
    message: claudeMdExists
      ? 'CLAUDE.md exists and is readable'
      : 'CLAUDE.md is missing from project root',
  });

  // 2. use client directive
  const pagesRaw = await runCommand(
    'find',
    ['src/dashboard/app', '-name', '"page.tsx"'],
    projectRoot
  );
  const pageFiles = pagesRaw.split('\n').filter((f) => f.length > 0);
  let missingUseClient = 0;
  const missingFiles: string[] = [];

  for (const pageFile of pageFiles.slice(0, 50)) {
    const headContent = await runCommand(
      'head',
      ['-1', pageFile],
      projectRoot
    );
    if (!headContent.includes('use client')) {
      missingUseClient++;
      missingFiles.push(pageFile);
    }
  }
  checks.push({
    name: "'use client' directive",
    category: 'compliance',
    status: missingUseClient === 0 ? 'pass' : 'warn',
    score: missingUseClient === 0 ? 6 : missingUseClient <= 5 ? 4 : 2,
    maxScore: 6,
    message:
      missingUseClient === 0
        ? "All checked pages have 'use client'"
        : `${missingUseClient} page(s) missing 'use client' directive`,
    files: missingFiles.length > 0 ? missingFiles.slice(0, 10) : undefined,
  });

  // 3. No Tailwind in dashboard
  const tailwindUsage = await countGrepMatches(
    'className=.*\\(tw-\\|flex \\|grid \\|p-[0-9]\\|m-[0-9]\\|text-[a-z]\\)',
    'src/dashboard/app/',
    ['*.tsx'],
    projectRoot
  );
  // Only flag obvious Tailwind utility classes, be lenient
  const twStatus: AuditCheck['status'] =
    tailwindUsage.count === 0
      ? 'pass'
      : tailwindUsage.count <= 5
        ? 'warn'
        : 'fail';
  checks.push({
    name: 'No Tailwind in dashboard',
    category: 'compliance',
    status: twStatus,
    score: tailwindUsage.count === 0 ? 6 : tailwindUsage.count <= 5 ? 4 : 1,
    maxScore: 6,
    message:
      tailwindUsage.count === 0
        ? 'No Tailwind utility classes detected in dashboard'
        : `${tailwindUsage.count} potential Tailwind usage(s) found`,
    files:
      tailwindUsage.files.length > 0
        ? tailwindUsage.files.slice(0, 10)
        : undefined,
  });

  // 4. Inline styles compliance
  const classNameUsage = await countGrepMatches(
    'className=',
    'src/dashboard/app/',
    ['*.tsx'],
    projectRoot
  );
  const styleUsage = await countGrepMatches(
    'style=',
    'src/dashboard/app/',
    ['*.tsx'],
    projectRoot
  );
  const ratio =
    styleUsage.count > 0
      ? classNameUsage.count / (classNameUsage.count + styleUsage.count)
      : 0;
  const inlineStatus: AuditCheck['status'] =
    ratio < 0.3 ? 'pass' : ratio < 0.6 ? 'warn' : 'fail';
  checks.push({
    name: 'Inline styles preference',
    category: 'compliance',
    status: inlineStatus,
    score: ratio < 0.3 ? 6 : ratio < 0.6 ? 4 : 1,
    maxScore: 6,
    message: `className: ${classNameUsage.count}, style: ${styleUsage.count} — ratio ${(ratio * 100).toFixed(0)}% className`,
  });

  return checks;
}

function buildRecommendations(checks: AuditCheck[]): string[] {
  const recommendations: string[] = [];

  const failing = checks.filter((c) => c.status === 'fail');
  const warning = checks.filter((c) => c.status === 'warn');

  for (const check of failing) {
    switch (check.name) {
      case 'Exposed API Keys':
        recommendations.push(
          'URGENT: Remove exposed API keys from source code immediately'
        );
        break;
      case '.env in .gitignore':
        recommendations.push('Add .env to .gitignore to protect secrets');
        break;
      case 'TypeScript compilation':
        recommendations.push(
          'Fix TypeScript errors before next deploy (npx tsc --noEmit)'
        );
        break;
      case 'TypeScript suppression directives':
        recommendations.push(
          'Remove @ts-ignore/@ts-nocheck and fix underlying type issues'
        );
        break;
      case 'TypeScript any usage':
        recommendations.push(
          'Replace ": any" with proper types in dashboard code'
        );
        break;
      default:
        recommendations.push(`Fix failing check: ${check.name}`);
    }
  }

  for (const check of warning.slice(0, 3)) {
    recommendations.push(`Improve: ${check.name} — ${check.message}`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Codebase is in good shape. Keep it up!');
  }

  return recommendations.slice(0, 5);
}

function calculateCategoryScore(
  checks: AuditCheck[],
  category: AuditCheck['category']
): number {
  const categoryChecks = checks.filter((c) => c.category === category);
  if (categoryChecks.length === 0) return 0;

  const totalScore = categoryChecks.reduce((sum, c) => sum + c.score, 0);
  const maxScore = categoryChecks.reduce((sum, c) => sum + c.maxScore, 0);

  return maxScore > 0 ? Math.round((totalScore / maxScore) * 25) : 0;
}

export class CodeAuditor {
  async runFullAudit(projectRoot: string): Promise<AuditResult> {
    const securityChecks = await runSecurityChecks(projectRoot);
    const performanceChecks = await runPerformanceChecks(projectRoot);
    const qualityChecks = await runQualityChecks(projectRoot);
    const complianceChecks = await runComplianceChecks(projectRoot);

    const allChecks = [
      ...securityChecks,
      ...performanceChecks,
      ...qualityChecks,
      ...complianceChecks,
    ];

    const securityScore = calculateCategoryScore(allChecks, 'security');
    const performanceScore = calculateCategoryScore(allChecks, 'performance');
    const qualityScore = calculateCategoryScore(allChecks, 'quality');
    const complianceScore = calculateCategoryScore(allChecks, 'compliance');

    const totalScore =
      securityScore + performanceScore + qualityScore + complianceScore;

    const failCount = allChecks.filter((c) => c.status === 'fail').length;
    const warnCount = allChecks.filter((c) => c.status === 'warn').length;
    const passCount = allChecks.filter((c) => c.status === 'pass').length;

    const recommendations = buildRecommendations(allChecks);

    const summary = `Score: ${totalScore}/100 | ${passCount} pass, ${warnCount} warn, ${failCount} fail | Security ${securityScore}/25, Performance ${performanceScore}/25, Quality ${qualityScore}/25, Compliance ${complianceScore}/25`;

    return {
      score: totalScore,
      timestamp: new Date().toISOString(),
      checks: allChecks,
      summary,
      recommendations,
    };
  }

  generateReport(result: AuditResult): string {
    const lines: string[] = [];
    const date = new Date(result.timestamp).toLocaleDateString('fr-FR');

    lines.push('='.repeat(60));
    lines.push(`  FREENZY.IO — Audit Code Quotidien`);
    lines.push(`  Date: ${date}`);
    lines.push(`  Score: ${result.score}/100`);
    lines.push('='.repeat(60));
    lines.push('');

    const categories: AuditCheck['category'][] = [
      'security',
      'performance',
      'quality',
      'compliance',
    ];
    const categoryLabels: Record<string, string> = {
      security: 'SECURITE',
      performance: 'PERFORMANCE',
      quality: 'QUALITE',
      compliance: 'CONFORMITE',
    };

    for (const cat of categories) {
      const catChecks = result.checks.filter((c) => c.category === cat);
      const catScore = calculateCategoryScore(result.checks, cat);

      lines.push(`--- ${categoryLabels[cat]} (${catScore}/25) ---`);
      for (const check of catChecks) {
        const icon =
          check.status === 'pass'
            ? '[OK]'
            : check.status === 'warn'
              ? '[!!]'
              : '[XX]';
        lines.push(
          `  ${icon} ${check.name}: ${check.message} (${check.score}/${check.maxScore})`
        );
        if (check.files && check.files.length > 0) {
          for (const f of check.files.slice(0, 5)) {
            lines.push(`      -> ${f}`);
          }
        }
      }
      lines.push('');
    }

    lines.push('--- RECOMMANDATIONS ---');
    for (let i = 0; i < result.recommendations.length; i++) {
      lines.push(`  ${i + 1}. ${result.recommendations[i]}`);
    }
    lines.push('');
    lines.push('='.repeat(60));

    return lines.join('\n');
  }

  generateTelegramReport(result: AuditResult): string {
    const date = new Date(result.timestamp).toLocaleDateString('fr-FR');
    const scoreEmoji =
      result.score > 80 ? '\uD83D\uDFE2' : result.score > 60 ? '\uD83D\uDFE1' : '\uD83D\uDD34';

    const secScore = calculateCategoryScore(result.checks, 'security');
    const perfScore = calculateCategoryScore(result.checks, 'performance');
    const qualScore = calculateCategoryScore(result.checks, 'quality');
    const compScore = calculateCategoryScore(result.checks, 'compliance');

    const failChecks = result.checks.filter((c) => c.status === 'fail');

    let msg = `\uD83D\uDD0D Audit Code Quotidien \u2014 ${date}\n\n`;
    msg += `Score : ${result.score}/100 ${scoreEmoji}\n\n`;
    msg += `\uD83D\uDEE1\uFE0F S\u00E9curit\u00E9 : ${secScore}/25\n`;
    msg += `\u26A1 Performance : ${perfScore}/25\n`;
    msg += `\uD83D\uDCDD Qualit\u00E9 : ${qualScore}/25\n`;
    msg += `\u2705 Conformit\u00E9 : ${compScore}/25\n`;

    if (failChecks.length > 0) {
      msg += `\n\u274C Echecs :\n`;
      for (const fc of failChecks.slice(0, 3)) {
        msg += `- ${fc.name}\n`;
      }
    }

    msg += `\n\uD83D\uDCCB Recommandations :\n`;
    for (let i = 0; i < Math.min(result.recommendations.length, 3); i++) {
      msg += `${i + 1}. ${result.recommendations[i]}\n`;
    }

    return msg.slice(0, 500);
  }
}
