import { useState } from 'react';
import { Shield, LayoutDashboard, AlertTriangle } from 'lucide-react';
import { useDataLoader } from './store/useDataLoader';
import { useDashboardStore } from './store/dashboardStore';
import { VulnerabilityOverview } from './components/dashboard/VulnerabilityOverview';
import { FindingsList } from './components/dashboard/FindingsList';
import type { ScanType, Severity } from './store/types';
import './styles/index.css';
import './App.css';

type View = 'overview' | ScanType | 'all';

export default function App() {
  useDataLoader();

  const isLoaded = useDashboardStore((s) => s.isLoaded);
  const setSeverityFilter = useDashboardStore((s) => s.setSeverityFilter);
  const [activeView, setActiveView] = useState<View>('overview');

  if (!isLoaded) {
    return (
      <div className="app-loading" role="status" aria-label="Loading dashboard">
        <Shield size={32} className="app-loading__icon" />
        <span>Loading AegisSec...</span>
      </div>
    );
  }

  /**
   * Navigate to the findings view for a given scan type ('all' shows every finding).
   * Optionally pre-apply a severity filter (e.g. when clicking a metric number).
   */
  const handleViewFindings = (type: ScanType | 'all', severity?: Severity) => {
    setSeverityFilter(severity ?? 'all');
    setActiveView(type);
  };

  const handleBack = () => {
    setSeverityFilter('all');
    setActiveView('overview');
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar" role="navigation" aria-label="Main navigation">
        <div className="sidebar__brand">
          <Shield size={22} className="sidebar__brand-icon" />
          <div>
            <span className="sidebar__brand-name">AegisSec</span>
            <span className="sidebar__brand-category">APPSEC</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          <button
            className={`sidebar__nav-item ${activeView === 'overview' ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => handleBack()}
            id="nav-dashboard"
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>
          <button
            className={`sidebar__nav-item ${activeView === 'all' ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => handleViewFindings('all')}
            id="nav-all-findings"
          >
            <AlertTriangle size={16} />
            <span>All Findings</span>
          </button>
          <button
            className={`sidebar__nav-item ${activeView === 'SCA' ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => handleViewFindings('SCA')}
            id="nav-sca"
          >
            <AlertTriangle size={16} />
            <span>SCA</span>
          </button>
          <button
            className={`sidebar__nav-item ${activeView === 'SAST' ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => handleViewFindings('SAST')}
            id="nav-sast"
          >
            <AlertTriangle size={16} />
            <span>SAST</span>
          </button>
          <button
            className={`sidebar__nav-item ${activeView === 'DAST' ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => handleViewFindings('DAST')}
            id="nav-dast"
          >
            <AlertTriangle size={16} />
            <span>DAST</span>
          </button>
        </nav>

        {/* Breadcrumb */}
        <div className="sidebar__breadcrumb">
          <span>/</span>
          <span>
            {activeView === 'overview'
              ? 'Vulnerability Overview'
              : activeView === 'all'
                ? 'All Findings'
                : `Vulnerability Findings — ${activeView}`}
          </span>
        </div>
      </aside>

      {/* Main content */}
      <main className="main" id="main-content">
        <div className="main__inner">
          {activeView === 'overview' ? (
            <VulnerabilityOverview onViewFindings={handleViewFindings} />
          ) : (
            <FindingsList scanType={activeView} onBack={handleBack} />
          )}
        </div>
      </main>
    </div>
  );
}
