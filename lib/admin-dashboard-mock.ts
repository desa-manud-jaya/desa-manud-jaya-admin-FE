export type AdminDashboardMockMetrics = {
  activePartners: number;
  activeTourPackages: number;
};

// Temporary mock metrics until backend APIs for active partner/package totals are ready.
// Replace these values with API-backed data as soon as the endpoints are available.
export const adminDashboardMockMetrics: AdminDashboardMockMetrics = {
  activePartners: 1,
  activeTourPackages: 1,
};
