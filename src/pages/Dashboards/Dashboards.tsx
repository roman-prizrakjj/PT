import React, { useState } from 'react';
import { 
  IncidentsChart, 
  SectorsChart, 
  MotivationChart, 
  KanbanChart, 
  PositiveImportChart 
} from '../../components/DashboardCharts';
import data from '../../../data.json';
import './Dashboards.css';

interface DashboardsProps {
  onBack: () => void;
}

const Dashboards: React.FC<DashboardsProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<string>('incidents');

  const { tabs } = data.dashboards;
  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="dashboards">
      {/* Фоновое изображение */}
      <div className="dashboards__background" />

      {/* Шапка */}
      <div className="dashboards__header">
        <button className="dashboards__home-button" onClick={onBack}>
          <img src="./dashboards/home-button.png" alt="Главная" />
        </button>
        
        <h1 className="dashboards__title">Дашборды статистики</h1>
        
        <div className="dashboards__logo">pt</div>
      </div>

      {/* Левая панель табов */}
      <div className="dashboards__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`dashboards__tab ${activeTab === tab.id ? 'dashboards__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Область контента */}
      <div className="dashboards__content">
        {activeTab === 'incidents' && activeTabData && Array.isArray(activeTabData.data) && activeTabData.data.length > 0 && 'year' in activeTabData.data[0] && (
          <IncidentsChart 
            subtitle={activeTabData.subtitle || ''} 
            data={activeTabData.data as { year: number; value: number; growth: number }[]} 
          />
        )}
        {activeTab === 'sectors' && activeTabData && Array.isArray(activeTabData.data) && activeTabData.data.length > 0 && 'label' in activeTabData.data[0] && (
          <SectorsChart 
            subtitle={activeTabData.subtitle || ''} 
            data={activeTabData.data as { label: string; value: number; color: string }[]} 
          />
        )}
        {activeTab === 'motivation' && activeTabData && Array.isArray(activeTabData.data) && activeTabData.data.length > 0 && 'label' in activeTabData.data[0] && (
          <MotivationChart 
            subtitle={activeTabData.subtitle || ''} 
            data={activeTabData.data as { label: string; value: number }[]} 
          />
        )}
        {activeTab === 'kanban' && activeTabData && (
          <KanbanChart 
            subtitle={activeTabData.subtitle || ''} 
            data={activeTabData.data as any}
          />
        )}
        {activeTab === 'positive-import' && activeTabData && (
          <PositiveImportChart 
            subtitle={activeTabData.subtitle || ''} 
            data={activeTabData.data as any[]}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboards;
