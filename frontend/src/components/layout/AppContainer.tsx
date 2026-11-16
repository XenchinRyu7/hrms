import React from 'react';
import { AuthProvider } from '../../lib/auth-context';
import { HRMSAppShell } from './HRMSAppShell';

interface AppContainerProps {
  children: React.ReactNode;
  activePath?: string;
}

export function AppContainer({ children, activePath = '/' }: AppContainerProps) {
  return (
    <AuthProvider>
      <HRMSAppShell activePath={activePath}>
        {children}
      </HRMSAppShell>
    </AuthProvider>
  );
}
