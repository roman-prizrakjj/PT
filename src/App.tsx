import React, { useState, useCallback } from 'react';
import VideoIntro from './components/VideoIntro';
import MainMenu from './components/MainMenu';
import Dashboards from './pages/Dashboards';
import MaturityLevel from './pages/MaturityLevel';
import PTNgfw from './pages/PTNgfw';
import Products from './pages/Products';
import { useIdleTimer } from './hooks/useIdleTimer';
import './App.css';

type ViewType = 'video' | 'menu' | 'dashboards' | 'maturity' | 'ngfw' | 'products';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('video');

  const { resetTimer } = useIdleTimer({
    timeout: 90000, // 90 секунд
    onIdle: () => {
      console.log('Returning to screensaver after 90s of inactivity');
      setCurrentView('video');
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
      setCurrentView('maturity');
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
      {currentView === 'maturity' && (
        <MaturityLevel onBack={handleBackToMenu} />
      )}
      {currentView === 'ngfw' && (
        <PTNgfw onBack={handleBackToMenu} />
      )}
      {currentView === 'products' && (
        <Products onBack={handleBackToMenu} />
      )}
    </div>
  );
};

export default App;
