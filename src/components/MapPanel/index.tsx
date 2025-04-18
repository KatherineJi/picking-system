import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import type { LngLatLike, Marker } from 'mapbox-gl';

import useStore, { setErrMsg } from '@/store/store';
import { ERR_TEXT } from '@/constants/text';

import 'mapbox-gl/dist/mapbox-gl.css';
import './style.css';
import { getRoutePathUrl } from '@/constants/api';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const DEFAULT_LOCATION: LngLatLike = [114.15, 22.3]; // HONGKONG

const MapPanel = () => {
  const geoData = useStore.use.geoData();

  const [routePath, setRoutePath] = useState<LngLatLike[] | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        accessToken: MAPBOX_TOKEN,
        container: mapContainerRef.current || 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        center: DEFAULT_LOCATION,
        zoom: 12,
      });
    }

    return () => {
      mapRef.current = null;
    };
  }, []);

  // fetch routes from mapbox
  useEffect(() => {
    if (!geoData) {
      clearRoute();
      setRoutePath(null);
      return;
    }

    const { path: points } = geoData;

    // get params for fetch route
    const routes = points
      .map((point, i) => (i < points.length - 1 ? [point, points[i + 1]] : null))
      .filter(Boolean) as LngLatLike[][];

    const fetchs = routes.map((route) => {
      return fetch(
        `${getRoutePathUrl}/${route[0]};${route[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`,
      ).then((res) => res.json());
    });

    Promise.all(fetchs).then(
      (res) => {
        const newRoutePath = res.reduce((prev, cur, i) => {
          if (cur.code !== 'Ok') return prev;

          const result = [...prev, points[i], ...cur.routes[0].geometry.coordinates];
          if (i === res.length - 1) {
            result.push(points[i + 1]);
          }
          return result;
        }, []);

        setRoutePath(newRoutePath);
      },
      () => {
        setErrMsg(ERR_TEXT.OTHER_ERR);
      },
    );
  }, [geoData]);

  useEffect(() => {
    if (!routePath) return;

    const map = mapRef.current!;
    if (map.loaded()) {
      drawRoute();
    } else {
      map.on('load', () => {
        drawRoute();
      });
    }
  }, [routePath]);

  // add point marker
  const addMarker = (position: LngLatLike, index: number) => {
    const markerEl = document.createElement('div');
    const markerInner = document.createElement('div');
    markerInner.className = 'marker-pop';
    markerInner.innerHTML = `
      <svg display="block" height="41px" width="27px" viewBox="0 0 27 41">
        <defs>
          <radialGradient id="shadowGradient">
            <stop offset="10%" stop-opacity="0.4"></stop>
            <stop offset="100%" stop-opacity="0.05"></stop>
          </radialGradient>
        </defs>
        <ellipse cx="13.5" cy="34.8" rx="10.5" ry="5.25" fill="url(#shadowGradient)"></ellipse>
        <path fill="#3FB1CE"
          d="M27,13.5C27,19.07 20.25,27 14.75,34.5C14.02,35.5 12.98,35.5 12.25,34.5C6.75,27 0,19.22 0,13.5C0,6.04 6.04,0 13.5,0C20.96,0 27,6.04 27,13.5Z"></path>
        <path opacity="0.25"
          d="M13.5,0C6.04,0 0,6.04 0,13.5C0,19.22 6.75,27 12.25,34.5C13,35.52 14.02,35.5 14.75,34.5C20.25,27 27,19.07 27,13.5C27,6.04 20.96,0 13.5,0ZM13.5,1C20.42,1 26,6.58 26,13.5C26,15.9 24.5,19.18 22.22,22.74C19.95,26.3 16.71,30.14 13.94,33.91C13.74,34.18 13.61,34.32 13.5,34.44C13.39,34.32 13.26,34.18 13.06,33.91C10.28,30.13 7.41,26.31 5.02,22.77C2.62,19.23 1,15.95 1,13.5C1,6.58 6.58,1 13.5,1Z"></path>
        <text x="13" y="18" font-size="12" text-anchor="middle" fill="white" font-weight="bold">${index}</text>
      </svg>
    `;
    markerEl.appendChild(markerInner);

    // Add marker to the map
    return new mapboxgl.Marker(markerEl).setLngLat(position).addTo(mapRef.current!);
  };

  // draw route path
  const drawRoute = () => {
    const map: mapboxgl.Map = mapRef.current!;

    // clear route path first
    clearRoute();

    map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          coordinates: routePath as [number, number][],
          type: 'LineString',
        },
      },
    });

    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 4,
        'line-opacity': 0.8,
      },
    });

    const bounds = new mapboxgl.LngLatBounds();
    const newMarkers: Marker[] = [];
    geoData!.path.forEach((point, i) => {
      // add Marker at path point
      newMarkers.push(addMarker(point, i + 1));

      bounds.extend(point);
    });

    setMarkers(newMarkers);

    // focus to the bounds area
    map.fitBounds(bounds, { padding: 50 });
  };

  const clearRoute = useCallback(() => {
    const map: mapboxgl.Map = mapRef.current!;
    if (map.getSource('route')) {
      map.removeLayer('route');
      map.removeSource('route');
    }
    markers.forEach((marker) => marker.remove());
  }, [mapRef.current, markers]);

  return <div id='map' ref={mapContainerRef} className='map=panel w-screen h-screen'></div>;
};

export default MapPanel;
