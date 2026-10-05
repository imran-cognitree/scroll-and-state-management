import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { generateReport, getReportStatus, subscribeToReportStream } from '../lib/api';

export const REPORTS_QUERY_KEY = 'reports';

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generateReport(),
    onSuccess: (task) => {
      // Seed the cache with the PENDING response so useReportStatus
      // can immediately display the loading state without an extra fetch.
      queryClient.setQueryData([REPORTS_QUERY_KEY, task.task_id], task);
    },
  });
}

/**
 * Subscribes to the SSE stream for the given taskId.
 *
 * Flow:
 *  1. The query is enabled so it reads from the seeded cache (PENDING state).
 *     It will NOT auto-refetch (no refetchInterval) until the SSE event fires.
 *  2. Opens EventSource to GET /api/reports/{taskId}/stream
 *  3. When the server pushes a terminal REPORT_STATUS event, it:
 *     a. Closes the EventSource connection
 *     b. Calls refetchQueries to force a fresh GET /api/reports/{taskId}
 *        and update the UI with the final SUCCESS/FAILURE data
 *  4. Cleans up the EventSource if the component unmounts mid-stream
 */
export function useReportStatus(taskId: string | null, stopStream = false) {
  const queryClient = useQueryClient();

  // enabled: !!taskId — reads from the seeded PENDING cache immediately.
  // No refetchInterval — SSE will trigger the final fetch instead.
  const query = useQuery({
    queryKey: [REPORTS_QUERY_KEY, taskId],
    queryFn: () => getReportStatus(taskId!),
    enabled: !!taskId && !stopStream,
    // Don't auto-refetch on window focus or reconnect while we're waiting
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  const currentStatus = query.data?.status;

  useEffect(() => {
    // Don't open a stream if:
    //  - there's no taskId
    //  - streaming should stop (e.g. timeout triggered)
    //  - the task has already reached a terminal state
    if (
      !taskId ||
      stopStream ||
      currentStatus === 'SUCCESS' ||
      currentStatus === 'FAILURE'
    ) {
      return;
    }

    const refetch = () => {
      // refetchQueries forces an immediate network request even when the
      // query's staleTime hasn't expired — we want the very latest state.
      queryClient.refetchQueries({ queryKey: [REPORTS_QUERY_KEY, taskId] });
    };

    const unsubscribe = subscribeToReportStream(
      taskId,
      (_status) => {
        // Server pushed the terminal event — pull the final data via HTTP
        refetch();
      },
      () => {
        // Stream error — fall back to a single fetch to get the latest state
        refetch();
      },
    );

    return () => {
      unsubscribe();
    };
  // Re-run when taskId, stopStream, or the current status changes
  }, [taskId, stopStream, currentStatus, queryClient]);

  return query;
}
