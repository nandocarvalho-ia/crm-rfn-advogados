import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Send,
  MessageSquare,
  UserCircle,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  Icon: LucideIcon;
  end?: boolean;
  disabled?: boolean;
}

const MAIN_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/crm', label: 'CRM', Icon: Users },
  { to: '/follow-ups', label: 'Follow-ups', Icon: Send },
  { to: '/chat-ao-vivo', label: 'Chat ao Vivo', Icon: MessageSquare },
];

const ACCOUNT_ITEMS: NavItem[] = [
  { to: '/perfil', label: 'Perfil', Icon: UserCircle },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Chamado ao clicar em um item — útil pra fechar o drawer em mobile. */
  onNavigate?: () => void;
  /** Em mobile usamos o Sheet e não queremos o botão de colapsar. */
  showCollapseButton?: boolean;
}

function SidebarItem({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const { to, label, Icon, end, disabled } = item;

  if (disabled) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-on-dark-muted/60 cursor-not-allowed',
          collapsed && 'justify-center px-0',
        )}
        title={collapsed ? `${label} — em breve` : 'Em breve'}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
        {!collapsed && (
          <span className="ml-auto text-[10px] uppercase tracking-wider text-ink-on-dark-muted/60">
            em breve
          </span>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          'text-ink-on-dark-muted hover:bg-app-sidebar-hover hover:text-ink-on-dark',
          isActive && 'bg-app-sidebar-active text-ink-on-dark',
          collapsed && 'justify-center px-0',
        )
      }
      title={collapsed ? label : undefined}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-brand" />
          )}
          <Icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">{label}</span>}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar({
  collapsed = false,
  onToggleCollapse,
  onNavigate,
  showCollapseButton = true,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-app-sidebar text-ink-on-dark transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-white/5 px-4',
          collapsed && 'justify-center px-0',
        )}
      >
        {collapsed ? (
          <span className="flex h-8 w-8 items-center justify-center rounded bg-brand text-sm font-bold text-white">
            R
          </span>
        ) : (
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-wide text-ink-on-dark">RFN</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-ink-on-dark-muted">
              Advogados
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarSection label="Main" collapsed={collapsed}>
          {MAIN_ITEMS.map((item) => (
            <SidebarItem
              key={item.to}
              item={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </SidebarSection>

        <SidebarSection label="Conta" collapsed={collapsed} className="mt-6">
          {ACCOUNT_ITEMS.map((item) => (
            <SidebarItem
              key={item.to}
              item={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </SidebarSection>
      </nav>

      {/* Rodapé: Sair + colapsar */}
      <div className="border-t border-white/5 px-3 py-3 space-y-1">
        <button
          type="button"
          onClick={() => console.log('[RFN] logout stub')}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-on-dark-muted transition-colors hover:bg-app-sidebar-hover hover:text-ink-on-dark',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? 'Sair' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>

        {showCollapseButton && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'hidden md:flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-ink-on-dark-muted/70 transition-colors hover:bg-app-sidebar-hover hover:text-ink-on-dark',
              collapsed && 'justify-center px-0',
            )}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4 shrink-0" />
                <span>Recolher</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}

function SidebarSection({
  label,
  collapsed,
  children,
  className,
}: {
  label: string;
  collapsed: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {!collapsed && (
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-on-dark-muted/70">
          {label}
        </p>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}
