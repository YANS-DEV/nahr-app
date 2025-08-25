import SessionProvider from '@/components/SessionProvider';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}