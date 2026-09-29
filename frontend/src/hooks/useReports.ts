import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { generateReport, getReportStatus } from '../lib/api';

export const REPORTS_QUERY_KEY = 'reports';

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generateReport(),
    onSuccess: (task) => {
      queryClient.setQueryData([REPORTS_QUERY_KEY, task.task_id], task);
    },
  });
}

/**
 * Query: GET /api/reports/{taskId} — polls every 5 seconds while the task
 * is still PENDING, then stops automatically once a terminal state is reached.
 */
export function useReportStatus(taskId: string | null, stopPolling = false) {
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, taskId],
    queryFn: () => getReportStatus(taskId!),
    enabled: !!taskId && !stopPolling,
    // Poll every 5 s only while the task is still pending and not stopped
    refetchInterval: (query) => {
      if (stopPolling) return false;
      const status = query.state.data?.status;
      return status === 'PENDING' ? 5000 : false;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}
