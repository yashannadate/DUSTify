import React, { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { DashboardSidebar } from './components/layout/DashboardSidebar';
import { Header } from './components/layout/Header';
import { DashboardOverview } from './pages/DashboardOverview';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ApiKeysPage } from './pages/ApiKeysPage';
import { Transactions } from './pages/Transactions';
import { RelayerHealth } from './pages/RelayerHealth';
import { SponsorCapacityPage } from './pages/SponsorCapacityPage';
import { Playground } from './pages/Playground';
import { DeveloperSetup } from './pages/DeveloperSetup';
import { Security } from './pages/Security';
import { ViewMode, DashboardTab, RelayerTelemetry, RelayedTxRecord } from './types';
import { apiClient } from './lib/api';

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');
  const [telemetry, setTelemetry] = useState<RelayerTelemetry | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [transactions, setTransactions] = useState<RelayedTxRecord[]>([]);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Load stored transactions on mount
  useEffect(() => {
    setTransactions(apiClient.getStoredTransactions());
  }, []);

  const refreshTelemetry = async () => {
    setIsLoading(true);
    const { data, error, latencyMs: latency } = await apiClient.fetchTelemetry();
    setLatencyMs(latency);
    if (data) {
      setTelemetry(data);
      setIsOnline(true);
    } else {
      setIsOnline(false);
    }
    setIsLoading(false);
  };

  // Initial fetch and 10s recurring poll
  useEffect(() => {
    refreshTelemetry();
    const interval = setInterval(refreshTelemetry, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTxCreated = (tx: RelayedTxRecord) => {
    setTransactions((prev) => [tx, ...prev.filter((t) => t.id !== tx.id)]);
  };

  const handleLaunchDashboard = (initialTab: string = 'overview') => {
    setDashboardTab(initialTab as DashboardTab);
    setViewMode('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (viewMode === 'landing') {
    return (
      <LandingPage
        telemetry={telemetry}
        isOnline={isOnline}
        onLaunchDashboard={handleLaunchDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex">
      {/* Dashboard Sidebar Navigation */}
      <DashboardSidebar
        activeTab={dashboardTab}
        onSelectTab={setDashboardTab}
        onBackToLanding={() => setViewMode('landing')}
        telemetry={telemetry}
        isOnline={isOnline}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Dashboard Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          activePage={dashboardTab as any}
          telemetry={telemetry}
          isOnline={isOnline}
          isLoading={isLoading}
          latencyMs={latencyMs}
          onRefresh={refreshTelemetry}
          onOpenMobile={() => setIsOpenMobile(true)}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {dashboardTab === 'overview' && (
            <DashboardOverview
              telemetry={telemetry}
              isOnline={isOnline}
              transactions={transactions}
              onSelectTab={setDashboardTab}
            />
          )}

          {dashboardTab === 'apps' && <ApplicationsPage />}

          {dashboardTab === 'api-keys' && <ApiKeysPage />}

          {dashboardTab === 'transactions' && (
            <Transactions transactions={transactions} />
          )}

          {dashboardTab === 'relayer' && (
            <RelayerHealth
              telemetry={telemetry}
              isOnline={isOnline}
              latencyMs={latencyMs}
              onRefresh={refreshTelemetry}
            />
          )}

          {dashboardTab === 'sponsor' && (
            <SponsorCapacityPage
              telemetry={telemetry}
              isOnline={isOnline}
              onRefresh={refreshTelemetry}
            />
          )}

          {dashboardTab === 'playground' && (
            <Playground
              telemetry={telemetry}
              isOnline={isOnline}
              onTxCreated={handleTxCreated}
              onNavigate={setDashboardTab as any}
            />
          )}

          {dashboardTab === 'docs' && <DeveloperSetup />}

          {dashboardTab === 'security' && <Security />}
        </main>
      </div>
    </div>
  );
}

export default App;
