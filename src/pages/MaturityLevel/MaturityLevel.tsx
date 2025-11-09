import React from 'react';
import Presentation from '../../components/Presentation';
import data from '../../../data.json';
import './MaturityLevel.css';

interface MaturityLevelProps {
  onBack: () => void;
}

const MaturityLevel: React.FC<MaturityLevelProps> = ({ onBack }) => {
  return (
    <div className="maturity-level">
      {/* Фоновое изображение */}
      <div className="maturity-level__background" />
      
      {/* Кнопка "Домой" */}
      <button className="maturity-level__home-button" onClick={onBack}>
        <img src="./maturity/home-button.png" alt="Домой" />
      </button>

      {/* Заголовок */}
      <h1 className="maturity-level__title">Уровень ИБ-зрелости</h1>

      {/* Презентация */}
      <Presentation slides={data.maturityPresentation.slides} />
    </div>
  );
};

export default MaturityLevel;
