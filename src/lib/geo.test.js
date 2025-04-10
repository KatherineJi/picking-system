import { describe, it, expect } from 'vitest';
import { parseGeoJSON } from './geo'

describe('parseGeoJSON Function Test', () => {
  it('Basic test', () => {
    const input = [
      [100.123, 50.123],
      [123.456, 10.234]
    ];
    const expected = [
      [50.123, 100.123],
      [10.234, 123.456]
    ];
    expect(parseGeoJSON(input)).toEqual(expected);
  });

  it('Test for single point', () => {
    const input = [[123.456, 10.234]];
    expect(parseGeoJSON(input)).toEqual([[10.234, 123.456]]);
  });

  it('Test for empty', () => {
    expect(parseGeoJSON([])).toEqual([]);
  });

  it('Test reverse', () => {
    const input = [[-50.123, 50.321]];
    const result = parseGeoJSON(input);
    expect(result[0][0]).toBe(50.321);
    expect(result[0][1]).toBe(-50.123);
  });

   // 验证原数组未被修改
  it('Test: no modify for old', () => {
    const original = [
      [100.123, 50.123],
      [123.456, 10.234]
    ];
    const copy = [...original];
    parseGeoJSON(original);
    expect(original).toEqual(copy);
  });

  it('Test negative number', () => {
    const input = [
      [-50.123, 10.234],
      [-50.321, 99.876]
    ];
    const expected = [
      [10.234, -50.123],
      [99.876, -50.321]
    ];
    expect(parseGeoJSON(input)).toEqual(expected);
  });

  it('Test: return valid as LngLatLike', () => {
    const input = [[10.234, 99.876]];
    const result = parseGeoJSON(input);
    // 验证类型结构
    expect(result[0]).toHaveLength(2);
    expect(typeof result[0][0]).toBe('number');
    expect(typeof result[0][1]).toBe('number');
  });
});
