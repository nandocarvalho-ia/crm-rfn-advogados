import { Bell, ChevronDown, Loader2, Menu, Search, TrendingUp, UserCheck, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAvisos } from '@/hooks/useAvisos';
import { cn } from '@/lib/utils';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

export function Topbar({ onOpenMobileSidebar }: TopbarProps) {
  const navigate = useNavigate();
  const { data: avisos, isLoading } = useAvisos();
  const total = (avisos?.novos ?? 0) + (avisos?.aguardando ?? 0) + (avisos?.conversoes ?? 0);

  return (
    <header className="flex h-16 items-center gap-2 border-b border-line bg-app-card px-4 md:px-6">
      <button
        type="button"
        onClick={onOpenMobileSidebar}
        className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary hover:bg-app-bg"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <Input
          type="search"
          placeholder="Buscar..."
          className="pl-9 h-10 bg-app-bg border-line text-ink placeholder:text-ink-muted focus-visible:ring-brand"
          disabled
          title="Busca global (em breve)"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Avisos */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary hover:bg-app-bg"
              aria-label="Avisos"
            >
              <Bell className="h-5 w-5" />
              {total > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
                  {total > 99 ? '99+' : total}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Avisos</span>
              {isLoading && <Loader2 className="h-3 w-3 animate-spin text-ink-muted" />}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <AvisoItem
              icon={<UserPlus className="h-4 w-4 text-tag-info" />}
              label="Novos leads (24h)"
              count={avisos?.novos ?? 0}
              description="Entraram no CRM nas últimas 24 horas"
              onClick={() => navigate('/crm')}
            />

            <AvisoItem
              icon={<UserCheck className="h-4 w-4 text-tag-warning" />}
              label="Aguardando retorno"
              count={avisos?.aguardando ?? 0}
              description="Qualificados parados há mais de 2h"
              onClick={() => navigate('/crm')}
            />

            <AvisoItem
              icon={<TrendingUp className="h-4 w-4 text-tag-success" />}
              label="Conversões recentes"
              count={avisos?.conversoes ?? 0}
              description="Leads marcados como convertidos nos últimos 30 dias"
              onClick={() => navigate('/crm')}
            />

            {total === 0 && !isLoading && (
              <div className="px-3 py-6 text-center text-xs text-ink-muted">
                Tudo em dia. Nenhum aviso no momento.
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-app-bg"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-light text-sm font-semibold text-brand">
                DR
              </span>
              <span className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-sm font-medium text-ink">Dr. Roger</span>
                <span className="text-xs text-ink-muted">RFN Advogados</span>
              </span>
              <ChevronDown className="h-4 w-4 text-ink-muted hidden md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Dr. Roger</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/perfil">Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => console.log('[RFN] logout stub')}>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function AvisoItem({
  icon,
  label,
  count,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  description: string;
  onClick: () => void;
}) {
  const disabled = count === 0;
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors',
        disabled
          ? 'text-ink-muted cursor-default'
          : 'hover:bg-app-bg cursor-pointer',
      )}
    >
      <span className="mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('text-sm font-medium', disabled ? 'text-ink-muted' : 'text-ink')}>
            {label}
          </span>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              count > 0 ? 'bg-brand text-white' : 'bg-app-bg text-ink-muted',
            )}
          >
            {count}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-ink-muted">{description}</p>
      </div>
    </button>
  );
}
