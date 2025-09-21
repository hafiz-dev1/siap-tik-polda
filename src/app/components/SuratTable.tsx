'use client';

import { memo, useCallback } from 'react';
import { Surat, Lampiran, Role } from '@prisma/client';
import SuratFormModal from './SuratFormModal';
import DeleteSuratButton from './DeleteSuratButton';

type SuratWithLampiran = Surat & { lampiran: Lampiran[] };

interface SuratTableProps {
  suratData: SuratWithLampiran[];
  role?: Role | null;
  isAnimating: boolean;
  firstItemIndex: number;
  onSuratClick: (surat: SuratWithLampiran) => void;
  formatEnumText: (text: string) => string;
  formatDate: (date: string | Date) => string;
  formatTime: (date: string | Date) => string;
  getTagColor: (target: string) => string;
}

// Icons components
const DownloadIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21h-15A1.5 1.5 0 0 1 3 19.5v-15A1.5 1.5 0 0 1 4.5 3h9.379a1.5 1.5 0 0 1 1.06.44l4.621 4.621a1.5 1.5 0 0 1 .44 1.06V19.5A1.5 1.5 0 0 1 19.5 21zM15 3.75V7.5a.75.75 0 0 0 .75.75h3.75" />
  </svg>
));

const EditIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
));

const DeleteIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.576 0h12.576" />
  </svg>
));

