import { Bell, ChevronDown, Menu, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

export function Topbar({ onOpenMobileSidebar }: TopbarProps) {
  return (
    <header className="flex h-16 items-center gap-2 border-b border-line bg-app-card px-4 md:px-6">
      {/* Hamburguer (mobile) */}
      <button
        type="button"
        onClick={onOpenMobileSidebar}
        className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary hover:bg-app-bg"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Busca */}
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
        {/* Notificações */}
        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary hover:bg-app-bg"
          aria-label="Notificações"
          title="Notificações (em breve)"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* Menu do usuário */}
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
            <DropdownMenuItem disabled>Perfil</DropdownMenuItem>
            <DropdownMenuItem disabled>Configurações</DropdownMenuItem>
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
