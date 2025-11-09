import React, { useState } from 'react';
import './PositiveImportChart.css';

interface ForeignVendors {
  description: string;
  vmSolutions?: string[];
  vulnerabilityScanners?: string[];
  vendors?: string[];
}

interface CertificationAndDescription {
  certification?: string;
  description: string[];
}

interface NavigatorItem {
  solutionClass: string;
  foreignVendors: ForeignVendors;
  productPT: string;
  certificationAndDescription: CertificationAndDescription;
}

interface PositiveImportChartProps {
  subtitle: string;
  data?: NavigatorItem[];
}

const PositiveImportChart: React.FC<PositiveImportChartProps> = ({ subtitle, data = [] }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  
  const activeItem = data[activeIndex];

  return (
    <div className="positive-import-chart">
      {/* Подзаголовок */}
      <h2 className="positive-import-chart__subtitle">
        {subtitle}
      </h2>

      {/* Белый контейнер */}
      <div className="positive-import-chart__graph">
        {/* Левая панель - список классов решений */}
        <div className="positive-import-chart__classes">
          {data.map((item, index) => (
            <button
              key={index}
              className={`positive-import-chart__class-btn ${activeIndex === index ? 'positive-import-chart__class-btn--active' : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              {item.solutionClass}
            </button>
          ))}
        </div>

        {/* Центральная панель - зарубежные вендоры */}
        {activeItem && (
          <div className="positive-import-chart__vendors">
            <div className="positive-import-chart__vendors-header">
              <span className="positive-import-chart__vendors-label">Класс решений</span>
            </div>
            <div className="positive-import-chart__vendors-title">{activeItem.solutionClass}</div>
            <div className="positive-import-chart__vendors-subtitle">
              <span className="positive-import-chart__vendors-label-red">Зарубежные вендоры</span>
            </div>
            <div className="positive-import-chart__vendors-description">
              {activeItem.foreignVendors.description}
            </div>
            
            {/* Списки решений */}
            {activeItem.foreignVendors.vmSolutions && (
              <div className="positive-import-chart__vendors-section">
                <div className="positive-import-chart__vendors-section-title">VM-решения:</div>
                {activeItem.foreignVendors.vmSolutions.map((solution, idx) => (
                  <div key={idx} className="positive-import-chart__vendors-item">{solution}</div>
                ))}
              </div>
            )}
            
            {activeItem.foreignVendors.vulnerabilityScanners && (
              <div className="positive-import-chart__vendors-section">
                <div className="positive-import-chart__vendors-section-title">Сканеры уязвимостей:</div>
                {activeItem.foreignVendors.vulnerabilityScanners.map((scanner, idx) => (
                  <div key={idx} className="positive-import-chart__vendors-item">{scanner}</div>
                ))}
              </div>
            )}
            
            {activeItem.foreignVendors.vendors && (
              <div className="positive-import-chart__vendors-section">
                {activeItem.foreignVendors.vendors.map((vendor, idx) => (
                  <div key={idx} className="positive-import-chart__vendors-item">{vendor}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Правая панель - продукт PT */}
        {activeItem && (
          <div className="positive-import-chart__product">
            <div className="positive-import-chart__product-header">
              <span className="positive-import-chart__product-label">Продукт АО "Позитив Текнолоджиз"</span>
            </div>
            <div className="positive-import-chart__product-name">{activeItem.productPT}</div>
            
            {activeItem.certificationAndDescription.certification && (
              <>
                <div className="positive-import-chart__product-cert-label">Сертификация</div>
                <div className="positive-import-chart__product-cert">
                  {activeItem.certificationAndDescription.certification}
                </div>
              </>
            )}
            
            <div className="positive-import-chart__product-features">
              {activeItem.certificationAndDescription.description.map((desc, idx) => (
                <div key={idx} className="positive-import-chart__product-feature">
                  <span className="positive-import-chart__product-arrow">►</span>
                  {desc}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PositiveImportChart;
