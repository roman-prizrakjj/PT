import React, { useEffect, useRef, useState } from 'react';
import './VideoIntro.css';

interface VideoConfig {
  file: string;
  duration: number; // в миллисекундах
}

// Конфигурация видео-плейлиста
// Длительности указаны в миллисекундах после проверки воспроизведения
const VIDEO_PLAYLIST: VideoConfig[] = [
  { file: 'ScreenSaverVideo_0.mp4', duration: 95019 },
  { file: 'ScreenSaverVideo_1.mp4', duration: 71667 },
  { file: 'ScreenSaverVideo_2.mp4', duration: 30000 },
  { file: 'ScreenSaverVideo_3.mp4', duration: 71667 },
  { file: 'ScreenSaverVideo_4.mp4', duration: 73920 },
  { file: 'ScreenSaverVideo_5.mp4', duration: 71667 },
  { file: 'ScreenSaverVideo_6.mp4', duration: 110160 },
  { file: 'ScreenSaverVideo_7.mp4', duration: 71667 }
];

// Общая длительность цикла: ~9 минут 56 секунд
const TOTAL_CYCLE_DURATION = 595767; // мс

interface VideoIntroProps {
  onVideoClick: () => void;
}

const VideoIntro: React.FC<VideoIntroProps> = ({ onVideoClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideoSrc, setCurrentVideoSrc] = useState<string>('');
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef<boolean>(false);
  
  const getCurrentVideoInfo = () => {
    const now = new Date();
    const msFromMidnight = 
      now.getHours() * 3600000 +
      now.getMinutes() * 60000 +
      now.getSeconds() * 1000 +
      now.getMilliseconds();
    
    const cyclePosition = msFromMidnight % TOTAL_CYCLE_DURATION;
    
    let elapsed = 0;
    for (let i = 0; i < VIDEO_PLAYLIST.length; i++) {
      const video = VIDEO_PLAYLIST[i];
      
      if (cyclePosition < elapsed + video.duration) {
        return {
          videoIndex: i,
          videoFile: video.file,
          startPosition: (cyclePosition - elapsed) / 1000,
          nextVideoIndex: (i + 1) % VIDEO_PLAYLIST.length
        };
      }
      
      elapsed += video.duration;
    }
    
    return null;
  };
  
  const startSyncedVideo = () => {
    const info = getCurrentVideoInfo();
    if (!info || !videoRef.current || isLoadingRef.current) return;
    
    // Используем относительный путь от index.html
    const videoPath = `./assets/videos/${info.videoFile}`;
    const video = videoRef.current;
    
    // Проверяем, нужно ли менять видео
    const needsNewVideo = !video.src.includes(info.videoFile);
    
    if (needsNewVideo) {
      isLoadingRef.current = true;
      setCurrentVideoSrc(videoPath);
      
      // Ждем загрузки метаданных перед установкой позиции
      const handleLoadedMetadata = () => {
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
        }
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
    }
  };
  
  const handleVideoEnded = () => {
    // Переключаемся на следующее видео
    startSyncedVideo();
  };
  
  useEffect(() => {
    // Запускаем видео при монтировании
    startSyncedVideo();
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
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
        onEnded={handleVideoEnded}
        src={currentVideoSrc}
      >
        Ваш браузер не поддерживает видео
      </video>
    </div>
  );
};

export default VideoIntro;
