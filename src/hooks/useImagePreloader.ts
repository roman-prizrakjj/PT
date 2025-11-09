import { useEffect, useState } from 'react';

/**
 * Хук для предзагрузки изображений в фоновом режиме
 * Загружает массив URL и отслеживает прогресс
 */
export const useImagePreloader = (imageUrls: string[]) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) {
      setIsLoading(false);
      return;
    }

    let loadedImages = 0;

    // Функция для загрузки одного изображения
    const preloadImage = (url: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          loadedImages++;
          setLoadedCount(loadedImages);
          resolve();
        };
        
        img.onerror = () => {
          // Не блокируем загрузку остальных при ошибке
          console.warn(`Failed to preload: ${url}`);
          loadedImages++;
          setLoadedCount(loadedImages);
          resolve();
        };
        
        img.src = url;
      });
    };

    // Загружаем все изображения параллельно
    Promise.all(imageUrls.map(preloadImage))
      .then(() => {
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Preload error:', error);
        setIsLoading(false);
      });

    // Cleanup не нужен - изображения остаются в кеше браузера
  }, [imageUrls]);

  return {
    isLoading,
    loadedCount,
    totalCount: imageUrls.length,
    progress: imageUrls.length > 0 ? (loadedCount / imageUrls.length) * 100 : 0
  };
};
