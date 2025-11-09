import React, { useEffect, useRef } from 'react';
import './VideoIntro.css';

// Длительность полного видео в миллисекундах
const TOTAL_VIDEO_DURATION = 492757; // 492.757 секунд

interface VideoIntroProps {
  onVideoClick: () => void;
}

const VideoIntro: React.FC<VideoIntroProps> = ({ onVideoClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const startSyncedVideo = () => {
    if (!videoRef.current) return;
    
    // Вычисляем время с начала суток в миллисекундах
    const now = new Date();
    const msFromMidnight = 
      now.getHours() * 3600000 +
      now.getMinutes() * 60000 +
      now.getSeconds() * 1000 +
      now.getMilliseconds();
    
    // Вычисляем позицию внутри цикла видео
    const cyclePosition = msFromMidnight % TOTAL_VIDEO_DURATION;
    
    // Устанавливаем позицию в секундах
    const startPosition = cyclePosition / 1000;
    
    const video = videoRef.current;
    
    // Ждем загрузки метаданных перед установкой позиции
    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        videoRef.current.currentTime = startPosition;
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
      }
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
    
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
  };
  
  const syncVideo = () => {
    console.log('🔄 [SYNC CHECK] Starting sync check...');
    
    if (!videoRef.current) {
      console.log('❌ [SYNC CHECK] Video ref not available');
      return;
    }
    
    const video = videoRef.current;
    
    console.log(`📊 [SYNC CHECK] Video state:`, {
      readyState: video.readyState,
      paused: video.paused,
      ended: video.ended,
      currentTime: video.currentTime.toFixed(2),
      playbackRate: video.playbackRate
    });
    
    // Проверяем что видео готово к коррекции
    if (video.readyState < 2 || video.paused || video.ended) {
      console.log('⚠️ [SYNC CHECK] Video not ready for sync (skipping)');
      return;
    }
    
    try {
      // Вычисляем ожидаемую позицию
      const now = new Date();
      const msFromMidnight = 
        now.getHours() * 3600000 +
        now.getMinutes() * 60000 +
        now.getSeconds() * 1000 +
        now.getMilliseconds();
      
      const cyclePosition = msFromMidnight % TOTAL_VIDEO_DURATION;
      const expectedPosition = cyclePosition / 1000;
      
      // Текущая позиция (с учетом зацикливания)
      const videoDurationSec = TOTAL_VIDEO_DURATION / 1000;
      const actualPosition = video.currentTime % videoDurationSec;
      
      // Вычисляем drift
      const drift = expectedPosition - actualPosition;
      
      console.log(`📐 [SYNC CHECK] Positions:`, {
        expected: expectedPosition.toFixed(2) + 's',
        actual: actualPosition.toFixed(2) + 's',
        drift: drift.toFixed(2) + 's',
        driftAbs: Math.abs(drift).toFixed(2) + 's'
      });
      
      // Мягкая коррекция если drift > 0.2 секунды
      if (Math.abs(drift) > 0.2) {
        const newRate = drift > 0 ? 1.05 : 0.95;
        console.log(`⚡ [SYNC ADJUST] Drift ${drift.toFixed(2)}s detected! Adjusting playback rate to ${newRate}x`);
        
        // Корректируем скорость воспроизведения
        video.playbackRate = newRate;
        
        // Вычисляем сколько времени нужно для коррекции
        // При скорости 1.05x мы нагоняем 0.05 секунды за каждую секунду
        const correctionTime = Math.min(
          (Math.abs(drift) / 0.05) * 1000,
          10000 // Максимум 10 секунд
        );
        
        console.log(`⏱️ [SYNC ADJUST] Will correct for ${(correctionTime / 1000).toFixed(1)}s`);
        
        // Через вычисленное время возвращаем нормальную скорость
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.playbackRate = 1.0;
            console.log('✅ [SYNC ADJUST] Playback rate restored to 1.0x');
          }
        }, correctionTime);
      } else {
        console.log('✅ [SYNC CHECK] Video in sync (no adjustment needed)');
      }
    } catch (error) {
      console.error('❌ [SYNC CHECK] Error during sync:', error);
    }
  };
  
  useEffect(() => {
    // Запускаем видео при монтировании
    startSyncedVideo();
    
    // Запускаем периодическую синхронизацию каждые 10 секунд
    syncIntervalRef.current = setInterval(syncVideo, 10000);
    
    // Обработчик паузы - автоматически возобновляем
    const handlePause = () => {
      console.log('⚠️ [VIDEO] Video paused unexpectedly, resuming...');
      if (videoRef.current && !videoRef.current.ended) {
        videoRef.current.play().catch(err => {
          console.error('Error resuming video:', err);
        });
      }
    };
    
    // Подписываемся на событие паузы
    const video = videoRef.current;
    if (video) {
      video.addEventListener('pause', handlePause);
    }
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (video) {
        video.removeEventListener('pause', handlePause);
      }
    };
  }, []);
  
  return (
    <div className="video-intro" onClick={onVideoClick}>
      <video 
        ref={videoRef}
        className="video-intro__video"
        muted
        loop
        playsInline
        src="./assets/videos/screensaver-full.1.mp4"
      >
        Ваш браузер не поддерживает видео
      </video>
      <div className="video-intro__overlay">
        <p className="video-intro__text">Нажмите на экран для продолжения</p>
      </div>
    </div>
  );
};

export default VideoIntro;
