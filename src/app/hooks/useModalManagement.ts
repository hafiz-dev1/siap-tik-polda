import { useState, useCallback } from 'react';
import { Surat, Lampiran } from '@prisma/client';

type SuratWithLampiran = Surat & { lampiran: Lampiran[] };

export function useModalManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState<SuratWithLampiran | null>(null);

  const openModal = useCallback((surat: SuratWithLampiran) => {
    setSelectedSurat(surat);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    // Add a small delay before clearing selectedSurat to ensure smooth animation
    setTimeout(() => {
      setSelectedSurat(null);
    }, 200);
  }, []);

  return {
    isModalOpen,
    selectedSurat,
    openModal,
    closeModal,
  };
}