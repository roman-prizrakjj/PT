import React, { useState, useCallback } from 'react';
import VideoIntro from './components/VideoIntro';
import VideoModal from './components/VideoModal';
import MainMenu from './components/MainMenu';
import Dashboards from './pages/Dashboards';
import PTNgfw from './pages/PTNgfw';
import Products from './pages/Products';
import { useIdleTimer } from './hooks/useIdleTimer';
import './App.css';

type ViewType = 'video' | 'menu' | 'dashboards' | 'ngfw' | 'products';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('video');
  const [showVideoModal, setShowVideoModal] = useState(false);

  const { resetTimer } = useIdleTimer({
    timeout: 90000, // 90 секунд
    onIdle: () => {
      console.log('Returning to screensaver after 90s of inactivity');
      setCurrentView('video');
      setShowVideoModal(false);
    },
    events: ['touchstart', 'click']
  });

  const handleVideoClick = useCallback(() => {
    setCurrentView('menu');
    resetTimer();
  }, [resetTimer]);

  const handleCardClick = useCallback((route: string) => {
    if (route === '/dashboards') {
      setCurrentView('dashboards');
    } else if (route === '/maturity') {
      setShowVideoModal(true);
    } else if (route === '/ngfw') {
      setCurrentView('ngfw');
    } else if (route === '/products') {
      setCurrentView('products');
    }
    resetTimer();
  }, [resetTimer]);

  const handleBackToMenu = useCallback(() => {
    setCurrentView('menu');
    resetTimer();
  }, [resetTimer]);

  const handleLogoClick = useCallback(() => {
    setCurrentView('video');
    setShowVideoModal(false);
    resetTimer();
  }, [resetTimer]);

  const handleCloseVideoModal = useCallback(() => {
    setShowVideoModal(false);
    resetTimer();
  }, [resetTimer]);

  return (
    <div className="app">
      {currentView === 'video' && (
        <VideoIntro onVideoClick={handleVideoClick} />
      )}
      
      {/* MainMenu всегда монтирован для preload, но скрыт когда не активен */}
      <div style={{ display: currentView === 'menu' ? 'block' : 'none' }}>
        <MainMenu onCardClick={handleCardClick} onLogoClick={handleLogoClick} />
      </div>
      
      {currentView === 'dashboards' && (
        <Dashboards onBack={handleBackToMenu} />
      )}
      {currentView === 'ngfw' && (
        <PTNgfw onBack={handleBackToMenu} />
      )}
      {currentView === 'products' && (
        <Products onBack={handleBackToMenu} />
      )}
      
      {/* Модальное окно с видео MaxPatrol O2 */}
      {showVideoModal && (
        <VideoModal 
          videoSrc="./assets/videos/demo360.mp4"
          onClose={handleCloseVideoModal}
          onResetTimer={resetTimer}
        />
      )}
    </div>
  );
};

export default App;
