import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import type { EvolucaoPonto } from './types';

const fmtDateShort = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const fmtDateLong = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
};

export function EvolucaoSection({ data }: { data: EvolucaoPonto[] }) {
  return (
    <section className="rounded-xl bg-app-card p-6 shadow-sm border border-line">
      <h2 className="text-lg font-semibold text-ink">Evolução temporal</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Leads recebidos e convertidos ao longo do período.
      </p>

      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--line))" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDateShort}
              tick={{ fontSize: 12, fill: 'hsl(var(--ink-muted))' }}
              stroke="hsl(var(--line))"
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'hsl(var(--ink-muted))' }}
              stroke="hsl(var(--line))"
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--app-card))',
                border: '1px solid hsl(var(--line))',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelFormatter={(label) => fmtDateLong(label as string)}
              formatter={(value: number, name: string) => [
                value.toLocaleString('pt-BR'),
                name === 'total' ? 'Total de leads' : 'Convertidos',
              ]}
            />
            <Legend
              verticalAlign="top"
              height={28}
              iconType="circle"
              formatter={(value) =>
                value === 'total' ? 'Total de leads' : 'Convertidos'
              }
              wrapperStyle={{ fontSize: 12, color: 'hsl(var(--ink-secondary))' }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="hsl(var(--brand))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="convertidos"
              stroke="hsl(var(--tag-success))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
