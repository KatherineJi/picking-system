export type TokenRes = {
  token: string;
};

export type RouteRes = {
  status: string;
  total_distance: number;
  total_time: number;
  path: [number, number][];
  error?: string;
};
