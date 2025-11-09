import React, { useEffect, useRef, useState } from 'react';
import './VideoIntro.css';
import menuData from '../../../data.json';

interface VideoConfig {
  file: string;
  duration: number; // в секундах (float)
}

// Конфигурация видео-плейлиста с оптимизацией дубликатов
// Длительности указаны в секундах с долями после проверки воспроизведения

// Основные уникальные видео
const BASE_VIDEOS: VideoConfig[] = [
  { file: 'ScreenSaverVideo_0.mp4', duration: 95.0 },
  { file: 'ScreenSaverVideo_2.mp4', duration: 30.0 },
  { file: 'ScreenSaverVideo_4.mp4', duration: 73.92 },
  { file: 'ScreenSaverVideo_6.mp4', duration: 110.16 }
];

// Разделитель (повторяющееся видео между основными)
const SEPARATOR_VIDEO: VideoConfig = { file: 'ScreenSaverVideo_1.mp4', duration: 71.66 };

// Паттерн: [базовое → разделитель → базовое → разделитель → ...]
// Последовательность: 0 → 1 → 2 → 1 → 4 → 1 → 6 → 1
// Общая длительность: (95.0 + 30.0 + 73.92 + 110.16) + (71.66 * 4) = 595.72 секунд (~9 минут 55.72 секунд)
const TOTAL_CYCLE_DURATION = 595.72; // секунды

// Ручная коррекция синхронизации между киосками (в секундах)
// Настраивается в data.json → videoSyncOffset
// +0.5 = сдвигает видео вперед на 0.5 сек (видео начнется позже)
// -0.5 = сдвигает видео назад на 0.5 сек (видео начнется раньше)
// 0.0 = без коррекции (по умолчанию)
const SYNC_OFFSET = menuData.videoSyncOffset || 0.0; // секунды

interface VideoIntroProps {
  onVideoClick: () => void;
}

