import React, { useEffect, useMemo } from 'react';
import MenuCard from '../MenuCard';
import menuData from '../../../data.json';
import { useImagePreloader } from '../../hooks/useImagePreloader';
import './MainMenu.css';

interface MainMenuProps {
  onCardClick?: (route: string) => void;
  onLogoClick?: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onCardClick, onLogoClick }) => {
  // Собираем все изображения для предзагрузки
  const imagesToPreload = useMemo(() => {
    const images: string[] = [];
    
    // Thumbnails всех презентаций
    menuData.maturityPresentation.slides.forEach(slide => {
      if (slide.thumbnail) images.push(slide.thumbnail);
    });
    menuData.ngfwPresentation.slides.forEach(slide => {
      if (slide.thumbnail) images.push(slide.thumbnail);
    });
    menuData.productsPresentation.slides.forEach(slide => {
      if (slide.thumbnail) images.push(slide.thumbnail);
    });
    
    // Первые слайды каждой презентации (полные изображения)
    if (menuData.maturityPresentation.slides[0]) {
      images.push(menuData.maturityPresentation.slides[0].image);
    }
    if (menuData.ngfwPresentation.slides[0]) {
      images.push(menuData.ngfwPresentation.slides[0].image);
    }
    if (menuData.productsPresentation.slides[0]) {
      images.push(menuData.productsPresentation.slides[0].image);
    }
    
    // Фоновые изображения и элементы UI каждой презентации
    images.push('./maturity/background.png');
    images.push('./maturity/home-button.png');
    images.push('./ngfw/background.png');
    images.push('./ngfw/home-button.png');
    images.push('./products/background.png');
    images.push('./products/home-button.png');
    
    return images;
  }, []);
  
  // Запускаем предзагрузку
  const { isLoading } = useImagePreloader(imagesToPreload);
  
  // Логируем прогресс (опционально)
  useEffect(() => {
    if (!isLoading) {
      console.log('✅ Preload complete: all presentation images cached');
    }
  }, [isLoading]);

  const handleCardClick = (route: string) => {
    if (onCardClick) {
      onCardClick(route);
    }
  };

  return (
    <div className="main-menu">
      {/* Кликабельная область для лого PT в правом верхнем углу */}
      <div 
        className="main-menu__logo-clickarea"
        onClick={onLogoClick}
        role="button"
        tabIndex={0}
        aria-label="Запустить видео"
      />
      
      <div className="main-menu__grid">
        {menuData.cards.map((card) => (
          <MenuCard
            key={card.id}
            title={card.title}
            subtitle={card.subtitle}
            icon={`./icons/${card.icon}`}
            onClick={() => handleCardClick(card.route)}
          />
        ))}
      </div>
    </div>
  );
};

export default MainMenu;
