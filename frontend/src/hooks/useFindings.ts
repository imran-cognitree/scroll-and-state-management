import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFindings, getFinding, updateFindingStatus, deleteFinding } from '../lib/api';
import type { FindingStatusUpdate } from '../lib/schemas';

export const FINDINGS_QUERY_KEY = 'findings';
export const ALL_FINDINGS_QUERY_KEY = 'findings-all';

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

export function useInfiniteFindings(options: Omit<UseFindingsOptions, 'page'> = {}) {
  const { project, type, severity, status, scanner, limit = 50, enabled = true } = options;

  return useInfiniteQuery({
    queryKey: [FINDINGS_QUERY_KEY, 'infinite', { project, type, severity, status, scanner, limit }],
    queryFn: ({ pageParam = 1 }) =>
      getFindings(project, type, severity, status, scanner, pageParam as number, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const fetchedSoFar = (lastPage.page) * lastPage.limit;
      return fetchedSoFar < lastPage.total ? lastPage.page + 1 : undefined;
    },
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}


export function useAllFindings(project?: string) {
  return useQuery({
    queryKey: [ALL_FINDINGS_QUERY_KEY, { project }],
    queryFn: () => getFindings(project, undefined, undefined, undefined, undefined, 1, 1000),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
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
    queryKey: [FINDINGS_QUERY_KEY, { project, type, severity, status, scanner, page, limit }],
    queryFn: () => getFindings(project, type, severity, status, scanner, page, limit),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
      queryClient.invalidateQueries({ queryKey: [FINDINGS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ALL_FINDINGS_QUERY_KEY] });
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
      queryClient.invalidateQueries({ queryKey: [ALL_FINDINGS_QUERY_KEY] });
    },
  });
}
