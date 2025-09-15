// file: app/admin/components/SuratChart.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ChartData = {
  month: string;
  masuk: number;
  keluar: number;
};

type Props = {
  data: ChartData[];
};

export default function SuratChart({ data }: Props) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-96">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistik Surat 12 Bulan Terakhir</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: -10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }} 
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip 
            cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} 
            contentStyle={{
              background: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
          <Bar dataKey="masuk" name="Surat Masuk" fill="#4ade80" radius={[4, 4, 0, 0]} />
          <Bar dataKey="keluar" name="Surat Keluar" fill="#60a5fa" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}