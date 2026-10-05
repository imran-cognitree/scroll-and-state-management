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

    // SSE stream endpoint: immediately pushes a SUCCESS event and closes.
    // Tests that want to simulate PENDING-forever or FAILURE can override
    // this handler with server.use(...) inside the individual test.
    http.get('http://127.0.0.1:8000/api/reports/:taskId/stream', async ({ params }) => {
        const encoder = new TextEncoder();
        const payload = JSON.stringify({ status: 'SUCCESS', taskId: params.taskId });
        const sseMessage = `event: REPORT_STATUS\ndata: ${payload}\n\n`;

        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(sseMessage));
                controller.close();
            },
        });

        return new HttpResponse(stream, {
            status: 200,
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
            },
        });
    }),

    // Status endpoint — used by the final fetch after the SSE event fires
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
