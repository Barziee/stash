import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 pb-16 md:pb-0 overflow-y-auto">
        <div className="w-full max-w-xl mx-auto px-4 py-4">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
