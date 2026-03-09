// ═══════════════════════════════════════════════════
//   FREENZY.IO — QR Code Generator
//   Pure canvas-based, zero dependencies
//   Supports alphanumeric & byte mode, EC level M
// ═══════════════════════════════════════════════════

// ─── Types ───

interface QROptions {
  size?: number;
  foreground?: string;
  background?: string;
}

// ─── Galois Field GF(256) for Reed-Solomon ───

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x = x << 1;
    if (x & 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

// ─── Reed-Solomon EC codewords ───

function rsGeneratorPoly(nsym: number): Uint8Array {
  let g = new Uint8Array([1]);
  for (let i = 0; i < nsym; i++) {
    const newG = new Uint8Array(g.length + 1);
    for (let j = 0; j < g.length; j++) {
      newG[j] ^= g[j];
      newG[j + 1] ^= gfMul(g[j], GF_EXP[i]);
    }
    g = newG;
  }
  return g;
}

function rsEncode(data: Uint8Array, nsym: number): Uint8Array {
  const gen = rsGeneratorPoly(nsym);
  const res = new Uint8Array(data.length + nsym);
  res.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return res.slice(data.length);
}

// ─── QR Constants ───

// Version info: [version, totalCodewords, ecCodewordsPerBlock, numBlocks, dataCodewordsPerBlock]
// Using EC level M
const VERSION_TABLE: [number, number, number, number, number][] = [
  [1,  26,  10, 1, 16],
  [2,  44,  16, 1, 28],
  [3,  70,  26, 1, 44],
  [4,  100, 18, 2, 32],
  [5,  134, 24, 2, 43],
  [6,  172, 16, 4, 27],
  [7,  196, 18, 4, 31],
  [8,  242, 22, 4, 38],
  [9,  292, 22, 4, 36],
  [10, 346, 26, 4, 43],
];

// Alignment pattern positions per version
const ALIGNMENT_POSITIONS: number[][] = [
  [],         // v1
  [6, 18],    // v2
  [6, 22],    // v3
  [6, 26],    // v4
  [6, 30],    // v5
  [6, 34],    // v6
  [6, 22, 38],// v7
  [6, 24, 42],// v8
  [6, 26, 46],// v9
  [6, 28, 52],// v10
];

// Format info bits for EC level M, mask 0-7
const FORMAT_INFO: number[] = [
  0x5412, 0x5125, 0x5E7C, 0x5B4B,
  0x45F9, 0x40CE, 0x4F97, 0x4AA0,
];

// ─── Data Encoding (Byte mode) ───

function encodeData(text: string, version: number): Uint8Array {
  const vInfo = VERSION_TABLE[version - 1];
  const dataCapacity = vInfo[3] * vInfo[4]; // numBlocks * dataCodewordsPerBlock

  // Byte mode indicator = 0100, char count (8 bits for v1-9, 16 bits for v10+)
  const bytes = new TextEncoder().encode(text);
  const bits: number[] = [];

  // Mode indicator: 0100 (byte mode)
  bits.push(0, 1, 0, 0);

  // Character count
  const countBits = version <= 9 ? 8 : 16;
  for (let i = countBits - 1; i >= 0; i--) {
    bits.push((bytes.length >> i) & 1);
  }

  // Data bits
  for (const b of bytes) {
    for (let i = 7; i >= 0; i--) {
      bits.push((b >> i) & 1);
    }
  }

  // Terminator (up to 4 zeros)
  const totalDataBits = dataCapacity * 8;
  const terminatorLen = Math.min(4, totalDataBits - bits.length);
  for (let i = 0; i < terminatorLen; i++) bits.push(0);

  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);

  // Convert to bytes
  const dataBytes = new Uint8Array(dataCapacity);
  for (let i = 0; i < bits.length / 8 && i < dataCapacity; i++) {
    let val = 0;
    for (let b = 0; b < 8; b++) {
      val = (val << 1) | (bits[i * 8 + b] || 0);
    }
    dataBytes[i] = val;
  }

  // Pad bytes: alternating 236/17
  let padIdx = Math.ceil(bits.length / 8);
  let padToggle = false;
  while (padIdx < dataCapacity) {
    dataBytes[padIdx++] = padToggle ? 17 : 236;
    padToggle = !padToggle;
  }

  return dataBytes;
}

// ─── EC generation and interleaving ───

