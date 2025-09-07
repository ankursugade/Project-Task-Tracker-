import { AppSidebar } from '@/components/AppSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
