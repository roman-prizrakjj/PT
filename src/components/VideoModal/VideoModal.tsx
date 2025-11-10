import React, { useRef, useEffect } from 'react';
import './VideoModal.css';

interface VideoModalProps {
  videoSrc: string;
  onClose: () => void;
  onResetTimer?: () => void; // Callback для сброса таймера
}

const VideoModal: React.FC<VideoModalProps> = ({ videoSrc, onClose, onResetTimer }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Автоматически запускаем видео при открытии
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }

    // Обработчик окончания видео - возврат в меню
    const handleEnded = () => {
      console.log('🎬 [VideoModal] Video ended, returning to menu');
      onClose();
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('ended', handleEnded);
    }

    // Сбрасываем таймер каждые 30 секунд пока видео воспроизводится
    const timerResetInterval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
        console.log('🎬 [VideoModal] Video is playing, resetting idle timer');
        onResetTimer?.();
      }
    }, 30000); // 30 секунд

    return () => {
      clearInterval(timerResetInterval);
      if (video) {
        video.removeEventListener('ended', handleEnded);
      }
    };
  }, [onResetTimer, onClose]);

  return (
    <div className="video-modal" onClick={onClose}>
      <video
        ref={videoRef}
        className="video-modal__video"
        muted
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
        Ваш браузер не поддерживает видео
      </video>
    </div>
  );
};

export default VideoModal;
