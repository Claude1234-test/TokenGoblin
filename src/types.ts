export interface RemovedItem {
  original: string;
  reason: 'filler' | 'redundant' | 'wordy' | 'replaceable' | 'duplicates';
  replacement: string | null;
}

export interface OptimizationResponse {
  optimized: string;
  removed: RemovedItem[];
}
