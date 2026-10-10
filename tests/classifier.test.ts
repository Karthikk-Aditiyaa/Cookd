import { describe, it, expect } from 'vitest';
import { KeywordClassifier, normalizeKey } from '../src/lib/classifier';

describe('classifier', () => {
  it('normalizes keys', () => {
    expect(normalizeKey('Hello World!')).toBe('hello-world');
  });
  it('classifies productive', () => {
    const c = new KeywordClassifier({ productive: ['study'], unproductive: ['youtube'] });
    expect(c.classify('study math')).toBe('productive');
  });
  it('unproductive wins when both match', () => {
    const c = new KeywordClassifier({ productive: ['social'], unproductive: ['social media'] });
    expect(c.classify('social media')).toBe('unproductive');
  });
  it('uncertain when no match', () => {
    const c = new KeywordClassifier({ productive: ['study'], unproductive: [] });
    expect(c.classify('random stuff')).toBe('uncertain');
  });
});
