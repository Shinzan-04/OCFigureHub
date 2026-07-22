import API from './client';

export interface PlatformStats {
  models: number;
  creators: number;
  downloads: number;
  members: number;
}

export const statsApi = {
  getPlatformStats: async (): Promise<PlatformStats> => {
    const res = await API.get<PlatformStats>('/PublicStats');
    return res.data;
  },
};