function generateCodewords(data: Uint8Array, version: number): Uint8Array {
  const vInfo = VERSION_TABLE[version - 1];
  const [, totalCW, ecPerBlock, numBlocks, dataCWPerBlock] = vInfo;

  // Split data into blocks
  const blocks: Uint8Array[] = [];
  let offset = 0;
  for (let b = 0; b < numBlocks; b++) {
    blocks.push(data.slice(offset, offset + dataCWPerBlock));
    offset += dataCWPerBlock;
  }

  // Generate EC for each block
  const ecBlocks: Uint8Array[] = [];
  for (const block of blocks) {
    ecBlocks.push(rsEncode(block, ecPerBlock));
  }

  // Interleave data codewords
  const result: number[] = [];
  const maxDataLen = Math.max(...blocks.map(b => b.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of blocks) {
      if (i < block.length) result.push(block[i]);
    }
  }

  // Interleave EC codewords
  for (let i = 0; i < ecPerBlock; i++) {
    for (const ec of ecBlocks) {
      if (i < ec.length) result.push(ec[i]);
    }
  }

  // Pad remainder bits if needed (to match totalCW)
  while (result.length < totalCW) result.push(0);

  return new Uint8Array(result.slice(0, totalCW));
}

// ─── Matrix Construction ───

function createMatrix(version: number): { matrix: number[][]; reserved: boolean[][] } {
  const size = version * 4 + 17;
  const matrix: number[][] = Array.from({ length: size }, () => new Array(size).fill(-1));
  const reserved: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));

  // Place finder patterns
  function placeFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = row + r, cc = col + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        let val = 0;
        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          if (r === 0 || r === 6 || c === 0 || c === 6 ||
              (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            val = 1;
          }
        }
        matrix[rr][cc] = val;
        reserved[rr][cc] = true;
      }
    }
  }

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    reserved[6][i] = true;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
    reserved[i][6] = true;
  }

  // Alignment patterns
  if (version >= 2) {
    const positions = ALIGNMENT_POSITIONS[version - 1];
    for (const r of positions) {
      for (const c of positions) {
        // Skip if overlapping finder pattern
        if (r <= 8 && c <= 8) continue;
        if (r <= 8 && c >= size - 8) continue;
        if (r >= size - 8 && c <= 8) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const val = (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)) ? 1 : 0;
            matrix[r + dr][c + dc] = val;
            reserved[r + dr][c + dc] = true;
          }
        }
      }
    }
  }

  // Dark module
  matrix[size - 8][8] = 1;
  reserved[size - 8][8] = true;

  // Reserve format info areas
  for (let i = 0; i < 8; i++) {
    reserved[8][i] = true;
    reserved[8][size - 1 - i] = true;
    reserved[i][8] = true;
    reserved[size - 1 - i][8] = true;
  }
  reserved[8][8] = true;

  // Reserve version info areas (v7+)
  if (version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        reserved[i][size - 11 + j] = true;
        reserved[size - 11 + j][i] = true;
      }
    }
  }

  return { matrix, reserved };
}

// ─── Place Data Bits ───

function placeDataBits(matrix: number[][], reserved: boolean[][], codewords: Uint8Array) {
  const size = matrix.length;
  let bitIndex = 0;
  const totalBits = codewords.length * 8;

  // Traverse right-to-left in 2-column stripes
  let col = size - 1;
  while (col >= 0) {
    if (col === 6) col--; // Skip timing column

    // Determine direction
    const isUpward = ((size - 1 - col) >> 1) % 2 === 0;
    const rows = isUpward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const row of rows) {
      for (let dc = 0; dc <= 1; dc++) {
        const c = col - dc;
        if (c < 0 || reserved[row][c]) continue;
        if (bitIndex < totalBits) {
          const byteIdx = Math.floor(bitIndex / 8);
          const bitIdx = 7 - (bitIndex % 8);
          matrix[row][c] = (codewords[byteIdx] >> bitIdx) & 1;
          bitIndex++;
        } else {
          matrix[row][c] = 0;
        }
      }
    }

    col -= 2;
  }
}

// ─── Masking ───

const MASK_FUNCTIONS: ((r: number, c: number) => boolean)[] = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function applyMask(matrix: number[][], reserved: boolean[][], maskIdx: number): number[][] {
  const size = matrix.length;
  const masked = matrix.map(row => [...row]);
  const fn = MASK_FUNCTIONS[maskIdx];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reserved[r][c] && fn(r, c)) {
        masked[r][c] ^= 1;
      }
    }
  }
  return masked;
}

// ─── Penalty Score ───

