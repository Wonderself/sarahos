/**
 * DocumentGenerationService — Generates professional PDF documents using pdfmake.
 * Supports: devis, facture, contrat, rapport, attestation.
 * Each document respects branding (colors, logo, company info).
 */

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

if (typeof window !== 'undefined') {
  const vfs = (pdfFonts as Record<string, unknown>).pdfMake;
  (pdfMake as Record<string, unknown>).vfs =
    vfs && typeof vfs === 'object' && 'vfs' in (vfs as Record<string, unknown>)
      ? (vfs as Record<string, Record<string, string>>).vfs
      : pdfFonts;
}

// ─── Types ────────────────────────────────────────────────────

export type DocumentType = 'devis' | 'facture' | 'contrat' | 'rapport' | 'attestation';

export interface Branding {
  logo?: string; // base64 data URI
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  tonMarque: string;
  companyName: string;
  companyAddress: string;
  companySiret: string;
  companyPhone: string;
  companyEmail: string;
}

export interface GenerateParams {
  type: DocumentType;
  data: Record<string, unknown>;
  branding?: Branding;
}

export interface DevisItem {
  designation: string;
  quantite: number;
  prixUnitaireHT: number;
}

export interface DevisData {
  reference: string;
  date: string;
  validite: string;
  clientNom: string;
  clientAdresse: string;
  clientEmail: string;
  items: DevisItem[];
  conditionsPaiement: string;
  notes: string;
}

export interface FactureData {
  numero: string;
  date: string;
  dateEcheance: string;
  clientNom: string;
  clientAdresse: string;
  clientEmail: string;
  items: DevisItem[];
  conditionsPaiement: string;
  notes: string;
}

export interface ContratData {
  titre: string;
  date: string;
  partie1: string;
  partie2: string;
  articles: Array<{ titre: string; contenu: string }>;
  lieuSignature: string;
}

export interface RapportData {
  titre: string;
  date: string;
  auteur: string;
  sections: Array<{ titre: string; contenu: string }>;
  conclusion: string;
}

export interface AttestationData {
  titre: string;
  date: string;
  beneficiaire: string;
  objet: string;
  contenu: string;
  lieu: string;
  signataire: string;
  fonction: string;
}

// ─── Defaults ─────────────────────────────────────────────────

const DEFAULT_BRANDING: Branding = {
  primaryColor: '#0EA5E9',
  secondaryColor: '#6B6B6B',
  accentColor: '#0EA5E9',
  fontFamily: 'Helvetica',
  tonMarque: 'Formel',
  companyName: 'Mon Entreprise',
  companyAddress: '1 Rue Exemple, 75001 Paris',
  companySiret: '000 000 000 00000',
  companyPhone: '+33 1 00 00 00 00',
  companyEmail: 'contact@monentreprise.fr',
};

const DISCLAIMER = 'Ce document est fourni a titre indicatif. Il ne constitue pas un engagement contractuel sauf signature des deux parties.';

// ─── Helpers ──────────────────────────────────────────────────

