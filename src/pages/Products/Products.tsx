import React from 'react';
import Presentation from '../../components/Presentation';
import data from '../../../data.json';
import './Products.css';

interface ProductsProps {
  onBack: () => void;
}

const Products: React.FC<ProductsProps> = ({ onBack }) => {
  return (
    <div className="products">
      {/* Фоновое изображение */}
      <div className="products__background" />
      
      {/* Кнопка "Домой" */}
      <button className="products__home-button" onClick={onBack}>
        <img src="./products/home-button.png" alt="Домой" />
      </button>

      {/* Заголовок */}
      <h1 className="products__title">Продукты Positive Technologies</h1>

      {/* Презентация */}
      <Presentation slides={data.productsPresentation.slides} />
    </div>
  );
};

export default Products;
