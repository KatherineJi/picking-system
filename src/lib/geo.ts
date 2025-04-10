import type { LngLatLike } from 'mapbox-gl';

/**
 * from (lat, lng) to (lng, lat)
 * @param {[number, number][]} paths
 * @returns {LngLatLike[]}
 */
export const parseGeoJSON = (paths: [number, number][]): LngLatLike[] => {
  return paths.map((path) => {
    return path.reverse();
  }) as LngLatLike[];
};