// Memoized table row component for better performance
const SuratTableRow = memo(function SuratTableRow({
  surat,
  index,
  firstItemIndex,
  role,
  onSuratClick,
  formatEnumText,
  formatDate,
  formatTime,
  getTagColor,
  tdStyle,
}: {
  surat: SuratWithLampiran;
  index: number;
  firstItemIndex: number;
  role?: Role | null;
  onSuratClick: (surat: SuratWithLampiran) => void;
  formatEnumText: (text: string) => string;
  formatDate: (date: string | Date) => string;
  formatTime: (date: string | Date) => string;
  getTagColor: (target: string) => string;
  tdStyle: string;
}) {
  const handleRowClick = useCallback(() => {
    onSuratClick(surat);
  }, [surat, onSuratClick]);

  const handleDownloadClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (surat.lampiran[0]) {
      window.open(surat.lampiran[0].path_file, '_blank');
    }
  }, [surat.lampiran]);

  return (
    <tr 
      onClick={handleRowClick}
      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
    >
      <td className={`${tdStyle} w-12 text-center text-gray-500 dark:text-gray-400 align-middle`}>
        <div className="h-full flex items-center justify-center">
          {firstItemIndex + index}
        </div>
      </td>
      <td className={`${tdStyle} min-w-[180px]`}>
        <div className="h-full flex flex-col justify-center overflow-hidden">
          <p className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors overflow-hidden" 
             style={{ 
               display: '-webkit-box', 
               WebkitLineClamp: 2, 
               WebkitBoxOrient: 'vertical' as const,
               lineHeight: '1.2em',
               maxHeight: '2.4em'
             }} 
             title={surat.perihal}>
            {surat.perihal}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate" title={surat.nomor_surat}>
            {surat.nomor_surat}
          </p>
        </div>
      </td>
      <td className={`${tdStyle} min-w-[130px]`}>
        <div className="h-full flex items-center overflow-hidden">
          <p className="truncate" title={surat.asal_surat}>{surat.asal_surat}</p>
        </div>
      </td>
      <td className={`${tdStyle} min-w-[130px]`}>
        <div className="h-full flex items-center overflow-hidden">
          <p className="truncate" title={surat.tujuan_surat}>{surat.tujuan_surat}</p>
        </div>
      </td>
      <td className={`${tdStyle} min-w-[130px] text-xs`}>
        <div className="h-full flex flex-col justify-center">
          <span className="whitespace-nowrap">
            {formatDate(surat.tanggal_diterima_dibuat)}
          </span>
          <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {formatTime(surat.tanggal_diterima_dibuat)}
          </span>
        </div>
      </td>
      <td className={`${tdStyle} min-w-[140px]`}>
        <div className="h-full flex flex-wrap content-center gap-0.5 overflow-hidden items-center">
          {surat.tujuan_disposisi.map((tujuan) => (
            <span
              key={tujuan}
              className={`px-1.5 py-0.5 text-xs rounded-full text-[10px] leading-tight ${getTagColor(tujuan)}`}
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
      <td className={`${tdStyle} min-w-[200px]`}>
        <div className="h-full flex items-center overflow-hidden">
          <p className="dark:text-gray-300 overflow-hidden" 
             style={{ 
               display: '-webkit-box', 
               WebkitLineClamp: 3, 
               WebkitBoxOrient: 'vertical' as const,
               lineHeight: '1.2em',
               maxHeight: '3.6em'
             }} 
             title={surat.isi_disposisi}>
            {surat.isi_disposisi}
          </p>
        </div>
      </td>
      <td className={`${tdStyle} w-28 text-center`}>
        <div className="h-full flex items-center justify-center space-x-1.5">
          {surat.lampiran[0] && (
            <button
              onClick={handleDownloadClick}
              title="Lihat Dokumen"
              className="p-1.5 rounded-full text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              <DownloadIcon />
            </button>
          )}
          {role === 'ADMIN' && (
            <>
              <div onClick={(e) => e.stopPropagation()}>
                <SuratFormModal suratToEdit={surat}>
                  <button
                    title="Ubah"
                    className="p-1.5 rounded-full text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    type="button"
                  >
                    <EditIcon />
                  </button>
                </SuratFormModal>
              </div>
              
              <div onClick={(e) => e.stopPropagation()}>
                <DeleteSuratButton suratId={surat.id}>
                  <button
                    title="Hapus"
                    type="button"
                    className="p-1.5 rounded-full text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    <DeleteIcon />
                  </button>
                </DeleteSuratButton>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
});

const SuratTable = memo(function SuratTable({
  suratData,
  role,
  isAnimating,
  firstItemIndex,
  onSuratClick,
  formatEnumText,
  formatDate,
  formatTime,
  getTagColor,
}: SuratTableProps) {
  // Memoized styles
  const thStyle = 'px-4 py-2.5 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider backdrop-blur-sm align-middle';
  const tdStyle = 'px-4 py-3.5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-gray-300 align-top h-20';

  return (
    <div
      className={`flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-out will-change-transform transform-gpu overflow-hidden ${
        isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="overflow-auto max-h-[60vh] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        <table className="min-w-full leading-normal">
          <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
            <tr>
              <th className={`${thStyle} w-12 text-center rounded-tl-lg`}>No.</th>
              <th className={`${thStyle} min-w-[180px]`}>Perihal</th>
              <th className={`${thStyle} min-w-[130px]`}>Dari</th>
              <th className={`${thStyle} min-w-[130px]`}>Kepada</th>
              <th className={`${thStyle} min-w-[130px] whitespace-nowrap`}>Diterima</th>
              <th className={`${thStyle} min-w-[140px]`}>Disposisi</th>
              <th className={`${thStyle} min-w-[200px]`}>Isi Disposisi</th>
              <th className={`${thStyle} w-28 text-center rounded-tr-lg`}>Aksi</th>
            </tr>
          </thead>
          <tbody
            className={`transition-opacity duration-300 ease-out ${
              isAnimating ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {suratData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Tidak ada data yang cocok dengan filter.</span>
                  </div>
                </td>
              </tr>
            ) : (
              suratData.map((surat, index) => (
                <SuratTableRow
                  key={surat.id}
                  surat={surat}
                  index={index}
                  firstItemIndex={firstItemIndex}
                  role={role}
                  onSuratClick={onSuratClick}
                  formatEnumText={formatEnumText}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  getTagColor={getTagColor}
                  tdStyle={tdStyle}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default SuratTable;