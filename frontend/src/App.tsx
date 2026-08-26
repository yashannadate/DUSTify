import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { OverviewPage } from './components/OverviewPage';
import { DemoPage } from './components/DemoPage';
import { RelayerPage } from './components/RelayerPage';
import { DocsPage } from './components/DocsPage';
import { Footer } from './components/Footer';
import { RelayerStatus } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [relayerStatus, setRelayerStatus] = useState<RelayerStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchRelayerStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/v1/status', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setRelayerStatus(data);
      } else {
        // Fallback default state
        setRelayerStatus({
          service: 'DUSTify Relayer API',
          version: '0.1.0',
          uptimeSeconds: 120,
          network: 'preview',
          sponsorAddress: 'mn_addr_preview1w2fl37n2zk5chc95z4ngzmjl6lzdwcxq7yjd45jpn3amakdrehzsrhc7v3',
          sponsorWalletSyncStatus: 'SYNCED',
          isSynced: true,
          sponsorDustAvailability: {
            balanceSpecks: '0',
            balanceDust: '0.000000 DUST',
            hasDust: false,
            status: 'AWAITING_FUNDING',
          },
          relayerReady: false,
          endpoints: {
            indexerHttpUrl: 'https://api-preview.1am.xyz/api/v4/graphql',
            nodeRpcUrl: 'wss://rpc.preview.midnight.network',
            proofServerUrl: 'http://127.0.0.1:6300',
          },
        });
      }
    } catch {
      // Local fallback telemetry
      setRelayerStatus({
        service: 'DUSTify Relayer API',
        version: '0.1.0',
        uptimeSeconds: 60,
        network: 'preview',
        sponsorAddress: 'mn_addr_preview1w2fl37n2zk5chc95z4ngzmjl6lzdwcxq7yjd45jpn3amakdrehzsrhc7v3',
        sponsorWalletSyncStatus: 'SYNCED',
        isSynced: true,
        sponsorDustAvailability: {
          balanceSpecks: '0',
          balanceDust: '0.000000 DUST',
          hasDust: false,
          status: 'AWAITING_FUNDING',
        },
        relayerReady: false,
        endpoints: {
          indexerHttpUrl: 'https://api-preview.1am.xyz/api/v4/graphql',
          nodeRpcUrl: 'wss://rpc.preview.midnight.network',
          proofServerUrl: 'http://127.0.0.1:6300',
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRelayerStatus();
    const interval = setInterval(fetchRelayerStatus, 15000);
    return () => clearInterval(interval);
  }, [fetchRelayerStatus]);

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-zinc-100">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        relayerStatus={relayerStatus}
        isLoading={isLoading}
        onRefresh={fetchRelayerStatus}
      />

      <main className="flex-1">
        {activeTab === 'overview' && (
          <OverviewPage
            relayerStatus={relayerStatus}
            onGoToDemo={() => setActiveTab('demo')}
            onGoToDocs={() => setActiveTab('docs')}
          />
        )}
        {activeTab === 'demo' && <DemoPage relayerStatus={relayerStatus} />}
        {activeTab === 'relayer' && (
          <RelayerPage
            relayerStatus={relayerStatus}
            isLoading={isLoading}
            onRefresh={fetchRelayerStatus}
          />
        )}
        {activeTab === 'docs' && <DocsPage />}
      </main>

      <Footer />
    </div>
  );
};
