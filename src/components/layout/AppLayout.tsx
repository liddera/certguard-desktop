import { ReactNode } from 'react';
import { Topbar } from './Topbar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="w-full h-screen flex flex-col bg-white">
      <Topbar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}