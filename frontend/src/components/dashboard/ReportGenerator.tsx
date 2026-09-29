import { FileText, Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { useGenerateReport, useReportStatus } from '../../hooks/useReports';
import { useDashboardStore } from '../../store/dashboardStore';
import './ReportGenerator.css';

export function ReportGenerator() {
  const taskId = useDashboardStore((state) => state.reportTaskId);
  const setTaskId = useDashboardStore((state) => state.setReportTaskId);

  const generateMutation = useGenerateReport();
  const statusQuery = useReportStatus(taskId);

  const currentStatus = statusQuery.data?.status ?? (generateMutation.isPending ? 'PENDING' : null);

  const handleGenerate = () => {
    generateMutation.mutate(undefined, {
      onSuccess: (task) => setTaskId(task.task_id),
    });
  };

  const handleReset = () => {
    setTaskId(null);
    generateMutation.reset();
  };

  const isLoading = generateMutation.isPending || currentStatus === 'PENDING';
  const isSuccess = currentStatus === 'SUCCESS';
  const isFailure = currentStatus === 'FAILURE' || generateMutation.isError;

  const uiState = isLoading ? 'loading' : isSuccess ? 'success' : isFailure ? 'failure' : 'idle';

  return (
    <div className="report-gen" aria-live="polite" aria-label="Report Generator">
      <div className="report-gen__header">
        <div className="report-gen__icon-wrap">
          <FileText size={18} />
        </div>
        <div>
          <h2 className="report-gen__title">Generate Security Report</h2>
          <p className="report-gen__subtitle">
            Compile all findings into a full security audit report
          </p>
        </div>
      </div>

      {/* Status Panel */}
      {uiState !== 'idle' && (
        <div className={`report-gen__status-panel report-gen__status-panel--${uiState}`}>
          {uiState === 'loading' && (
            <>
              <div className="report-gen__status-row">
                <Loader2 size={16} className="report-gen__spinner" />
                <span className="report-gen__status-label">Processing report…</span>
              </div>
              <p className="report-gen__status-msg">
                Polling for updates every 5 seconds. This typically takes ~30 seconds.
              </p>
              {taskId && (
                <p className="report-gen__task-id">
                  Task ID: <code>{taskId}</code>
                </p>
              )}
              <div className="report-gen__progress-track">
                <div className="report-gen__progress-fill" />
              </div>
            </>
          )}

          {uiState === 'success' && (
            <>
              <div className="report-gen__status-row">
                <CheckCircle2 size={16} />
                <span className="report-gen__status-label">Report Ready</span>
              </div>
              <p className="report-gen__status-msg">{statusQuery.data?.message}</p>
              {statusQuery.data?.completed_at && (
                <p className="report-gen__task-id">
                  Completed:{' '}
                  <code>{new Date(statusQuery.data.completed_at).toLocaleTimeString()}</code>
                </p>
              )}
            </>
          )}

          {uiState === 'failure' && (
            <>
              <div className="report-gen__status-row">
                <XCircle size={16} />
                <span className="report-gen__status-label">Generation Failed</span>
              </div>
              <p className="report-gen__status-msg">
                {statusQuery.data?.message
                  ?? generateMutation.error?.message
                  ?? 'An unexpected error occurred. Please try again.'}
              </p>
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="report-gen__actions">
        {uiState === 'idle' && (
          <button
            id="btn-generate-report"
            className="report-gen__btn report-gen__btn--primary"
            onClick={handleGenerate}
          >
            <FileText size={14} />
            Generate Report
          </button>
        )}

        {uiState === 'loading' && (
          <button
            id="btn-generate-report-loading"
            className="report-gen__btn report-gen__btn--primary report-gen__btn--disabled"
            disabled
          >
            <Loader2 size={14} className="report-gen__spinner" />
            Processing…
          </button>
        )}

        {(uiState === 'success' || uiState === 'failure') && (
          <button
            id="btn-generate-report-again"
            className="report-gen__btn report-gen__btn--secondary"
            onClick={handleReset}
          >
            <RefreshCw size={14} />
            Generate Again
          </button>
        )}
      </div>
    </div>
  );
}
