export const FILE_TYPE_ICONS: Record<string, string> = {
  pdf: 'PDF', docx: 'DOC', xlsx: 'XLS', xls: 'XLS',
  txt: 'TXT', csv: 'CSV', md: 'MD',
  png: 'IMG', jpg: 'IMG', jpeg: 'IMG',
};

export const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: '#e74c3c', docx: '#2b5797', xlsx: '#1d6f42', xls: '#1d6f42',
  txt: '#6b7280', csv: '#059669', md: '#6b7280',
  png: '#8b5cf6', jpg: '#8b5cf6', jpeg: '#8b5cf6',
};

export const ACCEPTED_FILE_TYPES = '.pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md,.png,.jpg,.jpeg';
export const MAX_FILE_SIZE_MB = 5;
export const MAX_STORAGE_MB = 50;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function formatTokenEstimate(tokens: number): string {
  if (tokens < 1000) return `~${tokens} tokens`;
  return `~${(tokens / 1000).toFixed(1)}k tokens`;
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}