const VideoIntro: React.FC<VideoIntroProps> = ({ onVideoClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideoSrc, setCurrentVideoSrc] = useState<string>('');
  const isLoadingRef = useRef<boolean>(false);
  const isTransitioningRef = useRef<boolean>(false);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const getCurrentVideoInfo = () => {
    const now = new Date();
    // Время от полуночи в секундах с долями
    const secondsFromMidnight = 
      now.getHours() * 3600 +
      now.getMinutes() * 60 +
      now.getSeconds() +
      now.getMilliseconds() / 1000;
    
    // Применяем ручную коррекцию синхронизации
    const cyclePosition = (secondsFromMidnight + SYNC_OFFSET) % TOTAL_CYCLE_DURATION;
    
    let elapsed = 0;
    
    // Проходим по паттерну: базовое видео → разделитель → базовое видео → разделитель...
    for (let i = 0; i < BASE_VIDEOS.length; i++) {
      // Базовое видео
      if (cyclePosition < elapsed + BASE_VIDEOS[i].duration) {
        return {
          videoIndex: i * 2, // четные индексы (0, 2, 4, 6)
          videoFile: BASE_VIDEOS[i].file,
          startPosition: cyclePosition - elapsed
        };
      }
      elapsed += BASE_VIDEOS[i].duration;
      
      // Разделитель после базового видео
      if (cyclePosition < elapsed + SEPARATOR_VIDEO.duration) {
        return {
          videoIndex: i * 2 + 1, // нечетные индексы (1, 3, 5, 7)
          videoFile: SEPARATOR_VIDEO.file,
          startPosition: cyclePosition - elapsed
        };
      }
      elapsed += SEPARATOR_VIDEO.duration;
    }
    
    // Fallback: если вышли за границы (ошибка округления), берем первое видео
    console.warn('cyclePosition out of bounds, using first video');
    return {
      videoIndex: 0,
      videoFile: BASE_VIDEOS[0].file,
      startPosition: 0
    };
  };
  
  const startSyncedVideo = () => {
    // Защита от конкурентных вызовов
    if (isTransitioningRef.current) {
      console.warn('Video transition already in progress, skipping');
      return;
    }
    
    const info = getCurrentVideoInfo();
    if (!info || !videoRef.current || isLoadingRef.current) return;
    
    // Используем относительный путь от index.html
    const videoPath = `./assets/videos/${info.videoFile}`;
    const video = videoRef.current;
    
    // Проверяем, нужно ли менять видео
    const needsNewVideo = !video.src.includes(info.videoFile);
    
    if (needsNewVideo) {
      isTransitioningRef.current = true;
      isLoadingRef.current = true;
      
      // Очищаем старые обработчики чтобы избежать memory leak
      const oldMetadataHandler = video.onloadedmetadata;
      if (oldMetadataHandler) {
        video.removeEventListener('loadedmetadata', oldMetadataHandler as any);
      }
      
      // Таймаут на случай если видео не загрузится
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      loadTimeoutRef.current = setTimeout(() => {
        console.error('Video load timeout, resetting flags');
        isLoadingRef.current = false;
        isTransitioningRef.current = false;
      }, 10000); // 10 секунд
      
      setCurrentVideoSrc(videoPath);
      
      // Обработчик успешной загрузки
      const handleLoadedMetadata = () => {
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
        }
        
        if (videoRef.current) {
          // Перерасчитываем позицию с учетом времени загрузки
          const freshInfo = getCurrentVideoInfo();
          if (freshInfo) {
            videoRef.current.currentTime = freshInfo.startPosition;
            videoRef.current.play().catch(err => {
              console.error('Error playing video:', err);
            });
          }
          isLoadingRef.current = false;
          isTransitioningRef.current = false;
        }
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('error', handleError);
      };
      
      // Обработчик ошибки загрузки
      const handleError = (e: Event) => {
        console.error('Video load error:', e);
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
        }
        isLoadingRef.current = false;
        isTransitioningRef.current = false;
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('error', handleError);
        
        // Попытка перезапуска через 2 секунды
        setTimeout(() => {
          startSyncedVideo();
        }, 2000);
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('error', handleError);
    }
  };
  
  const handleVideoEnded = () => {
    // Переключаемся на следующее видео
    startSyncedVideo();
  };
  
  useEffect(() => {
    // Запускаем видео при монтировании
    startSyncedVideo();
    
    // DEV: Health checker для отладки зависаний
    const healthCheckInterval = setInterval(() => {
      if (videoRef.current) {
        const video = videoRef.current;
        
        console.log('🔍 Video Health Check:', {
          currentTime: video.currentTime.toFixed(2),
          duration: video.duration ? video.duration.toFixed(2) : 'N/A',
          paused: video.paused,
          ended: video.ended,
          readyState: video.readyState, // 0=nothing, 1=metadata, 2=current, 3=future, 4=enough
          networkState: video.networkState, // 0=empty, 1=idle, 2=loading, 3=no source
          error: video.error ? video.error.message : null,
          src: video.src.split('/').pop(),
          isLoading: isLoadingRef.current,
          isTransitioning: isTransitioningRef.current
        });
        
        // Проверка зависания: currentTime не меняется
        if (!video.paused && !video.ended && video.readyState === 4) {
          const lastTime = video.getAttribute('data-last-time');
          if (lastTime && parseFloat(lastTime) === video.currentTime) {
            console.error('⚠️ VIDEO STUCK DETECTED! Attempting restart...');
            startSyncedVideo();
          }
          video.setAttribute('data-last-time', video.currentTime.toString());
        }
      }
    }, 3000); // проверка каждые 3 секунды
    
    return () => {
      // Очистка при размонтировании
      clearInterval(healthCheckInterval);
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      if (videoRef.current) {
        videoRef.current.pause();
        // Не очищаем src чтобы избежать лишней перезагрузки при ремонтировании
        // videoRef.current.src = '';
      }
      // Сбрасываем флаги
      isLoadingRef.current = false;
      isTransitioningRef.current = false;
    };
  }, []);
  
  return (
    <div className="video-intro" onClick={onVideoClick}>
      <video 
        ref={videoRef}
        className="video-intro__video"
        muted
        playsInline
        onEnded={handleVideoEnded}
        src={currentVideoSrc}
      >
        Ваш браузер не поддерживает видео
      </video>
    </div>
  );
};

export default VideoIntro;
