import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/common';
import type { StatusLead } from './types';

interface StatusInlineSelectProps {
  value: StatusLead;
  onChange: (next: StatusLead) => void;
}

const OPTIONS: StatusLead[] = ['novo', 'conversando', 'proposta_enviada', 'convertido'];

export function StatusInlineSelect({ value, onChange }: StatusInlineSelectProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full hover:opacity-80"
          onClick={(e) => e.stopPropagation()}
        >
          <StatusBadge status={value} />
          <ChevronDown className="h-3 w-3 text-ink-muted" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt}
            onClick={(e) => {
              e.stopPropagation();
              if (opt !== value) onChange(opt);
            }}
          >
            <StatusBadge status={opt} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
