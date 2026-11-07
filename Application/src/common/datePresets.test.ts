import {describe, expect, it} from 'vitest';
import {getPresetRange} from './datePresets.ts';

// Wednesday, 2026-11-04
const today = new Date(2026, 10, 4);

describe('getPresetRange', () => {
  it('resolves weeks starting at the configured day', () => {
    expect(getPresetRange('This week', today, 1)).toEqual({
      start: new Date(2026, 10, 2),
      end: new Date(2026, 10, 8),
    });
    expect(getPresetRange('Last week', today, 1)).toEqual({
      start: new Date(2026, 9, 26),
      end: new Date(2026, 10, 1),
    });
    expect(getPresetRange('This week', today, 0).start).toEqual(new Date(2026, 10, 1));
  });

  it('resolves months and years', () => {
    expect(getPresetRange('This month', today, 1)).toEqual({
      start: new Date(2026, 10, 1),
      end: new Date(2026, 10, 30),
    });
    expect(getPresetRange('Last month', today, 1)).toEqual({
      start: new Date(2026, 9, 1),
      end: new Date(2026, 9, 31),
    });
    expect(getPresetRange('This year', today, 1)).toEqual({
      start: new Date(2026, 0, 1),
      end: new Date(2026, 11, 31),
    });
  });

  it('crosses the year boundary for last month in january', () => {
    expect(getPresetRange('Last month', new Date(2027, 0, 15), 1)).toEqual({
      start: new Date(2026, 11, 1),
      end: new Date(2026, 11, 31),
    });
  });
});
