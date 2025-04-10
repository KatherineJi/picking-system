import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn Function Test', () => {
  it('Basic test', () => {
    expect(cn('w-123', 'h-321')).toBe('w-123 h-321');
    expect(cn('text-red-500', 'hover:text-blue-500')).toBe('text-red-500 hover:text-blue-500');
  });

  it('Test for judgement', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('base', { 'text-blue-500': isActive, 'text-gray-500': isDisabled })).toBe(
      'base text-blue-500',
    );
  });

  it('Test for merge', () => {
    expect(cn('w-123 w-321')).toBe('w-321');
    expect(cn('text-red-500 text-blue-500')).toBe('text-blue-500');
  });

  it('Test array', () => {
    expect(cn(['w-123', 'h-321'], ['text-center'])).toBe('w-123 h-321 text-center');
    expect(cn(['w-123', ['h-321']])).toBe('w-123 h-321');
  });

  it('Test: no read false value', () => {
    expect(cn(null, undefined, false, '', 'valid')).toBe('valid');
    expect(cn(0, 'w-123')).toBe('w-123');
  });
});
