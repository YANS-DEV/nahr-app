import { ReactNode } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import DashboardWrapper from '@/components/DashboardWrapper';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <DashboardWrapper session={session}>
      {children}
    </DashboardWrapper>
  );
}