import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '../types/quiz';

/**
 * UIStore - Zustand Store для управления UI состоянием
 *
 * Используется в Task3 и Task4
 */

interface UIStore {
  // Состояние
  theme: Theme;
  // TODO: Добавьте другие UI-состояния (soundEnabled)
  soundEnabled: boolean;
  isModalOpen: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSound: () => void;
  // TODO: Добавьте другие actions (toggleTheme, toggleSound)
  openModal: () => void;
  closeModal: () => void;
}

// TODO: Создайте store с помощью create<UIStore>()
// Оберните в persist middleware для автосохранения в localStorage
export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Начальное состояние
      theme: 'light', // TODO: Добавьте другие поля (soundEnabled и т.д.)
      soundEnabled: true,
      isModalOpen: false,
      // Actions
      setTheme: (theme: Theme) => set({ theme }),

      // TODO: Добавьте другие actions
      //   toggleTheme: () => set((state) => ...,
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      // Пример toggleSound:
   
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false }),
    }),
    {
      name: 'ui-storage', // ключ в localStorage
    }
  )
);