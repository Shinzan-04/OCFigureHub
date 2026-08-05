import API from './client';

export interface PublicConfig {
  allowRegistration: boolean;
  maintenanceMode: boolean;
}

export const configApi = {
  getPublicConfig: async (): Promise<PublicConfig> => {
    try {
      const res = await API.get<PublicConfig>('/public-config');
      return res.data;
    } catch (e) {
      console.error('Failed to load public config', e);
      return { allowRegistration: true, maintenanceMode: false }; // fallback defaults
    }
  },
};
