import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FlowVisualizer } from './components/FlowVisualizer';
import { DemoExecutionSection } from './components/DemoExecutionSection';
import { RelayerMonitor } from './components/RelayerMonitor';
import { ComparisonSection } from './components/ComparisonSection';
import { SdkPlayground } from './components/SdkPlayground';
import { Footer } from './components/Footer';
import { RelayerStatus } from './types';

export const App: React.FC = () => {
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
        // Fallback default Preview state if relayer is running in background or another port
        setRelayerStatus({
          service: 'DUSTify Relayer API',
          version: '0.1.0',
          uptimeSeconds: 120,
          network: 'preview',
          sponsorAddress: 'mn_unshielded1z9v5a3h8q90w7k5e2l4r8m6j1c0p3x7y2f8d',
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
      // Offline / standalone demo mode fallback
      setRelayerStatus({
        service: 'DUSTify Relayer API',
        version: '0.1.0',
        uptimeSeconds: 60,
        network: 'preview',
        sponsorAddress: 'mn_unshielded1z9v5a3h8q90w7k5e2l4r8m6j1c0p3x7y2f8d',
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

  const scrollToDemo = () => {
    document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSdk = () => {
    document.getElementById('sdk-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-slate-100 flex flex-col selection:bg-dust-cyan selection:text-midnight-950">
      <Navbar relayerStatus={relayerStatus} isLoading={isLoading} onRefresh={fetchRelayerStatus} />

      <main className="flex-1">
        <HeroSection onExploreDemo={scrollToDemo} onExploreSdk={scrollToSdk} />
        <FlowVisualizer />
        <DemoExecutionSection relayerStatus={relayerStatus} />
        <RelayerMonitor relayerStatus={relayerStatus} isLoading={isLoading} onRefresh={fetchRelayerStatus} />
        <ComparisonSection />
        <div id="sdk-section">
          <SdkPlayground />
        </div>
      </main>

      <Footer />
    </div>
  );
};
