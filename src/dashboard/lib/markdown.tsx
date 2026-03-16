'use client';

import React from 'react';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Shared markdown renderer for chat messages.
 * Converts a subset of markdown to sanitised HTML with inline styles.
 * Palette: #1A1A1A text, #6B6B6B secondary, #E5E5E5 borders, #0EA5E9 links.
 */

/* ------------------------------------------------------------------ */
/*  Markdown → HTML conversion (lightweight, no external lib needed)  */
/* ------------------------------------------------------------------ */

function markdownToHtml(md: string): string {
  if (!md) return '';

  let html = md;

  // --- fenced code blocks (``` … ```) ---------------------------------
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    const escaped = escapeHtml(code.replace(/\n$/, ''));
    return `<pre style="background:#1A1A1A;color:#E5E5E5;padding:16px;border-radius:8px;overflow-x:auto;font-family:'Fira Code',Consolas,Monaco,'Courier New',monospace;font-size:13px;line-height:1.5;margin:8px 0"><code>${escaped}</code></pre>`;
  });

  // --- inline code (`…`) ---------------------------------------------
  html = html.replace(/`([^`\n]+)`/g, (_m, code) => {
    const escaped = escapeHtml(code);
    return `<code style="background:#F5F5F5;padding:2px 6px;border-radius:4px;font-family:'Fira Code',Consolas,Monaco,'Courier New',monospace;font-size:0.9em">${escaped}</code>`;
  });

  // --- headings (## … / ### …) — processed per-line below -----------
  // We handle headings in the line-by-line pass.

  // --- bold + italic combined (***text*** or ___text___) -------------
  html = html.replace(/\*{3}(.+?)\*{3}/g, '<strong><em>$1</em></strong>');
  html = html.replace(/_{3}(.+?)_{3}/g, '<strong><em>$1</em></strong>');

  // --- bold (**text** or __text__) -----------------------------------
  html = html.replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>');
  html = html.replace(/_{2}(.+?)_{2}/g, '<strong>$1</strong>');

  // --- italic (*text* or _text_) -------------------------------------
  html = html.replace(/(?<!\w)\*([^*\n]+)\*(?!\w)/g, '<em>$1</em>');
  html = html.replace(/(?<!\w)_([^_\n]+)_(?!\w)/g, '<em>$1</em>');

  // --- links [text](url) --------------------------------------------
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#0EA5E9;text-decoration:underline">$1</a>',
  );

  // --- horizontal rules (--- or *** or ___) --------------------------
  html = html.replace(/^([-*_]){3,}\s*$/gm, '<hr style="border:none;border-top:1px solid #E5E5E5;margin:12px 0"/>');

  // --- line-by-line: headings, lists, blockquotes, paragraphs --------
  const lines = html.split('\n');
  const out: string[] = [];
  let inUl = false;
  let inOl = false;
  let inBlockquote = false;

  function closeLists() {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  }
  function closeBlockquote() {
    if (inBlockquote) { out.push('</blockquote>'); inBlockquote = false; }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // skip lines that are part of a <pre> block (already converted)
    if (line.includes('<pre ') || line.includes('</pre>')) {
      closeLists();
      closeBlockquote();
      out.push(line);
      continue;
    }

    // --- headings ----------------------------------------------------
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      closeLists();
      closeBlockquote();
      const level = headingMatch[1].length;
      const sizes: Record<number, string> = { 1: '1.4em', 2: '1.25em', 3: '1.1em', 4: '1em' };
      out.push(`<h${level + 1} style="font-size:${sizes[level] || '1em'};font-weight:600;margin:12px 0 6px;color:#1A1A1A">${headingMatch[2]}</h${level + 1}>`);
      continue;
    }

    // --- blockquote --------------------------------------------------
    const bqMatch = line.match(/^>\s?(.*)$/);
    if (bqMatch) {
      closeLists();
      if (!inBlockquote) {
        out.push('<blockquote style="border-left:3px solid #E5E5E5;padding:4px 12px;margin:8px 0;color:#6B6B6B">');
        inBlockquote = true;
      }
      out.push(bqMatch[1] || '<br/>');
      continue;
    } else {
      closeBlockquote();
    }

    // --- unordered list ----------------------------------------------
    const ulMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
    if (ulMatch) {
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (!inUl) { out.push('<ul style="margin:6px 0;padding-left:24px">'); inUl = true; }
      out.push(`<li style="margin:2px 0">${ulMatch[1]}</li>`);
      continue;
    }

    // --- ordered list ------------------------------------------------
    const olMatch = line.match(/^[\s]*\d+[.)]\s+(.+)$/);
    if (olMatch) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (!inOl) { out.push('<ol style="margin:6px 0;padding-left:24px">'); inOl = true; }
      out.push(`<li style="margin:2px 0">${olMatch[1]}</li>`);
      continue;
    }

    // Close open lists on non-list line
    closeLists();

    // Empty line → line break
    if (line.trim() === '') {
      out.push('<br/>');
      continue;
    }

    // Regular text
    out.push(line);
  }

  closeLists();
  closeBlockquote();

  // Join with newlines converted to <br/> for remaining plain breaks,
  // but avoid double <br/> after block-level elements.
  let result = out.join('\n');

  // Convert remaining newlines to <br/> only between inline content
  // (not after block elements like </ul>, </ol>, </pre>, </h2>, etc.)
  result = result.replace(/(?<!\>)\n(?!\<)/g, '<br/>');
  // Clean up newlines adjacent to tags (keep structure clean)
  result = result.replace(/\n/g, '');

  return result;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ------------------------------------------------------------------ */
/*  React component                                                    */
/* ------------------------------------------------------------------ */

interface MarkdownContentProps {
  content: string;
  style?: React.CSSProperties;
}

export function MarkdownContent({ content, style }: MarkdownContentProps) {
  if (!content) {
    return null;
  }

  const rawHtml = markdownToHtml(content);
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ['target', 'rel'],
  });

  return (
    <div
      style={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        lineHeight: 1.6,
        color: '#1A1A1A',
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}

export default MarkdownContent;
