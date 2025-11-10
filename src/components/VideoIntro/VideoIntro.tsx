import React, { useEffect, useRef, useState } from 'react';
import './VideoIntro.css';

// Конфигурация
const DEBUG_MODE = false; // Включить дебаг панель
const ENABLE_SYNC = false; // Включить автоматическую синхронизацию видео
const SYNC_INTERVAL_MS = 10000; // Интервал синхронизации видео (мс)
const USE_FIXED_DAY = false; // Использовать фиксированный день недели для тестирования
const FIXED_DAY_OF_WEEK = 6; // День недели для теста (0=Вс, 1=Пн, 2=Вт, 3=Ср, 4=Чт, 5=Пт, 6=Сб)

// Конфигурация плейлистов видео
// Будние дни (Понедельник-Пятница)
const WEEKDAY_PLAYLIST = [
  { file: 'SSV_0_PromoBugBounty.mp4', duration: 95.000 },
  { file: 'SSV_5_AboutPT.mp4', duration: 71.67 },
  { file: 'SSV_1_DemoBugBounty.mp4', duration: 108.800 },
  { file: 'SSV_5_AboutPT.mp4', duration: 71.67 },
  { file: 'SSV_2_PromoCyberBattle.mp4', duration: 73.920 },
  { file: 'SSV_5_AboutPT.mp4', duration: 71.67 }
];

// Выходные дни (Суббота-Воскресенье)
const WEEKEND_PLAYLIST = [
  { file: 'SSV_0_PromoBugBounty.mp4', duration: 95.000 },
  { file: 'SSV_5_AboutPT.mp4', duration: 71.67 },
  { file: 'SSV_1_DemoBugBounty.mp4', duration: 108.800 },
  { file: 'SSV_5_AboutPT.mp4', duration: 71.67 },
  { file: 'SSV_2_PromoCyberBattle.mp4', duration: 73.920 },
  { file: 'SSV_5_AboutPT.mp4', duration: 71.67 },
  { file: 'SSV_3_PromoEducation.mp4', duration: 110.160 },
  { file: 'SSV_5_AboutPT.mp4', duration: 71.67 },
  { file: 'SSV_4_ProgrammingOlymp.mp4', duration: 30.000 },
  { file: 'SSV_5_AboutPT.mp4', duration: 71.67 }
];

// Функция для получения активного плейлиста
function getActivePlaylist(): Array<{ file: string; duration: number }> {
  const dayOfWeek = USE_FIXED_DAY ? FIXED_DAY_OF_WEEK : new Date().getDay();
  // Суббота (6) или Воскресенье (0)
  return (dayOfWeek === 0 || dayOfWeek === 6) ? WEEKEND_PLAYLIST : WEEKDAY_PLAYLIST;
}

// Вспомогательные функции из DetectNowVideo.JS
function getDayStartOffsetSeconds(d = new Date()): number {
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000;
}

function getCurrentVideo(durations: number[], offset = getDayStartOffsetSeconds()): { VideoIndex: number; VideoTime: number } {
  // Накопим суммы, определим total
  let total = 0;
  const cum: number[] = [];
  for (const x of durations) cum.push(total += x);
  if (!total) return { VideoIndex: -1, VideoTime: 0 };

  // Положение в цикле
  const t = offset % total;

  // Бинарный поиск первого cum[i] >= t
  let lo = 0;
  let hi = cum.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (cum[mid] >= t) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }

  const i = lo;
  const prev = i ? cum[i - 1] : 0;
  const pos = t - prev;

  return { VideoIndex: i, VideoTime: pos };
}

interface VideoIntroProps {
  onVideoClick: () => void;
}

