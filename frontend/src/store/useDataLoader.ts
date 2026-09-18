import { useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import type { DashboardData } from '../store/types';
import rawData from '../data/dummy-vulnerability-findings.json';

/** Loads the mock JSON into Zustand store on mount */
export function useDataLoader() {
  const loadData = useDashboardStore((s) => s.loadData);
  const isLoaded = useDashboardStore((s) => s.isLoaded);

  useEffect(() => {
    if (!isLoaded) {
      loadData(rawData as DashboardData);
    }
  }, [isLoaded, loadData]);
}
