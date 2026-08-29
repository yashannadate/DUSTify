import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PageId, RelayerTelemetry } from '../../types';

interface AppLayoutProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  telemetry: RelayerTelemetry | null;
  isOnline: boolean;
  isLoading: boolean;
  latencyMs: number;
  onRefresh: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activePage,
  onSelectPage,
  telemetry,
  isOnline,
  isLoading,
  latencyMs,
  onRefresh,
  children,
}) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onSelectPage={onSelectPage}
        telemetry={telemetry}
        isOnline={isOnline}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          activePage={activePage}
          telemetry={telemetry}
          isOnline={isOnline}
          isLoading={isLoading}
          latencyMs={latencyMs}
          onRefresh={onRefresh}
          onOpenMobile={() => setIsOpenMobile(true)}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