const VideoIntro: React.FC<VideoIntroProps> = ({ onVideoClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [, setCurrentVideoIndex] = useState(0);
  const [debugInfo, setDebugInfo] = useState({
    currentTime: '--:--:--',
    offsetFromMidnight: '0.000',
    videoIndex: 0,
    videoFile: '',
    positionInVideo: '0.000'
  });
  
  const startSyncedVideo = () => {
    if (!videoRef.current) return;
    
    // Получаем текущее видео с использованием бинарного поиска
    const playlist = getActivePlaylist();
    const durations = playlist.map(v => v.duration);
    const now = new Date();
    const offsetSec = getDayStartOffsetSeconds(now);
    const result = getCurrentVideo(durations, offsetSec);
    
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' +
                    now.getMinutes().toString().padStart(2, '0') + ':' +
                    now.getSeconds().toString().padStart(2, '0') + '.' +
                    now.getMilliseconds().toString().padStart(3, '0');
    
    console.log('🎬 [START] Starting video:', {
      currentTime: timeStr,
      offsetFromMidnight: offsetSec.toFixed(3) + 's',
      videoIndex: result.VideoIndex,
      file: playlist[result.VideoIndex].file,
      positionInVideo: result.VideoTime.toFixed(3) + 's'
    });
    
    setDebugInfo({
      currentTime: timeStr,
      offsetFromMidnight: offsetSec.toFixed(3),
      videoIndex: result.VideoIndex,
      videoFile: playlist[result.VideoIndex].file,
      positionInVideo: result.VideoTime.toFixed(3)
    });
    
    setCurrentVideoIndex(result.VideoIndex);
    
    const video = videoRef.current;
    const videoFile = playlist[result.VideoIndex].file;
    
    // Устанавливаем источник видео
    video.src = `./assets/videos/${videoFile}`;
    
    // Ждем загрузки метаданных перед установкой позиции
    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        videoRef.current.currentTime = result.VideoTime;
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
      }
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
    
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
  };
  
  const syncVideo = () => {
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' +
                    now.getMinutes().toString().padStart(2, '0') + ':' +
                    now.getSeconds().toString().padStart(2, '0') + '.' +
                    now.getMilliseconds().toString().padStart(3, '0');
    
    console.log('🔄 [SYNC CHECK] Starting sync check...', { currentTime: timeStr });
    
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
      // Получаем ожидаемое видео и позицию с использованием бинарного поиска
      const playlist = getActivePlaylist();
      const durations = playlist.map(v => v.duration);
      const offsetSec = getDayStartOffsetSeconds(now);
      const result = getCurrentVideo(durations, offsetSec);
      
      console.log('⏱️ [SYNC CHECK] Real-time calculation:', {
        currentTime: timeStr,
        offsetFromMidnight: offsetSec.toFixed(3) + 's',
        expectedVideoIndex: result.VideoIndex,
        expectedVideoFile: playlist[result.VideoIndex].file,
        expectedPosition: result.VideoTime.toFixed(3) + 's'
      });
      
      setDebugInfo({
        currentTime: timeStr,
        offsetFromMidnight: offsetSec.toFixed(3),
        videoIndex: result.VideoIndex,
        videoFile: playlist[result.VideoIndex].file,
        positionInVideo: result.VideoTime.toFixed(3)
      });
      
      // Проверяем, нужно ли переключить видео
      const currentVideoFile = video.src.split('/').pop() || '';
      const expectedVideoFile = playlist[result.VideoIndex].file;
      
      if (currentVideoFile !== expectedVideoFile) {
        console.log(`🔀 [SYNC CHECK] Switching video:`, {
          from: currentVideoFile,
          to: expectedVideoFile,
          position: result.VideoTime.toFixed(3) + 's'
        });
        
        setCurrentVideoIndex(result.VideoIndex);
        video.src = `./assets/videos/${expectedVideoFile}`;
        video.currentTime = result.VideoTime;
        video.play().catch(err => console.error('Error playing video:', err));
        return;
      }
      
      // Текущая и ожидаемая позиция
      const expectedPosition = result.VideoTime;
      const actualPosition = video.currentTime;
      
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
    
    // Запускаем периодическую синхронизацию
    if (ENABLE_SYNC) {
      syncIntervalRef.current = setInterval(syncVideo, SYNC_INTERVAL_MS);
    }
    
    // Обновляем debug info 30 раз в секунду (~33ms)
    const debugInterval = setInterval(() => {
      const now = new Date();
      const offsetSec = getDayStartOffsetSeconds(now);
      const playlist = getActivePlaylist();
      const durations = playlist.map(v => v.duration);
      const result = getCurrentVideo(durations, offsetSec);
      
      const timeStr = now.getHours().toString().padStart(2, '0') + ':' +
                      now.getMinutes().toString().padStart(2, '0') + ':' +
                      now.getSeconds().toString().padStart(2, '0') + '.' +
                      now.getMilliseconds().toString().padStart(3, '0');
      
      setDebugInfo({
        currentTime: timeStr,
        offsetFromMidnight: offsetSec.toFixed(3),
        videoIndex: result.VideoIndex,
        videoFile: playlist[result.VideoIndex].file,
        positionInVideo: result.VideoTime.toFixed(3)
      });
    }, 33);
    
    // Обработчик паузы - автоматически возобновляем
    const handlePause = () => {
      console.log('⚠️ [VIDEO] Video paused unexpectedly, resuming...');
      if (videoRef.current && !videoRef.current.ended) {
        videoRef.current.play().catch(err => {
          console.error('Error resuming video:', err);
        });
      }
    };
    
    // Обработчик окончания видео - переключаемся на следующее
    const handleEnded = () => {
      console.log('🎬 [VIDEO] Video ended, switching to next...');
      const playlist = getActivePlaylist();
      const durations = playlist.map(v => v.duration);
      const result = getCurrentVideo(durations);
      
      if (videoRef.current) {
        const nextVideoFile = playlist[result.VideoIndex].file;
        console.log(`▶️ [VIDEO] Loading next video: ${nextVideoFile} at ${result.VideoTime.toFixed(3)}s`);
        
        setCurrentVideoIndex(result.VideoIndex);
        videoRef.current.src = `./assets/videos/${nextVideoFile}`;
        videoRef.current.currentTime = result.VideoTime;
        videoRef.current.play().catch(err => {
          console.error('Error playing next video:', err);
        });
      }
    };
    
    // Подписываемся на события
    const video = videoRef.current;
    if (video) {
      video.addEventListener('pause', handlePause);
      video.addEventListener('ended', handleEnded);
    }
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (debugInterval) {
        clearInterval(debugInterval);
      }
      if (video) {
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('ended', handleEnded);
      }
    };
  }, []);
  
  return (
    <div className="video-intro" onClick={onVideoClick}>
      <video 
        ref={videoRef}
        className="video-intro__video"
        muted
        playsInline
      >
        Ваш браузер не поддерживает видео
      </video>
      <div className="video-intro__overlay">
        <p className="video-intro__text">Нажмите на экран для продолжения</p>
      </div>
      
      {/* Debug панель */}
      {DEBUG_MODE && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#00ff00',
          padding: '15px',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '12px',
          lineHeight: '1.6',
          zIndex: 1000,
          minWidth: '300px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#4ec9b0' }}>
            ⏱️ Real-time Debug Info
          </div>
          <div><strong>Time:</strong> {debugInfo.currentTime}</div>
          <div><strong>Offset:</strong> {debugInfo.offsetFromMidnight} сек</div>
          <div><strong>Video #:</strong> {debugInfo.videoIndex}</div>
          <div><strong>File:</strong> {debugInfo.videoFile}</div>
          <div><strong>Position:</strong> {debugInfo.positionInVideo} сек</div>
        </div>
      )}
    </div>
  );
};

export default VideoIntro;
