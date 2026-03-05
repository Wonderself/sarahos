import { logger } from './logger';

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function extractText(buffer: Buffer, mimeType: string, filename?: string): Promise<string> {
  try {
    if (mimeType === 'application/pdf') {
      const pdfParse = (await import('pdf-parse') as any).default ?? (await import('pdf-parse'));
      const result = await pdfParse(buffer);
      return (result.text ?? '').trim();
    }

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword') {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    }

    if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        mimeType === 'application/vnd.ms-excel' ||
        mimeType === 'text/csv') {
      const xlsx = await import('xlsx');
      const workbook = xlsx.read(buffer);
      const sheets: string[] = [];
      for (const name of workbook.SheetNames) {
        const csv = xlsx.utils.sheet_to_csv(workbook.Sheets[name]!);
        sheets.push(`[${name}]\n${csv}`);
      }
      return sheets.join('\n\n').trim();
    }

    if (mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'text/markdown') {
      return buffer.toString('utf-8').trim();
    }

    if (mimeType.startsWith('image/')) {
      return `[Image: ${filename ?? 'image'}]`;
    }

    return `[Document: ${filename ?? 'fichier'} — type non supporte pour extraction texte]`;
  } catch (err) {
    logger.error('text-extractor: extraction failed', { mimeType, filename, error: (err as Error).message });
    return `[Erreur extraction: ${filename ?? 'document'}]`;
  }
}

export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export interface TextSection {
  title: string;
  content: string;
  tokenEstimate: number;
}

export interface ExtractedSections {
  fullText: string;
  sections: TextSection[];
  totalTokens: number;
}

export async function extractTextWithSections(buffer: Buffer, mimeType: string, filename?: string): Promise<ExtractedSections> {
  const fullText = await extractText(buffer, mimeType, filename);
  const sections: TextSection[] = [];

  if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimeType === 'application/vnd.ms-excel' || mimeType === 'text/csv') {
    // Each sheet is a section
    const parts = fullText.split(/\n\n\[/).filter(Boolean);
    for (const part of parts) {
      const firstNewline = part.indexOf('\n');
      const title = (part.startsWith('[') ? part.slice(1, part.indexOf(']')) : part.slice(0, Math.min(firstNewline > 0 ? firstNewline : 50, 50))).trim();
      const content = firstNewline > 0 ? part.slice(firstNewline + 1).trim() : part.trim();
      if (content) {
        sections.push({ title: title || 'Feuille', content, tokenEstimate: estimateTokenCount(content) });
      }
    }
  } else {
    // Split by headings or double newlines into sections
    const lines = fullText.split('\n');
    let currentTitle = filename ? `Document: ${filename}` : 'Section 1';
    let currentContent: string[] = [];
    let sectionIdx = 1;

    for (const line of lines) {
      // Detect headings (lines that look like titles)
      const isHeading = /^(#{1,3}\s|[A-Z][A-Z\s]{5,}$|^\d+[\.\)]\s+[A-Z])/.test(line.trim());
      if (isHeading && currentContent.length > 0) {
        const content = currentContent.join('\n').trim();
        if (content) {
          sections.push({ title: currentTitle, content, tokenEstimate: estimateTokenCount(content) });
        }
        currentTitle = line.trim().replace(/^#+\s*/, '');
        currentContent = [];
        sectionIdx++;
      } else {
        currentContent.push(line);
      }
    }

    // Last section
    const lastContent = currentContent.join('\n').trim();
    if (lastContent) {
      sections.push({ title: currentTitle, content: lastContent, tokenEstimate: estimateTokenCount(lastContent) });
    }
  }

  // If no sections were found, put all text in one section
  if (sections.length === 0 && fullText.trim()) {
    sections.push({
      title: filename || 'Document complet',
      content: fullText,
      tokenEstimate: estimateTokenCount(fullText),
    });
  }

  return {
    fullText,
    sections,
    totalTokens: estimateTokenCount(fullText),
  };
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'text/plain',
  'text/markdown',
  'application/json',
  'image/png',
  'image/jpeg',
]);

const FILE_TYPE_FROM_EXT: Record<string, string> = {
  pdf: 'pdf', docx: 'docx', doc: 'docx',
  xlsx: 'xlsx', xls: 'xls', csv: 'csv',
  txt: 'txt', md: 'md', json: 'txt',
  png: 'png', jpg: 'jpg', jpeg: 'jpeg',
};

export function isAllowedMimeType(mime: string): boolean {
  return ALLOWED_MIME_TYPES.has(mime);
}

export function getFileTypeFromExtension(filename: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return FILE_TYPE_FROM_EXT[ext] ?? null;
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_USER_STORAGE = 50 * 1024 * 1024; // 50 MB
export const MAX_CONTEXT_TOKENS = 8000;
