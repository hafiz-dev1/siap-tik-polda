// file: app/components/RecentActivityTable.tsx
'use client';

import { useState } from 'react';
import { Surat, Lampiran } from '@prisma/client';
import SuratDetailModal from './SuratDetailModal';

type SuratWithLampiran = Surat & { lampiran: Lampiran[] };

interface RecentActivityTableProps {
  recentSurat: SuratWithLampiran[];
}

const formatEnumText = (text: string) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

export default function RecentActivityTable({ recentSurat }: RecentActivityTableProps) {
  const [selectedSurat, setSelectedSurat] = useState<SuratWithLampiran | null>(null);

  return (
    <>
      {recentSurat.length > 0 ? (
        <div className="overflow-auto max-h-[60vh] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <table className="min-w-full leading-normal">
            <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
              <tr>
                <th className="px-4 py-2.5 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider backdrop-blur-sm align-middle w-12">No.</th>
                <th className="px-4 py-2.5 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider backdrop-blur-sm align-middle min-w-[200px]">Perihal</th>
                <th className="px-4 py-2.5 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider backdrop-blur-sm align-middle min-w-[120px]">Dari</th>
                <th className="px-4 py-2.5 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider backdrop-blur-sm align-middle min-w-[120px]">Kepada</th>
                <th className="px-4 py-2.5 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider backdrop-blur-sm align-middle min-w-[100px]">Arah</th>
                <th className="px-4 py-2.5 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider backdrop-blur-sm align-middle min-w-[130px]">Tanggal</th>
                <th className="px-4 py-2.5 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider backdrop-blur-sm align-middle min-w-[140px]">Disposisi</th>
              </tr>
            </thead>
            <tbody>
              {recentSurat.map((surat, index) => (
                <SuratDetailModal key={surat.id} surat={surat}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                    <td className="px-4 py-3.5 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 text-center align-top h-20">
                      <div className="h-full flex items-center justify-center">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-200 dark:border-gray-700 text-sm align-top h-20 min-w-[200px]">
                      <div className="h-full flex flex-col justify-center overflow-hidden">
                        <p className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors overflow-hidden" 
                           style={{ 
                             display: '-webkit-box', 
                             WebkitLineClamp: 3, 
                             WebkitBoxOrient: 'vertical' as const,
                             lineHeight: '1.2em',
                             maxHeight: '3.6em'
                           }} 
                           title={surat.perihal}>
                          {surat.perihal}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 overflow-hidden" 
                           style={{ 
                             display: '-webkit-box', 
                             WebkitLineClamp: 2, 
                             WebkitBoxOrient: 'vertical' as const,
                             lineHeight: '1em',
                             maxHeight: '2em'
                           }} 
                           title={surat.nomor_surat}>
                          {surat.nomor_surat}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-300 align-top h-20 min-w-[120px]">
                      <div className="h-full flex items-center overflow-hidden">
                        <p className="overflow-hidden" 
                           style={{ 
                             display: '-webkit-box', 
                             WebkitLineClamp: 3, 
                             WebkitBoxOrient: 'vertical' as const,
                             lineHeight: '1.2em',
                             maxHeight: '3.6em'
                           }} 
                           title={surat.asal_surat}>
                          {surat.asal_surat}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-300 align-top h-20 min-w-[120px]">
                      <div className="h-full flex items-center overflow-hidden">
                        <p className="overflow-hidden" 
                           style={{ 
                             display: '-webkit-box', 
                             WebkitLineClamp: 3, 
                             WebkitBoxOrient: 'vertical' as const,
                             lineHeight: '1.2em',
                             maxHeight: '3.6em'
                           }} 
                           title={surat.tujuan_surat}>
                          {surat.tujuan_surat}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-200 dark:border-gray-700 text-sm align-top h-20 min-w-[100px]">
                      <div className="h-full flex items-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          surat.arah_surat === 'MASUK' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {surat.arah_surat === 'MASUK' ? 'Masuk' : 'Keluar'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-300 align-top h-20 min-w-[130px]">
                      <div className="h-full flex flex-col justify-center text-xs">
                        <span className="whitespace-nowrap">
                          {new Date(surat.tanggal_diterima_dibuat).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {new Date(surat.tanggal_diterima_dibuat).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-200 dark:border-gray-700 text-sm align-top h-20 min-w-[140px]">
                      <div className="h-full flex flex-wrap content-center gap-0.5 overflow-hidden items-center">
                        {surat.tujuan_disposisi.map((tujuan) => (
                          <span
                            key={tujuan}
                            className="px-1.5 py-0.5 text-xs rounded-sm text-[10px] leading-tight bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                            title={formatEnumText(
                              tujuan
                                .replace('KASUBBID_', '')
                                .replace('KASUBBAG_', '')
                                .replace('KAUR_', '')
                            )}
                          >
                            {formatEnumText(
                              tujuan
                                .replace('KASUBBID_', '')
                                .replace('KASUBBAG_', '')
                                .replace('KAUR_', '')
                            )}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                </SuratDetailModal>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Belum Ada Aktivitas</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Surat yang baru ditambahkan akan muncul di sini.</p>
        </div>
      )}
    </>
  );
}
