import React, { useState } from 'react';
import './MotivationChart.css';

interface MotivationData {
  label: string;
  value: number;
}

interface MotivationChartProps {
  subtitle: string;
  data: MotivationData[];
}

const MotivationChart: React.FC<MotivationChartProps> = ({ subtitle, data }) => {
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

  // Параметры графика
  const width = 2700;
  const height = 1400;
  const padding = { top: 80, right: 100, bottom: 150, left: 180 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = 70;
  const yLabels = [70, 60, 50, 40, 30, 20, 10, 0];
  const gridLines = 8;

  // Ширина столбца
  const barWidth = 320;
  const barSpacing = (chartWidth - barWidth * data.length) / (data.length + 1);

  // Функция для получения X позиции столбца
  const getBarX = (index: number) => {
    return padding.left + barSpacing + (barWidth + barSpacing) * index;
  };

  return (
    <div className="motivation-chart">
      {/* Подзаголовок */}
      <h2 className="motivation-chart__subtitle">
        {subtitle}
      </h2>

      {/* Белый контейнер */}
      <div className="motivation-chart__graph">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="motivation-chart__svg"
          onClick={() => setActiveBarIndex(null)}
        >
          {/* Градиент для столбцов */}
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255, 100, 100, 1)" />
              <stop offset="100%" stopColor="rgba(255, 200, 200, 0.6)" />
            </linearGradient>
            <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255, 120, 120, 1)" />
              <stop offset="100%" stopColor="rgba(255, 180, 180, 0.8)" />
            </linearGradient>
          </defs>

          {/* Горизонтальные линии сетки */}
          {Array.from({ length: gridLines }).map((_, index) => {
            const y = padding.top + (chartHeight / (gridLines - 1)) * index;
            return (
              <line
                key={`grid-${index}`}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(255, 0, 0, 0.2)"
                strokeWidth="1"
              />
            );
          })}

          {/* Левая и нижняя границы */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={chartHeight + padding.top}
            stroke="#6A7F98"
            strokeWidth="3"
          />
          <line
            x1={padding.left}
            y1={chartHeight + padding.top}
            x2={width - padding.right}
            y2={chartHeight + padding.top}
            stroke="#6A7F98"
            strokeWidth="3"
          />

          {/* Метки оси Y */}
          {yLabels.map((label, index) => (
            <text
              key={`ylabel-${label}`}
              x={padding.left - 20}
              y={padding.top + (chartHeight / (gridLines - 1)) * index}
              textAnchor="end"
              alignmentBaseline="middle"
              fill="#44536A"
              fontSize="36"
              fontFamily="TT Positive Extended, sans-serif"
            >
              {label}
            </text>
          ))}

          {/* Столбцы */}
          {data.map((item, index) => {
            const x = getBarX(index);
            const barHeight = ((item.value / maxValue) * chartHeight);
            const y = chartHeight + padding.top - barHeight;
            const isActive = activeBarIndex === index;

            return (
              <g 
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveBarIndex(index);
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* Столбец */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={isActive ? "url(#barGradientActive)" : "url(#barGradient)"}
                  rx="16"
                  style={{ transition: 'fill 0.2s' }}
                />
                
                {/* Контур при активации */}
                {isActive && (
                  <path
                    d={`
                      M ${x - 3} ${y + barHeight}
                      L ${x - 3} ${y + 16}
                      Q ${x - 3} ${y - 3} ${x + 16} ${y - 3}
                      L ${x + barWidth - 16} ${y - 3}
                      Q ${x + barWidth + 3} ${y - 3} ${x + barWidth + 3} ${y + 16}
                      L ${x + barWidth + 3} ${y + barHeight}
                    `}
                    fill="none"
                    stroke="#FF0000"
                    strokeWidth="6"
                    opacity="0.6"
                    strokeLinecap="square"
                    style={{ transition: 'opacity 0.2s' }}
                  />
                )}

                {/* Значение над столбцом */}
                <text
                  x={x + barWidth / 2}
                  y={y - 20}
                  textAnchor="middle"
                  fill="#44536A"
                  fontSize={isActive ? "108" : "48"}
                  fontWeight="700"
                  fontFamily="TT Positive Extended, sans-serif"
                  style={{ transition: 'font-size 0.2s' }}
                >
                  {item.value}
                </text>

                {/* Название категории */}
                {item.label.split('\n').map((line, lineIndex) => (
                  <text
                    key={`label-${index}-${lineIndex}`}
                    x={x + barWidth / 2}
                    y={chartHeight + padding.top + 50 + lineIndex * 48}
                    textAnchor="middle"
                    fill="#44536A"
                    fontSize="36"
                    fontFamily="TT Positive Extended, sans-serif"
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default MotivationChart;
