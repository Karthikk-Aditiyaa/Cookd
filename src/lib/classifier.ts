import type { Category } from './types';

export interface Classifier {
  classify(taskName: string, overrides?: Record<string, Category>): Category;
}

// Default rule-based classifier (pluggable)
export class KeywordClassifier implements Classifier {
  constructor(private lists: { productive: string[]; unproductive: string[] }) {}

  classify(taskName: string, overrides?: Record<string, Category>): Category {
    const key = normalizeKey(taskName);
    if (overrides?.[key]) return overrides[key];
    const lower = taskName.toLowerCase();
    let prod = false, unprod = false;
    for (const kw of this.lists.productive) {
      if (lower.includes(kw)) prod = true;
    }
    for (const kw of this.lists.unproductive) {
      if (lower.includes(kw)) unprod = true;
    }
    if (unprod && prod) return 'unproductive';
    if (unprod) return 'unproductive';
    if (prod) return 'productive';
    return 'uncertain';
  }
}

export function normalizeKey(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').substring(0, 60);
}

// Hook for future LLM-based classifier
export class LLMClassifier implements Classifier {
  classify(_taskName: string, _overrides?: Record<string, Category>): Category {
    throw new Error('LLMClassifier not implemented yet');
  }
}