type PdfContent = Record<string, unknown>;
type PdfColumn = Record<string, unknown>;

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgb(${r},${g},${b})`;
}

function getBranding(partial?: Branding): Branding {
  if (!partial) return { ...DEFAULT_BRANDING };
  return { ...DEFAULT_BRANDING, ...partial };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}

function buildHeader(branding: Branding): PdfContent {
  const columns: PdfColumn[] = [];

  if (branding.logo) {
    columns.push({
      image: branding.logo,
      width: 80,
      margin: [0, 0, 16, 0],
    });
  }

  columns.push({
    stack: [
      { text: branding.companyName, fontSize: 16, bold: true, color: branding.primaryColor },
      { text: branding.companyAddress, fontSize: 9, color: '#6B6B6B', margin: [0, 2, 0, 0] },
      { text: `Tel: ${branding.companyPhone}  |  Email: ${branding.companyEmail}`, fontSize: 8, color: '#9B9B9B', margin: [0, 2, 0, 0] },
      { text: `SIRET: ${branding.companySiret}`, fontSize: 8, color: '#9B9B9B', margin: [0, 2, 0, 0] },
    ],
    width: '*',
  });

  return {
    columns,
    margin: [0, 0, 0, 8],
  };
}

function buildHeaderBar(branding: Branding): PdfContent {
  return {
    canvas: [
      {
        type: 'rect',
        x: 0,
        y: 0,
        w: 515,
        h: 3,
        color: branding.primaryColor,
      },
    ],
    margin: [0, 0, 0, 16],
  };
}

function buildFooter(branding: Branding): PdfContent {
  return {
    stack: [
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#E5E5E5' },
        ],
        margin: [0, 0, 0, 8],
      },
      { text: DISCLAIMER, fontSize: 7, color: '#9B9B9B', italics: true, alignment: 'center' },
      {
        text: `${branding.companyName} — ${branding.companySiret}`,
        fontSize: 7,
        color: '#9B9B9B',
        alignment: 'center',
        margin: [0, 4, 0, 0],
      },
    ],
    margin: [0, 20, 0, 0],
  };
}

function buildClientBlock(nom: string, adresse: string, email: string): PdfContent {
  return {
    stack: [
      { text: 'CLIENT', fontSize: 9, bold: true, color: '#6B6B6B', margin: [0, 0, 0, 4] },
      { text: nom, fontSize: 11, bold: true, color: '#1A1A1A' },
      { text: adresse, fontSize: 9, color: '#6B6B6B', margin: [0, 2, 0, 0] },
      { text: email, fontSize: 9, color: '#6B6B6B', margin: [0, 2, 0, 0] },
    ],
    margin: [0, 0, 0, 16],
  };
}

function buildItemsTable(items: DevisItem[], branding: Branding): PdfContent {
  const headerBg = branding.primaryColor;
  const headerColor = '#FFFFFF';

  const tableBody: unknown[][] = [
    [
      { text: 'Designation', bold: true, fontSize: 9, color: headerColor, fillColor: headerBg, margin: [4, 6, 4, 6] },
      { text: 'Qte', bold: true, fontSize: 9, color: headerColor, fillColor: headerBg, alignment: 'center', margin: [4, 6, 4, 6] },
      { text: 'PU HT', bold: true, fontSize: 9, color: headerColor, fillColor: headerBg, alignment: 'right', margin: [4, 6, 4, 6] },
      { text: 'Total HT', bold: true, fontSize: 9, color: headerColor, fillColor: headerBg, alignment: 'right', margin: [4, 6, 4, 6] },
    ],
  ];

  let totalHT = 0;
  for (const item of items) {
    const lineTotal = item.quantite * item.prixUnitaireHT;
    totalHT += lineTotal;
    const rowBg = items.indexOf(item) % 2 === 0 ? '#FAFAFA' : '#FFFFFF';
    tableBody.push([
      { text: item.designation, fontSize: 9, color: '#1A1A1A', fillColor: rowBg, margin: [4, 4, 4, 4] },
      { text: String(item.quantite), fontSize: 9, color: '#1A1A1A', fillColor: rowBg, alignment: 'center', margin: [4, 4, 4, 4] },
      { text: formatCurrency(item.prixUnitaireHT), fontSize: 9, color: '#1A1A1A', fillColor: rowBg, alignment: 'right', margin: [4, 4, 4, 4] },
      { text: formatCurrency(lineTotal), fontSize: 9, color: '#1A1A1A', fillColor: rowBg, alignment: 'right', margin: [4, 4, 4, 4] },
    ]);
  }

  const tva = totalHT * 0.2;
  const totalTTC = totalHT + tva;

  return {
    stack: [
      {
        table: {
          headerRows: 1,
          widths: ['*', 50, 80, 80],
          body: tableBody,
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#E5E5E5',
          vLineColor: () => '#E5E5E5',
        },
      },
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 200,
            stack: [
              {
                columns: [
                  { text: 'Total HT', fontSize: 9, color: '#6B6B6B', width: '*' },
                  { text: formatCurrency(totalHT), fontSize: 9, color: '#1A1A1A', alignment: 'right', width: 80 },
                ],
                margin: [0, 8, 0, 2],
              },
              {
                columns: [
                  { text: 'TVA (20%)', fontSize: 9, color: '#6B6B6B', width: '*' },
                  { text: formatCurrency(tva), fontSize: 9, color: '#1A1A1A', alignment: 'right', width: 80 },
                ],
                margin: [0, 2, 0, 2],
              },
              {
                canvas: [
                  { type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1, lineColor: branding.primaryColor },
                ],
                margin: [0, 4, 0, 4],
              },
              {
                columns: [
                  { text: 'Total TTC', fontSize: 11, bold: true, color: '#1A1A1A', width: '*' },
                  { text: formatCurrency(totalTTC), fontSize: 11, bold: true, color: branding.primaryColor, alignment: 'right', width: 80 },
                ],
              },
            ],
          },
        ],
        margin: [0, 0, 0, 16],
      },
    ],
  };
}

// ─── Document Generators ──────────────────────────────────────

function generateDevis(data: Record<string, unknown>, branding?: Branding): Record<string, unknown> {
  const b = getBranding(branding);
  const d = data as unknown as DevisData;

  const items = d.items || [];
  const reference = d.reference || `DEV-${Date.now().toString(36).toUpperCase()}`;
  const date = d.date || new Date().toLocaleDateString('fr-FR');
  const validite = d.validite || '30 jours';

  return {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    content: [
      buildHeader(b),
      buildHeaderBar(b),
      {
        columns: [
          buildClientBlock(d.clientNom || 'Client', d.clientAdresse || '', d.clientEmail || ''),
          {
            stack: [
              { text: 'DEVIS', fontSize: 22, bold: true, color: b.primaryColor, alignment: 'right' },
              { text: `Ref: ${reference}`, fontSize: 9, color: '#6B6B6B', alignment: 'right', margin: [0, 4, 0, 0] },
              { text: `Date: ${date}`, fontSize: 9, color: '#6B6B6B', alignment: 'right', margin: [0, 2, 0, 0] },
              { text: `Validite: ${validite}`, fontSize: 9, color: '#6B6B6B', alignment: 'right', margin: [0, 2, 0, 0] },
            ],
            width: 'auto',
          },
        ],
        margin: [0, 0, 0, 20],
      },
      buildItemsTable(items, b),
      d.conditionsPaiement
        ? {
            stack: [
              { text: 'Conditions de paiement', fontSize: 10, bold: true, color: '#1A1A1A', margin: [0, 0, 0, 4] },
              { text: d.conditionsPaiement, fontSize: 9, color: '#6B6B6B' },
            ],
            margin: [0, 0, 0, 12],
          }
        : { text: '' },
      d.notes
        ? {
            stack: [
              { text: 'Notes', fontSize: 10, bold: true, color: '#1A1A1A', margin: [0, 0, 0, 4] },
              { text: d.notes, fontSize: 9, color: '#6B6B6B' },
            ],
            margin: [0, 0, 0, 12],
          }
        : { text: '' },
      buildFooter(b),
    ],
  };
}

function generateFacture(data: Record<string, unknown>, branding?: Branding): Record<string, unknown> {
  const b = getBranding(branding);
  const d = data as unknown as FactureData;

  const items = d.items || [];
  const numero = d.numero || `FAC-${Date.now().toString(36).toUpperCase()}`;
  const date = d.date || new Date().toLocaleDateString('fr-FR');
  const dateEcheance = d.dateEcheance || '';

  return {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    content: [
      buildHeader(b),
      buildHeaderBar(b),
      {
        columns: [
          buildClientBlock(d.clientNom || 'Client', d.clientAdresse || '', d.clientEmail || ''),
          {
            stack: [
              { text: 'FACTURE', fontSize: 22, bold: true, color: b.primaryColor, alignment: 'right' },
              { text: `N: ${numero}`, fontSize: 9, color: '#6B6B6B', alignment: 'right', margin: [0, 4, 0, 0] },
              { text: `Date: ${date}`, fontSize: 9, color: '#6B6B6B', alignment: 'right', margin: [0, 2, 0, 0] },
              dateEcheance
                ? { text: `Echeance: ${dateEcheance}`, fontSize: 9, color: '#DC2626', alignment: 'right', margin: [0, 2, 0, 0] }
                : { text: '' },
            ],
            width: 'auto',
          },
        ],
        margin: [0, 0, 0, 20],
      },
      buildItemsTable(items, b),
      d.conditionsPaiement
        ? {
            stack: [
              { text: 'Conditions de paiement', fontSize: 10, bold: true, color: '#1A1A1A', margin: [0, 0, 0, 4] },
              { text: d.conditionsPaiement, fontSize: 9, color: '#6B6B6B' },
            ],
            margin: [0, 0, 0, 12],
          }
        : { text: '' },
      buildFooter(b),
    ],
  };
}

function generateContrat(data: Record<string, unknown>, branding?: Branding): Record<string, unknown> {
  const b = getBranding(branding);
  const d = data as unknown as ContratData;

  const articles = d.articles || [];
  const date = d.date || new Date().toLocaleDateString('fr-FR');

  const articleBlocks: PdfContent[] = articles.map((article, index) => ({
    stack: [
      { text: `Article ${index + 1} — ${article.titre}`, fontSize: 11, bold: true, color: '#1A1A1A', margin: [0, 12, 0, 4] },
      { text: article.contenu, fontSize: 9, color: '#6B6B6B', lineHeight: 1.5 },
    ],
  }));

  return {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    content: [
      buildHeader(b),
      buildHeaderBar(b),
      { text: d.titre || 'CONTRAT', fontSize: 20, bold: true, color: b.primaryColor, alignment: 'center', margin: [0, 0, 0, 8] },
      { text: `Date: ${date}`, fontSize: 9, color: '#6B6B6B', alignment: 'center', margin: [0, 0, 0, 16] },
      {
        stack: [
          { text: 'ENTRE LES PARTIES', fontSize: 10, bold: true, color: '#1A1A1A', margin: [0, 0, 0, 6] },
          { text: `Partie 1 : ${d.partie1 || '___'}`, fontSize: 9, color: '#6B6B6B', margin: [0, 0, 0, 2] },
          { text: `Partie 2 : ${d.partie2 || '___'}`, fontSize: 9, color: '#6B6B6B' },
        ],
        margin: [0, 0, 0, 12],
      },
      ...articleBlocks,
      {
        stack: [
          {
            canvas: [
              { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#E5E5E5' },
            ],
            margin: [0, 24, 0, 12],
          },
          { text: `Fait a ${d.lieuSignature || '___'}, le ${date}`, fontSize: 9, color: '#6B6B6B', margin: [0, 0, 0, 20] },
          {
            columns: [
              {
                stack: [
                  { text: 'Partie 1', fontSize: 9, bold: true, color: '#1A1A1A' },
                  { text: d.partie1 || '___', fontSize: 9, color: '#6B6B6B', margin: [0, 4, 0, 0] },
                  { text: '\n\n\n_________________________', fontSize: 9, color: '#9B9B9B' },
                  { text: 'Signature', fontSize: 8, color: '#9B9B9B', margin: [0, 2, 0, 0] },
                ],
              },
              {
                stack: [
                  { text: 'Partie 2', fontSize: 9, bold: true, color: '#1A1A1A' },
                  { text: d.partie2 || '___', fontSize: 9, color: '#6B6B6B', margin: [0, 4, 0, 0] },
                  { text: '\n\n\n_________________________', fontSize: 9, color: '#9B9B9B' },
                  { text: 'Signature', fontSize: 8, color: '#9B9B9B', margin: [0, 2, 0, 0] },
                ],
              },
            ],
          },
        ],
      },
      buildFooter(b),
    ],
  };
}

function generateRapport(data: Record<string, unknown>, branding?: Branding): Record<string, unknown> {
  const b = getBranding(branding);
  const d = data as unknown as RapportData;

  const date = d.date || new Date().toLocaleDateString('fr-FR');
  const sections = d.sections || [];

  const sectionBlocks: PdfContent[] = sections.map((section, index) => ({
    stack: [
      { text: `${index + 1}. ${section.titre}`, fontSize: 12, bold: true, color: '#1A1A1A', margin: [0, 14, 0, 6] },
      { text: section.contenu, fontSize: 9, color: '#6B6B6B', lineHeight: 1.6 },
    ],
  }));

  return {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    content: [
      buildHeader(b),
      buildHeaderBar(b),
      { text: d.titre || 'RAPPORT', fontSize: 22, bold: true, color: b.primaryColor, alignment: 'center', margin: [0, 16, 0, 4] },
      { text: `Par ${d.auteur || b.companyName}  —  ${date}`, fontSize: 9, color: '#9B9B9B', alignment: 'center', margin: [0, 0, 0, 24] },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#E5E5E5' },
        ],
        margin: [0, 0, 0, 8],
      },
      // Table of contents
      sections.length > 0
        ? {
            stack: [
              { text: 'Sommaire', fontSize: 11, bold: true, color: '#1A1A1A', margin: [0, 0, 0, 6] },
              ...sections.map((s, i) => ({
                text: `${i + 1}. ${s.titre}`,
                fontSize: 9,
                color: b.primaryColor,
                margin: [8, 2, 0, 2] as number[],
              })),
            ],
            margin: [0, 0, 0, 16],
          }
        : { text: '' },
      ...sectionBlocks,
      d.conclusion
        ? {
            stack: [
              {
                canvas: [
                  { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#E5E5E5' },
                ],
                margin: [0, 16, 0, 8],
              },
              { text: 'Conclusion', fontSize: 12, bold: true, color: '#1A1A1A', margin: [0, 0, 0, 6] },
              { text: d.conclusion, fontSize: 9, color: '#6B6B6B', lineHeight: 1.6 },
            ],
          }
        : { text: '' },
      buildFooter(b),
    ],
  };
}

function generateAttestation(data: Record<string, unknown>, branding?: Branding): Record<string, unknown> {
  const b = getBranding(branding);
  const d = data as unknown as AttestationData;

  const date = d.date || new Date().toLocaleDateString('fr-FR');

  return {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    content: [
      buildHeader(b),
      buildHeaderBar(b),
      { text: d.titre || 'ATTESTATION', fontSize: 20, bold: true, color: b.primaryColor, alignment: 'center', margin: [0, 20, 0, 20] },
      {
        stack: [
          { text: `Je soussigne(e), ${d.signataire || '___'},`, fontSize: 10, color: '#1A1A1A', lineHeight: 1.8 },
          d.fonction
            ? { text: `Agissant en qualite de ${d.fonction},`, fontSize: 10, color: '#1A1A1A', lineHeight: 1.8 }
            : { text: '' },
          { text: `Atteste par la presente que :`, fontSize: 10, color: '#1A1A1A', lineHeight: 1.8, margin: [0, 8, 0, 8] },
        ],
        margin: [0, 0, 0, 8],
      },
      d.beneficiaire
        ? { text: `Beneficiaire : ${d.beneficiaire}`, fontSize: 10, bold: true, color: '#1A1A1A', margin: [0, 0, 0, 8] }
        : { text: '' },
      d.objet
        ? {
            stack: [
              { text: 'Objet :', fontSize: 10, bold: true, color: '#1A1A1A', margin: [0, 0, 0, 4] },
              { text: d.objet, fontSize: 10, color: '#6B6B6B', lineHeight: 1.6 },
            ],
            margin: [0, 0, 0, 12],
          }
        : { text: '' },
      d.contenu
        ? { text: d.contenu, fontSize: 10, color: '#6B6B6B', lineHeight: 1.6, margin: [0, 0, 0, 16] }
        : { text: '' },
      {
        stack: [
          { text: `Fait a ${d.lieu || '___'}, le ${date}`, fontSize: 9, color: '#6B6B6B', margin: [0, 20, 0, 16] },
          { text: 'Signature et cachet :', fontSize: 9, bold: true, color: '#1A1A1A', margin: [0, 0, 0, 8] },
          {
            canvas: [
              { type: 'rect', x: 0, y: 0, w: 180, h: 80, lineWidth: 1, lineColor: '#E5E5E5' },
            ],
          },
          { text: d.signataire || '___', fontSize: 9, color: '#6B6B6B', margin: [0, 8, 0, 0] },
          d.fonction
            ? { text: d.fonction, fontSize: 8, color: '#9B9B9B', margin: [0, 2, 0, 0] }
            : { text: '' },
        ],
      },
      buildFooter(b),
    ],
  };
}

// ─── Main Generator ───────────────────────────────────────────

function generatePDF(params: GenerateParams): Promise<Blob> {
  const { type, data, branding } = params;

  let docDefinition: Record<string, unknown>;

  switch (type) {
    case 'devis':
      docDefinition = generateDevis(data, branding);
      break;
    case 'facture':
      docDefinition = generateFacture(data, branding);
      break;
    case 'contrat':
      docDefinition = generateContrat(data, branding);
      break;
    case 'rapport':
      docDefinition = generateRapport(data, branding);
      break;
    case 'attestation':
      docDefinition = generateAttestation(data, branding);
      break;
    default:
      throw new Error(`Type de document inconnu: ${type}`);
  }

  const pdfDoc = pdfMake.createPdf(docDefinition as unknown as Parameters<typeof pdfMake.createPdf>[0]);
  return pdfDoc.getBlob();
}

// ─── Exported Service ─────────────────────────────────────────

export const DocumentService = {
  generatePDF,
  generateDevis,
  generateFacture,
  generateContrat,
  generateRapport,
  generateAttestation,
};

void hexToRgb;
