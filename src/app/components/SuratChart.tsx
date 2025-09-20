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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-96 transition-all duration-300 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Statistik Surat 12 Bulan Terakhir
        </h3>
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      </div>
      {loading && (
        <div className="flex items-center justify-center h-80">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            Memuat data statistik...
          </div>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.972-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-red-500 font-medium">Gagal memuat data</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{error}</p>
          </div>
        </div>
      )}
      {!loading && !error && data.length > 0 && (
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
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{
                color: theme === 'dark' ? '#f9fafb' : '#111827',
                fontWeight: 'bold',
              }}
            />
            <Legend 
              wrapperStyle={{ 
                fontSize: '14px', 
                paddingTop: '20px',
                color: theme === 'dark' ? '#f9fafb' : '#111827'
              }} 
            />
            <Bar dataKey="masuk" name="Surat Masuk" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="keluar" name="Surat Keluar" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
      {!loading && !error && data.length === 0 && (
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada data statistik untuk ditampilkan</p>
          </div>
        </div>
      )}
    </div>
  );
}
