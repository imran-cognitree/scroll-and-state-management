import { http, HttpResponse, delay } from 'msw';

export const handlers = [
    http.post('http://127.0.0.1:8000/api/reports', async () => {
        await delay(100);
        return HttpResponse.json({
            task_id: 'mock-task-123',
            status: 'PENDING',
            created_at: new Date().toISOString(),
        }, { status: 202 });
    }),

    http.get('http://127.0.0.1:8000/api/reports/:taskId', async ({ params }) => {
        await delay(100);
        return HttpResponse.json({
            task_id: params.taskId,
            status: 'SUCCESS',
            message: 'Mock report generated successfully.',
            created_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
        });
    }),
];
