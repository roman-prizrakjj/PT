import React from 'react';
import Presentation from '../../components/Presentation';
import data from '../../../data.json';
import './PTNgfw.css';

interface PTNgfwProps {
  onBack: () => void;
}

const PTNgfw: React.FC<PTNgfwProps> = ({ onBack }) => {
  return (
    <div className="pt-ngfw">
      {/* Фоновое изображение */}
      <div className="pt-ngfw__background" />
      
      {/* Кнопка "Домой" */}
      <button className="pt-ngfw__home-button" onClick={onBack}>
        <img src="./ngfw/home-button.png" alt="Домой" />
      </button>

      {/* Заголовок */}
      <h1 className="pt-ngfw__title">PT NGFW</h1>

      {/* Презентация */}
      <Presentation slides={data.ngfwPresentation.slides} />
    </div>
  );
};

export default PTNgfw;
