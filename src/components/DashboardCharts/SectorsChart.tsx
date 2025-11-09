import React, { useState } from 'react';
import './SectorsChart.css';

interface SectorData {
  label: string;
  value: number;
  color: string;
}

interface SectorsChartProps {
  subtitle: string;
  data: SectorData[];
}

const SectorsChart: React.FC<SectorsChartProps> = ({ subtitle, data }) => {
  const [activeSegment, setActiveSegment] = useState<number | null>(null);

  // Параметры для donut chart
  const width = 1200;
  const height = 1100;
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = 320; // Увеличен с 280
  const innerRadius = 250; // Увеличен с 220

  // Вычисляем общую сумму
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Функция для создания path сектора
  const createArc = (startAngle: number, endAngle: number, innerR: number, outerR: number) => {
    const startOuterX = centerX + outerR * Math.cos(startAngle);
    const startOuterY = centerY + outerR * Math.sin(startAngle);
    const endOuterX = centerX + outerR * Math.cos(endAngle);
    const endOuterY = centerY + outerR * Math.sin(endAngle);
    
    const startInnerX = centerX + innerR * Math.cos(endAngle);
    const startInnerY = centerY + innerR * Math.sin(endAngle);
    const endInnerX = centerX + innerR * Math.cos(startAngle);
    const endInnerY = centerY + innerR * Math.sin(startAngle);

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return `
      M ${startOuterX} ${startOuterY}
      A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}
      L ${startInnerX} ${startInnerY}
      A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${endInnerX} ${endInnerY}
      Z
    `;
  };

  // Вычисляем углы для каждого сектора
  let currentAngle = -Math.PI / 2; // Начинаем сверху

  return (
    <div className="sectors-chart">
      {/* Подзаголовок */}
      <h2 className="sectors-chart__subtitle">
        {subtitle}
      </h2>

      {/* Белый контейнер */}
      <div className="sectors-chart__graph">
        <div className="sectors-chart__container">
          {/* Donut chart слева */}
          <div className="sectors-chart__donut">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="xMidYMid meet"
              className="sectors-chart__svg"
            >
              {/* Определяем фильтр для тени */}
              <defs>
                <filter id="sector-shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#FF0000" floodOpacity="0.6"/>
                </filter>
              </defs>

              {/* Секторы */}
              {data.map((sector, index) => {
                const angle = (sector.value / total) * 2 * Math.PI;
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                const middleAngle = (startAngle + endAngle) / 2;
                const arcPath = createArc(startAngle, endAngle, innerRadius, outerRadius);
                
                // Координаты начала линии (от края сектора)
                const lineStartX = centerX + outerRadius * Math.cos(middleAngle);
                const lineStartY = centerY + outerRadius * Math.sin(middleAngle);
                
                // Координаты изгиба линии (радиальный участок)
                let extraRadialLength = 0;
                if (sector.label === 'Транспорт') {
                  extraRadialLength = 30; // 1см
                } else if (sector.label === 'Оборотные предприятия') {
                  extraRadialLength = 15; // 0.5см
                }
                const bendRadius = outerRadius + 80 + extraRadialLength;
                const bendX = centerX + bendRadius * Math.cos(middleAngle);
                const bendY = centerY + bendRadius * Math.sin(middleAngle);
                
                // Горизонтальный участок линии
                const isRightSide = Math.cos(middleAngle) > 0;
                
                // Ручное управление направлением для конкретных секторов
                let forceDirection = null;
                if (sector.label === 'Оборонные предприятия') {
                  forceDirection = 1; // Вправо
                } else if (sector.label === 'Транспорт') {
                  forceDirection = -1; // Влево
                }
                
                const direction = forceDirection !== null ? forceDirection : (isRightSide ? 1 : -1);
                
                // Адаптивная длина линии в зависимости от длины текста
                const textLength = sector.label.length;
                let horizontalLength = Math.max(120, textLength * 8 + 80);
                if (sector.label === 'Без привязки к отрасли') {
                  horizontalLength -= 70;
                }
                if (sector.label === 'Промышленность') {
                  horizontalLength -= 50;
                }
                // Увеличиваем длину линии, если сектор активен (текст стал крупнее)
                if (activeSegment === index) {
                  // Для "Финансовые организации" увеличиваем сильнее
                  if (sector.label === 'Финансовые организации') {
                    horizontalLength += 65;
                  } else {
                    horizontalLength += 30;
                  }
                }
                const lineEndX = bendX + (direction * horizontalLength);
                const lineEndY = bendY;
                
                // Процент
                const percentage = Math.round((sector.value / total) * 100);
                
                // Определяем выравнивание текста
                const textAnchor = direction > 0 ? 'end' : 'start';
                const textX = lineEndX;
                
                currentAngle = endAngle;

                return (
                  <g key={index}>
                    {/* Сектор */}
                    <path
                      d={arcPath}
                      fill={sector.color}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      style={{ cursor: 'pointer', transition: 'opacity 0.2s, filter 0.3s' }}
                      opacity={activeSegment === null || activeSegment === index ? 1 : 0.5}
                      filter={activeSegment === index ? 'url(#sector-shadow)' : undefined}
                      onClick={() => setActiveSegment(activeSegment === index ? null : index)}
                    />
                    
                    {/* Выносная линия (двухсегментная) */}
                    <polyline
                      points={`${lineStartX},${lineStartY} ${bendX},${bendY} ${lineEndX},${lineEndY}`}
                      fill="none"
                      stroke="#FF0000"
                      strokeWidth="2"
                      style={{ transition: 'all 0.3s' }}
                    />
                    
                    {/* Название отрасли */}
                    <text
                      x={textX}
                      y={lineEndY - 18}
                      textAnchor={textAnchor}
                      fill="#44536A"
                      fontSize={activeSegment === index ? "22" : "18"}
                      fontWeight={activeSegment === index ? "700" : "500"}
                      fontFamily="TT Positive Extended, sans-serif"
                      style={{ transition: 'font-size 0.3s, font-weight 0.3s' }}
                    >
                      {sector.label}
                    </text>
                    
                    {/* Процент */}
                    <text
                      x={textX}
                      y={lineEndY + (activeSegment === index ? 22 : 18)}
                      textAnchor={textAnchor}
                      fill="#FF0000"
                      fontSize={activeSegment === index ? "22" : "18"}
                      fontWeight={activeSegment === index ? "700" : "400"}
                      fontFamily="TT Positive Extended, sans-serif"
                      style={{ transition: 'font-size 0.3s, font-weight 0.3s' }}
                    >
                      {percentage}%
                    </text>
                  </g>
                );
              })}

              {/* Центральный текст */}
              <text
                x={centerX}
                y={centerY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#44536A"
                fontSize="48"
                fontWeight="900"
                fontFamily="TT Positive Extended, sans-serif"
              >
                Инциденты
              </text>
            </svg>
          </div>

          {/* Легенда справа */}
          <div className="sectors-chart__legend">
            {data.map((sector, index) => (
              <div
                key={index}
                className={`sectors-chart__legend-item ${activeSegment === index ? 'active' : ''}`}
                onClick={() => setActiveSegment(activeSegment === index ? null : index)}
              >
                <div
                  className="sectors-chart__legend-color"
                  style={{ backgroundColor: sector.color }}
                />
                <span className="sectors-chart__legend-label">{sector.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectorsChart;
