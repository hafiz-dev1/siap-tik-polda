// file: app/components/SuratChart.tsx
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ChartData = {
  month: string;
  masuk: number;
  keluar: number;
};

type Props = {
  // If you still want to allow pre-fetched data, keep optional
  initialData?: ChartData[];
};

export default function SuratChart({ initialData }: Props) {
  const { theme } = useTheme();
  const [data, setData] = useState<ChartData[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/surat/statistik', { cache: 'no-store' });
        if (!res.ok) throw new Error('Gagal memuat data');
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Terjadi kesalahan');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [initialData]);

  const tickColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
  const gridColor = theme === 'dark' ? '#4b5563' : '#e5e7eb';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-96">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Statistik Surat 12 Bulan Terakhir
      </h3>
      {loading && <div className="text-sm text-gray-500 dark:text-gray-300">Memuat...</div>}
      {error && <div className="text-sm text-red-500">{error}</div>}
      {!loading && !error && (
        <ResponsiveContainer width="100%" height="90%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: -10, bottom: 20 }}
          >
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: tickColor }}
              angle={-45}
              textAnchor="end"
              height={60}
              stroke={gridColor}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: tickColor }}
              stroke={gridColor}
            />
            <Tooltip
              cursor={{ fill: 'rgba(129, 140, 248, 0.1)' }}
              contentStyle={{
                background: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderRadius: '0.5rem',
                border: `1px solid ${gridColor}`,
                color: theme === 'dark' ? '#f9fafb' : '#111827',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
            <Bar dataKey="masuk" name="Surat Masuk" fill="#4ade80" radius={[4, 4, 0, 0]} />
            <Bar dataKey="keluar" name="Surat Keluar" fill="#60a5fa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
