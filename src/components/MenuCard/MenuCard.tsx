import React from 'react';
import './MenuCard.css';

interface MenuCardProps {
  title: string;
  subtitle: string;
  icon: string;
  onClick?: () => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ title, subtitle, icon, onClick }) => {
  return (
    <div className="menu-card" onClick={onClick}>
      <div className="menu-card__icon-wrapper">
        <img src={icon} alt={title} className="menu-card__icon" />
      </div>
      <div className="menu-card__content">
        <h2 className="menu-card__title">{title}</h2>
        <p className="menu-card__subtitle">{subtitle}</p>
      </div>
    </div>
  );
};

export default MenuCard;
