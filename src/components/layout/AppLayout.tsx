import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Rotas full-bleed ocupam a área de conteúdo sem padding (ex: chat ao vivo).
  const fullBleed = location.pathname.startsWith('/chat-ao-vivo');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-app-bg">
      {/* Sidebar desktop */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
      </div>

      {/* Sidebar mobile (drawer) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="p-0 w-60 max-w-none bg-app-sidebar border-r-0 text-ink-on-dark [&>button]:text-ink-on-dark [&>button]:opacity-80"
        >
          <Sidebar
            collapsed={false}
            onNavigate={() => setMobileOpen(false)}
            showCollapseButton={false}
          />
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main
          className={cn(
            'flex-1 min-h-0',
            fullBleed ? 'overflow-hidden' : 'overflow-y-auto p-4 md:p-8',
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
