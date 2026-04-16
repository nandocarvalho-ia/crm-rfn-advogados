import { CalendarRange } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PeriodKey } from './mockData';

interface PeriodSelectorProps {
  value: PeriodKey;
  onChange: (value: PeriodKey) => void;
}

const LABELS: Record<PeriodKey, string> = {
  today: 'Hoje',
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  '90d': 'Últimos 90 dias',
  custom: 'Personalizado',
};

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <CalendarRange className="h-4 w-4 text-ink-muted" />
      <Select value={value} onValueChange={(v) => onChange(v as PeriodKey)}>
        <SelectTrigger className="w-[200px] h-10 bg-app-card border-line text-ink">
          <SelectValue>{LABELS[value]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(LABELS) as PeriodKey[]).map((k) => (
            <SelectItem key={k} value={k}>
              {LABELS[k]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
