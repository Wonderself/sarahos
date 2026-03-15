import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

if (typeof window !== 'undefined') {
  const vfs = (pdfFonts as Record<string, unknown>).pdfMake;
  (pdfMake as Record<string, unknown>).vfs = vfs
    ? (vfs as Record<string, unknown>).vfs
    : pdfFonts;
}

export interface DiplomaParams {
  userName: string;
  parcoursTitle: string;
  diplomaTitle: string;
  date: string;
  score: number;
  totalXP: number;
  color: string;
  modulesCompleted: number;
  totalModules: number;
}

/**
 * Convert a hex color to RGB values.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return { r, g, b };
}

/**
 * Lighten a hex color by a given factor (0 = no change, 1 = white).
 */
function lightenColor(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);
  const lr = Math.round(r + (255 - r) * factor);
  const lg = Math.round(g + (255 - g) * factor);
  const lb = Math.round(b + (255 - b) * factor);
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

/**
 * Generate a professional diploma PDF as a downloadable Blob.
 */
export function generateDiplomaPDF(params: DiplomaParams): Promise<Blob> {
  const {
    userName,
    parcoursTitle,
    diplomaTitle,
    date,
    score,
    totalXP,
    color,
    modulesCompleted,
    totalModules,
  } = params;

  const lightBg = lightenColor(color, 0.92);

  const docDefinition: Parameters<typeof pdfMake.createPdf>[0] = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [50, 50, 50, 50],
    background: [
      // Outer border
      {
        canvas: [
          {
            type: 'rect',
            x: 20,
            y: 20,
            w: 802,
            h: 555,
            lineWidth: 3,
            lineColor: color,
          },
          // Inner border
          {
            type: 'rect',
            x: 28,
            y: 28,
            w: 786,
            h: 539,
            lineWidth: 1,
            lineColor: color,
          },
          // Corner accents — top-left
          {
            type: 'line',
            x1: 20, y1: 40,
            x2: 40, y2: 20,
            lineWidth: 2,
            lineColor: color,
          },
          // Corner accents — top-right
          {
            type: 'line',
            x1: 802, y1: 20,
            x2: 822, y2: 40,
            lineWidth: 2,
            lineColor: color,
          },
          // Corner accents — bottom-left
          {
            type: 'line',
            x1: 20, y1: 555,
            x2: 40, y2: 575,
            lineWidth: 2,
            lineColor: color,
          },
          // Corner accents — bottom-right
          {
            type: 'line',
            x1: 802, y1: 575,
            x2: 822, y2: 555,
            lineWidth: 2,
            lineColor: color,
          },
        ],
      },
    ],
    content: [
      // Header: brand
      {
        text: 'freenzy.io',
        fontSize: 14,
        bold: true,
        color: '#1A1A1A',
        alignment: 'center' as const,
        margin: [0, 10, 0, 0],
      },
      {
        text: 'Formation IA',
        fontSize: 10,
        color: '#6B6B6B',
        alignment: 'center' as const,
        margin: [0, 2, 0, 20],
      },

      // Main title
      {
        text: 'CERTIFICAT DE FORMATION',
        fontSize: 28,
        bold: true,
        color: color,
        alignment: 'center' as const,
        characterSpacing: 3,
        margin: [0, 0, 0, 8],
      },

      // Decorative separator line
      {
        canvas: [
          {
            type: 'line',
            x1: 220,
            y1: 0,
            x2: 520,
            y2: 0,
            lineWidth: 2,
            lineColor: color,
          },
        ],
        margin: [0, 0, 0, 25],
      },

      // "Ce certificat est décerné à"
      {
        text: 'Ce certificat est décerné à',
        fontSize: 14,
        color: '#6B6B6B',
        alignment: 'center' as const,
        margin: [0, 0, 0, 8],
      },

      // User name
      {
        text: userName,
        fontSize: 24,
        bold: true,
        color: '#1A1A1A',
        alignment: 'center' as const,
        margin: [0, 0, 0, 12],
      },

      // "Pour avoir complété avec succès"
      {
        text: 'Pour avoir complété avec succès',
        fontSize: 14,
        color: '#6B6B6B',
        alignment: 'center' as const,
        margin: [0, 0, 0, 6],
      },

      // Parcours title
      {
        text: parcoursTitle,
        fontSize: 18,
        italics: true,
        color: '#1A1A1A',
        alignment: 'center' as const,
        margin: [0, 0, 0, 16],
      },

      // Diploma title badge (simulated rounded badge via table)
      {
        table: {
          widths: ['auto'],
          body: [
            [
              {
                text: diplomaTitle,
                fontSize: 13,
                bold: true,
                color: '#FFFFFF',
                alignment: 'center' as const,
                margin: [24, 8, 24, 8],
                fillColor: color,
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
          fillColor: () => color,
        },
        alignment: 'center' as const,
        margin: [0, 0, 0, 20],
      },

      // Stats row
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              {
                text: [
                  { text: 'Score\n', fontSize: 9, color: '#6B6B6B' },
                  { text: `${score}%`, fontSize: 16, bold: true, color: color },
                ],
                alignment: 'center' as const,
                fillColor: lightBg,
                margin: [0, 8, 0, 8],
                border: [false, false, false, false],
              },
              {
                text: [
                  { text: 'XP gagnés\n', fontSize: 9, color: '#6B6B6B' },
                  { text: `${totalXP.toLocaleString('fr-FR')}`, fontSize: 16, bold: true, color: color },
                ],
                alignment: 'center' as const,
                fillColor: lightBg,
                margin: [0, 8, 0, 8],
                border: [false, false, false, false],
              },
              {
                text: [
                  { text: 'Modules\n', fontSize: 9, color: '#6B6B6B' },
                  { text: `${modulesCompleted}/${totalModules}`, fontSize: 16, bold: true, color: color },
                ],
                alignment: 'center' as const,
                fillColor: lightBg,
                margin: [0, 8, 0, 8],
                border: [false, false, false, false],
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 0,
          paddingBottom: () => 0,
        },
        margin: [80, 0, 80, 20],
      },

      // Date
      {
        text: `Délivré le ${date}`,
        fontSize: 12,
        color: '#6B6B6B',
        alignment: 'center' as const,
        margin: [0, 0, 0, 20],
      },

      // Bottom section: QR placeholder + footer
      {
        columns: [
          { width: '*', text: '' },
          // QR code placeholder
          {
            width: 50,
            table: {
              widths: [50],
              heights: [50],
              body: [
                [
                  {
                    text: 'QR',
                    fontSize: 10,
                    bold: true,
                    color: '#9B9B9B',
                    alignment: 'center' as const,
                    margin: [0, 16, 0, 0],
                    fillColor: '#F5F5F5',
                    border: [true, true, true, true],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#E5E5E5',
              vLineColor: () => '#E5E5E5',
              paddingLeft: () => 0,
              paddingRight: () => 0,
              paddingTop: () => 0,
              paddingBottom: () => 0,
            },
          },
          { width: '*', text: '' },
        ],
        margin: [0, 0, 0, 8],
      },

      // Footer text
      {
        text: 'Freenzy.io — Plateforme de formation IA',
        fontSize: 9,
        color: '#9B9B9B',
        alignment: 'center' as const,
        margin: [0, 0, 0, 2],
      },
      {
        text: 'Vérifiable sur freenzy.io/verify',
        fontSize: 8,
        color: '#9B9B9B',
        alignment: 'center' as const,
      },
    ],
  };

  const pdfDoc = pdfMake.createPdf(
    docDefinition as unknown as Parameters<typeof pdfMake.createPdf>[0]
  );
  return pdfDoc.getBlob();
}
