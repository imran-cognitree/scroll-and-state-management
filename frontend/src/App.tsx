import { useState } from 'react';
import { Shield, LayoutDashboard, AlertTriangle } from 'lucide-react';
import { useDataLoader } from './store/useDataLoader';
import { useDashboardStore } from './store/dashboardStore';
import { VulnerabilityOverview } from './components/dashboard/VulnerabilityOverview';
import { FindingsList } from './components/dashboard/FindingsList';
import type { ScanType } from './store/types';
import './styles/index.css';
import './App.css';

type View = 'overview' | ScanType;

export default function App() {
  useDataLoader();

  const isLoaded = useDashboardStore((s) => s.isLoaded);
  const [activeView, setActiveView] = useState<View>('overview');

  if (!isLoaded) {
    return (
      <div className="app-loading" role="status" aria-label="Loading dashboard">
        <Shield size={32} className="app-loading__icon" />
        <span>Loading AegisSec...</span>
      </div>
    );
  }

  const handleViewFindings = (type: ScanType) => {
    setActiveView(type);
  };

  const handleBack = () => {
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
            onClick={() => setActiveView('overview')}
            id="nav-dashboard"
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>
          <button
            className={`sidebar__nav-item ${activeView !== 'overview' ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => activeView === 'overview' ? setActiveView('SCA') : undefined}
            id="nav-vulnerabilities"
          >
            <AlertTriangle size={16} />
            <span>Vulnerability Overview</span>
          </button>
          {/* <button className="sidebar__nav-item" id="nav-monitoring" disabled>
            <Activity size={16} />
            <span>Active Monitoring</span>
          </button> */}
        </nav>

        {/* Breadcrumb */}
        <div className="sidebar__breadcrumb">
          <span>/</span>
          <span>
            {activeView === 'overview' ? 'Vulnerability Overview' : `Vulnerability Findings — ${activeView}`}
          </span>
        </div>
      </aside>

      {/* Main content */}
      <main className="main" id="main-content">
        <div className="main__inner">
          {activeView === 'overview' ? (
            <VulnerabilityOverview onViewFindings={handleViewFindings} />
          ) : (
            <FindingsList scanType={activeView as ScanType} onBack={handleBack} />
          )}
        </div>
      </main>
    </div>
  );
}
