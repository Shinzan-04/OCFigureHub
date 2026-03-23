import API from './client';
import type { DownloadRequest, DownloadResponse, DownloadHistory } from '../types/download';

export const downloadsApi = {
  request: async (data: DownloadRequest): Promise<DownloadResponse> => {
    const res = await API.post<DownloadResponse>('/downloads/request', data);
    return res.data;
  },

  getHistory: async (): Promise<DownloadHistory[]> => {
    const res = await API.get<DownloadHistory[]>('/downloads/history');
    return res.data;
  },
};
