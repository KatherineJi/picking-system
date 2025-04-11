import { create } from 'zustand';

import type { LngLatLike } from 'mapbox-gl';

export const RETRY_TIMES = 3;

type GeoData = {
  path: LngLatLike[];
  total_distance: number;
  total_time: number;
};

export interface StoreState {
  search: {
    origin: {
      value: string;
      error: string[];
    };
    destination: {
      value: string;
      error: string[];
    };
  };
  geoToken: {
    token: string;
    stamp: string;
    retry: number;
  };
  geoData: GeoData | null;
  errMsg: string;
}

const DEFAULT_SEARCH = {
  origin: {
    value: '',
    error: [],
  },
  destination: {
    value: '',
    error: [],
  },
};

const useStore = create<StoreState>(() => ({
  search: DEFAULT_SEARCH,
  geoToken: {
    token: '',
    stamp: '',
    retry: RETRY_TIMES,
  },
  geoData: null,
  errMsg: '',
}));

export const setSearchValue = (key: keyof StoreState['search'], value: string) => {
  useStore.setState((state) => ({
    search: {
      ...state.search,
      [key]: {
        ...state.search[key],
        value,
        error: [],
      },
    },
  }));
};

export const resetSearch = () => {
  useStore.setState(() => ({ search: DEFAULT_SEARCH }));
};

export const setGeoToken = <K extends keyof StoreState['geoToken']>(newToken: {
  [P in K]: StoreState['geoToken'][P];
}) => {
  useStore.setState((state) => ({ geoToken: { ...state.geoToken, ...newToken } }));
};

export const setGeoData = (data: GeoData) => {
  useStore.setState(() => ({ geoData: data }));
};

export const resetGeoData = () => {
  useStore.setState(() => ({ geoData: null }));
};

export const setErrMsg = (msg: string) => {
  useStore.setState(() => ({ errMsg: msg }));
};

export default useStore;
