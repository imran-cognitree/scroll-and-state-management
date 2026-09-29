## Asynchronous Processing
- Polling
- Web hook
- Socket

### Polling
1. We try to fetch the taskId from Localstorage and set to global context
    - [ReportGenerator Component](/frontend/src/components/dashboard/ReportGenerator.tsx)
2. If taskId is present in local storage, we try to fetch the status from the API
3. If taskId is not present and we hit "Generate Report" hook generates taskId and stores it in local storage and global context
    - [useGenerateReport hook](/frontend/src/hooks/useReports.ts)
4. We fetch and poll the status with the taskId
    - [useReportStatus hook](/frontend/src/hooks/useReports.ts)

## Unit and Integration Tests
- Setup
- MetricStat Component
- ReportGeneration

### Setup
- [vite.config.ts](/frontend/vite.config.ts)
- [Mock Service Worker](frontend/src/mocks/server.ts)
- [Mock service APIs](frontend/src/mocks/handlers.ts)
- [setupTests.ts](/frontend/src/setupTests.ts)

### MetricStat
- [MetricStat Unit Test](frontend/src/components/dashboard/MetricStat.test.tsx)

### Report Generator
- [QueryClient Wrapper](frontend/src/utils/test.tsx)
- [ReportGenerator Test](frontend/src/components/dashboard/ReportGenerator.test.tsx)

## E2E Tests
- [playwright.config.ts](frontend/playwright.config.ts)
- [Login Test](frontend/e2e/login.spec.ts)

## Tools
- Vitest
- Jsdom: faking the browser environment in node.js
- RTL: with below extensions
    - react: for component mounting
    - user-event: for simulating user interactions
    - @testing-library/jest-dom: for custom assertions (e.g. toBeInTheDocument)
- Mock Service Worker
- playwright/test