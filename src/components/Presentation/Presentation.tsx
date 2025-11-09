import React, { useState, useRef } from 'react';
import './Presentation.css';

interface Slide {
  id: number;
  image: string;
  thumbnail?: string; // Опциональный путь к thumbnail
}

interface PresentationProps {
  slides: Slide[];
}

// Хелпер для путей - работает и в dev и в production
const getImagePath = (path: string) => {
  // Если путь начинается с /, заменяем на ./
  return path.startsWith('/') ? `.${path}` : path;
};

const Presentation: React.FC<PresentationProps> = ({ slides }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const scrollToThumbnail = (index: number) => {
    if (thumbnailsRef.current) {
      const container = thumbnailsRef.current;
      const thumbnail = container.children[index] as HTMLElement;
      
      if (thumbnail) {
        const containerRect = container.getBoundingClientRect();
        const thumbnailRect = thumbnail.getBoundingClientRect();
        
        // Проверяем, виден ли миниатюра полностью
        const isVisible = 
          thumbnailRect.top >= containerRect.top &&
          thumbnailRect.bottom <= containerRect.bottom;
        
        // Если не виден, прокручиваем к нему
        if (!isVisible) {
          thumbnail.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      }
    }
  };

  const handleArrowClick = (direction: 'up' | 'down') => {
    let newSlideIndex = activeSlide;
    
    // Определяем новый индекс слайда
    if (direction === 'up' && activeSlide > 0) {
      newSlideIndex = activeSlide - 1;
    } else if (direction === 'down' && activeSlide < slides.length - 1) {
      newSlideIndex = activeSlide + 1;
    }
    
    // Переключаем слайд
    if (newSlideIndex !== activeSlide) {
      setActiveSlide(newSlideIndex);
      // Автоматически скроллим к новому слайду, если он не виден
      scrollToThumbnail(newSlideIndex);
    }
  };

  // Обработчики свайпа
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    // Если touchMove не вызывался, touchEndX будет 0
    if (touchEndX.current === 0) {
      touchEndX.current = touchStartX.current; // Считаем как тап без движения
    }

    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // Минимальная дистанция свайпа в пикселях

    // Проверяем что было реальное движение
    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Свайп влево → следующий слайд
        handleArrowClick('down');
      } else {
        // Свайп вправо → предыдущий слайд
        handleArrowClick('up');
      }
    }

    // Сброс значений
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div className="presentation">
      {/* Левая панель с превью */}
      <div className="presentation__sidebar">
        <button 
          className="presentation__scroll-button presentation__scroll-button--up"
          onClick={() => handleArrowClick('up')}
          aria-label="Предыдущий слайд"
        >
          ▲
        </button>
        
        <div className="presentation__thumbnails" ref={thumbnailsRef}>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`presentation__thumbnail ${
                index === activeSlide ? 'presentation__thumbnail--active' : ''
              }`}
              onClick={() => setActiveSlide(index)}
            >
              <img 
                src={getImagePath(slide.thumbnail || slide.image)} 
                alt={`Слайд ${slide.id}`} 
              />
            </div>
          ))}
        </div>
        
        <button 
          className="presentation__scroll-button presentation__scroll-button--down"
          onClick={() => handleArrowClick('down')}
          aria-label="Следующий слайд"
        >
          ▼
        </button>
      </div>

      {/* Основной слайд */}
      <div 
        className="presentation__main"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="presentation__slide">
          <img 
            src={getImagePath(slides[activeSlide].image)} 
            alt={`Слайд ${slides[activeSlide].id}`}
          />
        </div>
      </div>
    </div>
  );
};

export default Presentation;
