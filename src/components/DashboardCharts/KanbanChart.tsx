import React, { useState } from 'react';
import './KanbanChart.css';

interface Subtechnique {
  id: string;
  title: string;
}

interface Technique {
  id: string;
  title: string;
  progress: {
    done: number;
    total: number;
  } | null;
  tags: string[];
  order: number;
  subtechniques: Subtechnique[];
}

interface Column {
  id: string;
  title: string;
  coverage: number | null;
  techniques: Technique[];
}

interface KanbanData {
  columns: Column[];
}

interface KanbanChartProps {
  subtitle: string;
  data?: KanbanData;
}

const KanbanChart: React.FC<KanbanChartProps> = ({ subtitle, data }) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [scale, setScale] = useState<number>(1);

  if (!data || !data.columns) {
    return (
      <div className="kanban-chart">
        <h2 className="kanban-chart__subtitle">{subtitle}</h2>
        <div className="kanban-chart__graph">
          <div style={{ textAlign: 'center', color: '#44536A', fontSize: '24px' }}>
            Канбан доска - в разработке
          </div>
        </div>
      </div>
    );
  }

  const getCoverageClass = (progress: { done: number; total: number } | null) => {
    if (!progress) return 'no-data';
    if (progress.done === progress.total) return 'full';
    if (progress.done === 0) return 'none';
    return 'partial';
  };

  const toggleCard = (cardId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 1.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.2));
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  };

  return (
    <div className="kanban-chart">
      {/* Подзаголовок */}
      <h2 className="kanban-chart__subtitle">{subtitle}</h2>

      {/* Кнопки зума */}
      <div className="kanban-chart__zoom-controls">
        <button onClick={handleZoomOut} className="kanban-chart__zoom-btn">−</button>
        <span className="kanban-chart__zoom-level">{Math.round(scale * 100)}%</span>
        <button onClick={handleZoomIn} className="kanban-chart__zoom-btn">+</button>
      </div>

      {/* Контейнер с канбан-досками */}
      <div className="kanban-chart__container" onWheel={handleWheel}>
        <div 
          className="kanban-chart__scaled-wrapper" 
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          <div className="kanban-chart__board">
            {data.columns.map((column) => (
            <div key={column.id} className="kanban-chart__column">
              {/* Заголовок колонки */}
              <div className="kanban-chart__column-header">
                <div className="kanban-chart__column-title">{column.title}</div>
                {column.coverage !== null && (
                  <div className="kanban-chart__coverage-badge">
                    {column.coverage}%
                  </div>
                )}
              </div>

              {/* Карточки техник */}
              <div className="kanban-chart__cards">
                {column.techniques
                  .sort((a, b) => a.order - b.order)
                  .map((technique) => {
                    const isExpanded = expandedCards.has(technique.id);
                    const hasSubtechniques = technique.subtechniques.length > 0;

                    return (
                      <div
                        key={technique.id}
                        className={`kanban-chart__card kanban-chart__card--${getCoverageClass(
                          technique.progress
                        )}`}
                      >
                        {/* ID техники */}
                        <div className="kanban-chart__card-id">{technique.id}</div>

                        {/* Название техники */}
                        <div className="kanban-chart__card-title">{technique.title}</div>

                        {/* Покрытие */}
                        {technique.progress && (
                          <div className="kanban-chart__card-coverage">
                            {technique.progress.done}/{technique.progress.total}
                          </div>
                        )}

                        {/* Теги */}
                        <div className="kanban-chart__card-tags">
                          {technique.tags.map((tag) => (
                            <span key={tag} className="kanban-chart__tag">
                              # {tag}
                            </span>
                          ))}
                        </div>

                        {/* Шеврон для раскрытия */}
                        {hasSubtechniques && (
                          <button
                            className={`kanban-chart__card-chevron ${
                              isExpanded ? 'kanban-chart__card-chevron--expanded' : ''
                            }`}
                            onClick={() => toggleCard(technique.id)}
                          >
                            ▼
                          </button>
                        )}

                        {/* Подтехники внутри карточки */}
                        {isExpanded && hasSubtechniques && (
                          <div className="kanban-chart__subtechniques">
                            {technique.subtechniques.map((sub) => (
                              <div key={sub.id} className="kanban-chart__subtechnique">
                                <span className="kanban-chart__subtechnique-id">{sub.id}</span>
                                <span className="kanban-chart__subtechnique-title">
                                  {sub.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanChart;
