import { create } from 'zustand';

import type { LngLatLike } from 'mapbox-gl';

export const RETRY_TIMES = 3;

type GeoData = {
  path: LngLatLike[];
  total_distance: number;
  total_time: number;
};

interface StoreState {
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
  setSearch: (
    key: keyof StoreState['search'],
    obj: {
      value: string;
      error: string[];
    },
  ) => void;
  setSearchValue: (key: keyof StoreState['search'], v: string) => void;
  setSearchError: (key: keyof StoreState['search'], err: string[]) => void;
  resetSearch: () => void;
  setGeoToken: <K extends keyof StoreState['geoToken']>(newToken: {
    [P in K]: StoreState['geoToken'][P];
  }) => void;
  setGeoData: (data: GeoData) => void;
  resetGeoData: () => void;
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

const useStore = create<StoreState>((set) => ({
  // 初始状态
  search: DEFAULT_SEARCH,
  geoToken: {
    token: '',
    stamp: '',
    retry: RETRY_TIMES,
  },
  geoData: null,
  // 修改状态的方法
  setSearch: (key, obj) => {
    set((state) => ({ search: { ...state.search, [key]: obj } }));
  },
  setSearchValue: (key, value) => {
    set((state) => ({
      search: {
        ...state.search,
        [key]: {
          ...state.search[key],
          value,
          error: [],
        },
      },
    }));
  },
  setSearchError: (key, error) => {
    set((state) => ({
      search: {
        ...state.search,
        [key]: {
          ...state.search[key],
          error,
        },
      },
    }));
  },
  resetSearch: () => {
    set(() => ({
      search: DEFAULT_SEARCH,
    }));
  },
  setGeoToken: (newToken) => {
    set((state) => ({ geoToken: { ...state.geoToken, ...newToken } }));
  },
  setGeoData: (data) => {
    set(() => ({ geoData: data }));
  },
  resetGeoData: () => {
    set(() => ({ geoData: null }));
  },
}));

export default useStore;