function penaltyScore(matrix: number[][]): number {
  const size = matrix.length;
  let penalty = 0;

  // Rule 1: runs of 5+ same color
  for (let r = 0; r < size; r++) {
    let count = 1;
    for (let c = 1; c < size; c++) {
      if (matrix[r][c] === matrix[r][c - 1]) {
        count++;
      } else {
        if (count >= 5) penalty += count - 2;
        count = 1;
      }
    }
    if (count >= 5) penalty += count - 2;
  }
  for (let c = 0; c < size; c++) {
    let count = 1;
    for (let r = 1; r < size; r++) {
      if (matrix[r][c] === matrix[r - 1][c]) {
        count++;
      } else {
        if (count >= 5) penalty += count - 2;
        count = 1;
      }
    }
    if (count >= 5) penalty += count - 2;
  }

  // Rule 2: 2x2 blocks
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const val = matrix[r][c];
      if (val === matrix[r][c + 1] && val === matrix[r + 1][c] && val === matrix[r + 1][c + 1]) {
        penalty += 3;
      }
    }
  }

  // Rule 3: finder-like pattern (simplified)
  const pat1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const pat2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - 11; c++) {
      let match1 = true, match2 = true;
      for (let k = 0; k < 11; k++) {
        if (matrix[r][c + k] !== pat1[k]) match1 = false;
        if (matrix[r][c + k] !== pat2[k]) match2 = false;
      }
      if (match1 || match2) penalty += 40;
    }
  }
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - 11; r++) {
      let match1 = true, match2 = true;
      for (let k = 0; k < 11; k++) {
        if (matrix[r + k][c] !== pat1[k]) match1 = false;
        if (matrix[r + k][c] !== pat2[k]) match2 = false;
      }
      if (match1 || match2) penalty += 40;
    }
  }

  // Rule 4: proportion of dark modules
  let dark = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) dark++;
    }
  }
  const total = size * size;
  const pct = (dark / total) * 100;
  const prev5 = Math.floor(pct / 5) * 5;
  const next5 = prev5 + 5;
  penalty += Math.min(Math.abs(prev5 - 50) / 5, Math.abs(next5 - 50) / 5) * 10;

  return penalty;
}

// ─── Format Info ───

function placeFormatInfo(matrix: number[][], maskIdx: number) {
  const size = matrix.length;
  const bits = FORMAT_INFO[maskIdx];

  // Around top-left finder
  const positions1 = [
    [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [7, 8], [8, 8],
    [8, 7], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  ];
  for (let i = 0; i < 15; i++) {
    const [r, c] = positions1[i];
    matrix[r][c] = (bits >> (14 - i)) & 1;
  }

  // Around other finders
  const positions2 = [
    [8, size - 1], [8, size - 2], [8, size - 3], [8, size - 4],
    [8, size - 5], [8, size - 6], [8, size - 7], [8, size - 8],
    [size - 7, 8], [size - 6, 8], [size - 5, 8], [size - 4, 8],
    [size - 3, 8], [size - 2, 8], [size - 1, 8],
  ];
  for (let i = 0; i < 15; i++) {
    const [r, c] = positions2[i];
    matrix[r][c] = (bits >> (14 - i)) & 1;
  }
}

// ─── Select Best Version ───

function selectVersion(text: string): number {
  const byteLen = new TextEncoder().encode(text).length;
  // Byte mode: 4 (mode) + 8/16 (count) + byteLen*8 (data) + 4 (terminator)
  for (let v = 0; v < VERSION_TABLE.length; v++) {
    const countBits = (v + 1) <= 9 ? 8 : 16;
    const dataBits = 4 + countBits + byteLen * 8;
    const capacity = VERSION_TABLE[v][3] * VERSION_TABLE[v][4] * 8;
    if (dataBits <= capacity) return v + 1;
  }
  return 10; // Fallback to largest supported
}

// ─── Main Export ───

export function generateQR(
  text: string,
  canvas: HTMLCanvasElement,
  options?: QROptions
): void {
  const size = options?.size ?? 256;
  const fg = options?.foreground ?? '#000000';
  const bg = options?.background ?? '#ffffff';

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  if (!text) return;

  // Encode
  const version = selectVersion(text);
  const data = encodeData(text, version);
  const codewords = generateCodewords(data, version);

  // Build matrix
  const { matrix, reserved } = createMatrix(version);
  placeDataBits(matrix, reserved, codewords);

  // Try all masks, pick the best
  let bestMask = 0;
  let bestScore = Infinity;
  for (let m = 0; m < 8; m++) {
    const masked = applyMask(matrix, reserved, m);
    placeFormatInfo(masked, m);
    const score = penaltyScore(masked);
    if (score < bestScore) {
      bestScore = score;
      bestMask = m;
    }
  }

  // Apply best mask
  const finalMatrix = applyMask(matrix, reserved, bestMask);
  placeFormatInfo(finalMatrix, bestMask);

  // Render to canvas
  const modules = finalMatrix.length;
  const quietZone = 4;
  const totalModules = modules + quietZone * 2;
  const moduleSize = size / totalModules;

  ctx.fillStyle = fg;
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (finalMatrix[r][c] === 1) {
        ctx.fillRect(
          (c + quietZone) * moduleSize,
          (r + quietZone) * moduleSize,
          moduleSize + 0.5,
          moduleSize + 0.5
        );
      }
    }
  }
}

// ─── Utility: Generate QR as data URL ───

export function generateQRDataURL(
  text: string,
  options?: QROptions
): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  generateQR(text, canvas, options);
  return canvas.toDataURL('image/png');
}
