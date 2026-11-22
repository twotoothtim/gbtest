import { describe, it } from 'vitest';
import { totalKitsForBuy, effectivePricePerKit, nextTierForBuy } from '../src/lib/store';

describe('Store Layer (Demo Mode)', () => {
  it('should calculate total kits for a buy', () => {
    const sum = totalKitsForBuy('retatrutide-open');
    expect(sum).toBeGreaterThan(0); // Should have demo data seeded
  });

  it('should return effective price based on current commitment', () => {
    const buy = require('../src/lib/store').getBuy('retatrutide-open');
    if (!buy) throw new Error('Buy not found');
    expect(effectivePricePerKit(buy)).toBeGreaterThan(0);
  });

  it('should return next tier info when available', () => {
    const buy = require('../src/lib/store').getBuy('retatrutide-open');
    if (!buy) throw new Error('Buy not found');
    const nextTier = nextTierForBuy(buy);
    expect(nextTier).toBeDefined(); // Should have a next tier in demo data
  });
});
