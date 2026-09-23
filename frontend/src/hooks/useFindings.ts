import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFindings, getFinding, updateFindingStatus, deleteFinding } from '../lib/api';
import type { FindingStatusUpdate } from '../lib/schemas';

export const FINDINGS_QUERY_KEY = 'findings';

interface UseFindingsOptions {
  project?: string;
  type?: string;
  severity?: string;
  status?: string;
  scanner?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useFindings(options: UseFindingsOptions = {}) {
  const {
    project,
    type,
    severity,
    status,
    scanner,
    page = 1,
    limit = 50,
    enabled = true,
  } = options;

  return useQuery({
    queryKey: [
      FINDINGS_QUERY_KEY,
      { project, type, severity, status, scanner, page, limit },
    ],
    queryFn: () =>
      getFindings(project, type, severity, status, scanner, page, limit),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

export function useFindingDetail(id: string | null) {
  return useQuery({
    queryKey: [FINDINGS_QUERY_KEY, 'detail', id],
    queryFn: () => getFinding(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
}

export function useUpdateFinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, update }: { id: string; update: FindingStatusUpdate }) => {
      return updateFindingStatus(id, update);
    },
    onSuccess: () => {
      // Invalidate findings queries to force a refetch
      queryClient.invalidateQueries({ queryKey: [FINDINGS_QUERY_KEY] });
    },
  });
}

export function useDeleteFinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return deleteFinding(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FINDINGS_QUERY_KEY] });
    },
  });
}
