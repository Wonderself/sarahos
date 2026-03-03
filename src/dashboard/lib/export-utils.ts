// ─── Export Utilities ─────────────────────────────────────
// CSV, JSON, and PDF export with browser download triggers.

/**
 * Trigger a browser download from a Blob.
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape a value for CSV (handles commas, quotes, newlines).
 */
function escapeCSV(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export an array of objects as a CSV file and trigger download.
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (!data || data.length === 0) return;

  // Collect all unique headers
  const headers = Array.from(
    data.reduce<Set<string>>((keys, row) => {
      Object.keys(row).forEach((k) => keys.add(k));
      return keys;
    }, new Set()),
  );

  const lines: string[] = [];

  // Header row
  lines.push(headers.map(escapeCSV).join(','));

  // Data rows
  for (const row of data) {
    const values = headers.map((h) => escapeCSV(row[h]));
    lines.push(values.join(','));
  }

  const csvContent = lines.join('\r\n');

  // BOM for proper UTF-8 display in Excel
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

  const safeName = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  triggerDownload(blob, safeName);
}

/**
 * Export any data as a formatted JSON file and trigger download.
 */
export function exportToJSON(data: unknown, filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });

  const safeName = filename.endsWith('.json') ? filename : `${filename}.json`;
  triggerDownload(blob, safeName);
}

/**
 * Build a minimal valid PDF as a binary string.
 * This constructs a simple PDF with a title and table rows
 * using raw PDF operators (no external library needed).
 */
export function exportToPDF(title: string, headers: string[], rows: string[][]): void {
  // Helper to encode text for PDF (basic Latin encoding)
  function pdfEscape(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      // Replace accented chars with their base equivalents for basic PDF
      .replace(/[eE]\u0300/g, (m) => (m[0] === 'e' ? 'e' : 'E'))
      .replace(/[\u00e0]/g, 'a')
      .replace(/[\u00e2]/g, 'a')
      .replace(/[\u00e9]/g, 'e')
      .replace(/[\u00e8]/g, 'e')
      .replace(/[\u00ea]/g, 'e')
      .replace(/[\u00eb]/g, 'e')
      .replace(/[\u00ee]/g, 'i')
      .replace(/[\u00ef]/g, 'i')
      .replace(/[\u00f4]/g, 'o')
      .replace(/[\u00f9]/g, 'u')
      .replace(/[\u00fb]/g, 'u')
      .replace(/[\u00fc]/g, 'u')
      .replace(/[\u00e7]/g, 'c')
      .replace(/[\u00c9]/g, 'E')
      .replace(/[\u00c8]/g, 'E')
      .replace(/[\u00ca]/g, 'E')
      .replace(/[\u00c0]/g, 'A')
      .replace(/[\u00c2]/g, 'A');
  }

  // Build page content stream
  const pageWidth = 595; // A4 width in points
  const margin = 50;
  const usableWidth = pageWidth - margin * 2;
  const colWidth = headers.length > 0 ? usableWidth / headers.length : usableWidth;
  let yPos = 780;

  let contentStream = '';

  // Title
  contentStream += 'BT\n';
  contentStream += '/F1 18 Tf\n';
  contentStream += `${margin} ${yPos} Td\n`;
  contentStream += `(${pdfEscape(title)}) Tj\n`;
  contentStream += 'ET\n';
  yPos -= 30;

  // Date line
  contentStream += 'BT\n';
  contentStream += '/F1 10 Tf\n';
  contentStream += `${margin} ${yPos} Td\n`;
  contentStream += `(${pdfEscape(formatDate(new Date()))}) Tj\n`;
  contentStream += 'ET\n';
  yPos -= 24;

  // Header row separator
  contentStream += `${margin} ${yPos} m ${pageWidth - margin} ${yPos} l S\n`;
  yPos -= 16;

  // Table headers
  contentStream += 'BT\n';
  contentStream += '/F1 11 Tf\n';
  headers.forEach((header, i) => {
    const x = margin + i * colWidth;
    contentStream += `${x} ${yPos} Td\n`;
    contentStream += `(${pdfEscape(header)}) Tj\n`;
    // Reset position for next column
    contentStream += `${-x + margin + (i + 1) * colWidth} 0 Td\n`;
  });
  contentStream += 'ET\n';
  yPos -= 4;

  // Header underline
  contentStream += `${margin} ${yPos} m ${pageWidth - margin} ${yPos} l S\n`;
  yPos -= 16;

  // Data rows
  for (const row of rows) {
    if (yPos < 60) break; // Stop before going off page

    contentStream += 'BT\n';
    contentStream += '/F1 10 Tf\n';
    row.forEach((cell, i) => {
      const x = margin + i * colWidth;
      // Truncate cell if too long
      const truncated = cell.length > 30 ? cell.substring(0, 27) + '...' : cell;
      contentStream += `${x} ${yPos} Td\n`;
      contentStream += `(${pdfEscape(truncated)}) Tj\n`;
      contentStream += `${-x + margin + (i + 1) * colWidth} 0 Td\n`;
    });
    contentStream += 'ET\n';
    yPos -= 16;
  }

  // Build PDF structure
  const objects: string[] = [];
  const offsets: number[] = [];
  let pdf = '%PDF-1.4\n';

  // Object 1: Catalog
  offsets.push(pdf.length);
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  pdf += obj1;
  objects.push(obj1);

  // Object 2: Pages
  offsets.push(pdf.length);
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  pdf += obj2;
  objects.push(obj2);

  // Object 3: Page
  offsets.push(pdf.length);
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n';
  pdf += obj3;
  objects.push(obj3);

  // Object 4: Content stream
  offsets.push(pdf.length);
  const obj4 = `4 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`;
  pdf += obj4;
  objects.push(obj4);

  // Object 5: Font
  offsets.push(pdf.length);
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
  pdf += obj5;
  objects.push(obj5);

  // Cross-reference table
  const xrefOffset = pdf.length;
  pdf += 'xref\n';
  pdf += `0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }

  // Trailer
  pdf += 'trailer\n';
  pdf += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += 'startxref\n';
  pdf += `${xrefOffset}\n`;
  pdf += '%%EOF\n';

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const safeName = title.replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf';
  triggerDownload(blob, safeName);
}

/**
 * Format a date for export purposes.
 * Defaults to French locale (fr-FR).
 */
export function formatDate(date: string | Date, locale: string = 'fr-FR'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return String(date);
  }

  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
