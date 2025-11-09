import React from 'react';
import './IncidentsChart.css';

interface DataPoint {
  year: number;
  value: number;
  growth: number;
}

interface IncidentsChartProps {
  subtitle: string;
  data: DataPoint[];
}

const IncidentsChart: React.FC<IncidentsChartProps> = ({ subtitle, data }) => {
  // Параметры графика
  const width = 1800;
  const height = 850;
  const padding = { top: 100, right: 60, bottom: 60, left: 100 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Масштабы
  const maxValue = 5000;
  const minValue = 0;
  const xStep = chartWidth / (data.length - 1);
  
  // Функция для расчета Y координаты
  const getY = (value: number) => {
    const ratio = (value - minValue) / (maxValue - minValue);
    return chartHeight - ratio * chartHeight + padding.top;
  };
  
  // Функция для расчета X координаты
  const getX = (index: number) => {
    return padding.left + index * xStep;
  };
  
  // Создание пути для линии (начинается от Y = 1000)
  const linePath = data.map((point, index) => {
    const x = getX(index);
    const y = getY(point.value);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  // Создание пути для заливки area (заливка начинается от Y = 1000)
  const areaPath = `
    M ${padding.left} ${getY(1000)}
    ${data.map((point, index) => {
      const x = getX(index);
      const y = getY(point.value);
      return `L ${x} ${y}`;
    }).join(' ')}
    L ${getX(data.length - 1)} ${getY(1000)}
    Z
  `;
  
  // Y оси метки
  const yLabels = [5000, 4000, 3000, 2000, 1000, 0];

  return (
    <div className="incidents-chart">
      {/* Подзаголовок */}
      <h2 className="incidents-chart__subtitle">
        {subtitle}
      </h2>

      {/* График SVG */}
      <div className="incidents-chart__graph">
        <svg 
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="incidents-chart__svg"
        >
          {/* Градиент для заливки */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255, 0, 0, 0.8)" />
              <stop offset="50%" stopColor="rgba(255, 0, 0, 0.3)" />
              <stop offset="100%" stopColor="rgba(255, 0, 0, 0)" />
            </linearGradient>
            
            {/* Радиальный градиент для свечения точек */}
            <radialGradient id="pointGlow">
              <stop offset="0%" stopColor="rgba(255, 0, 0, 0)" />
              <stop offset="100%" stopColor="#FF0000" />
            </radialGradient>
          </defs>
          
          {/* Горизонтальные линии сетки */}
          {yLabels.map((label) => (
            <line
              key={label}
              x1={padding.left}
              y1={getY(label)}
              x2={width - padding.right}
              y2={getY(label)}
              stroke="rgba(255, 0, 0, 0.2)"
              strokeWidth="1"
            />
          ))}
          
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
          
          {/* Заливка area */}
          <path
            d={areaPath}
            fill="url(#areaGradient)"
          />
          
          {/* Линия тренда */}
          <path
            d={linePath}
            fill="none"
            stroke="#FF0000"
            strokeWidth="3"
          />
          
          {/* Вертикальные линии под точками */}
          {data.map((point, index) => (
            <line
              key={`vline-${point.year}`}
              x1={getX(index)}
              y1={getY(point.value)}
              x2={getX(index)}
              y2={chartHeight + padding.top}
              stroke="rgba(255, 0, 0, 0.3)"
              strokeWidth="1"
            />
          ))}
          
          {/* Точки данных с свечением (начиная с 2019) */}
          {data.map((point, index) => {
            // Пропускаем 2018 год (индекс 0) - точки там нет
            if (index === 0) return null;
            
            const x = getX(index);
            const y = getY(point.value);
            return (
              <g key={point.year}>
                {/* Свечение */}
                <circle
                  cx={x}
                  cy={y}
                  r="24"
                  fill="url(#pointGlow)"
                  opacity="0.4"
                />
                {/* Основная точка */}
                <circle
                  cx={x}
                  cy={y}
                  r="13"
                  fill="#FF0000"
                  stroke="#FFFFFF"
                  strokeWidth="4"
                />
              </g>
            );
          })}
          
          {/* Метки Y оси */}
          {yLabels.map((label) => (
            <text
              key={`ylabel-${label}`}
              x={padding.left - 15}
              y={getY(label)}
              textAnchor="end"
              alignmentBaseline="middle"
              fill="#000000"
              fontSize="20"
              fontFamily="TT Positive Extended, sans-serif"
            >
              {label.toLocaleString()}
            </text>
          ))}
          
          {/* Метки X оси (годы) */}
          {data.map((point, index) => (
            <text
              key={`xlabel-${point.year}`}
              x={getX(index)}
              y={chartHeight + padding.top + 35}
              textAnchor={index === 0 ? "start" : "middle"}
              fill="#000000"
              fontSize="20"
              fontFamily="TT Positive Extended, sans-serif"
            >
              {point.year}
            </text>
          ))}
          
          {/* Значения и проценты над точками (начиная с 2019) */}
          {data.map((point, index) => {
            // Пропускаем 2018 год (индекс 0)
            if (index === 0) return null;
            
            const x = getX(index);
            const y = getY(point.value);
            return (
              <g key={`label-${point.year}`}>
                {/* Красная линия от точки к подписям */}
                <line
                  x1={x}
                  y1={y - 17}
                  x2={x}
                  y2={y - 90}
                  stroke="#FF0000"
                  strokeWidth="2"
                />
                {/* Значение */}
                <text
                  x={x - 10}
                  y={y - 65}
                  textAnchor="end"
                  fill="#44536A"
                  fontSize="32"
                  fontWeight="900"
                  fontFamily="TT Positive Extended, sans-serif"
                >
                  {point.value.toLocaleString()}
                </text>
                {/* Процент роста */}
                <text
                  x={x - 10}
                  y={y - 35}
                  textAnchor="end"
                  fill="#FF0000"
                  fontSize="20"
                  fontWeight="500"
                  fontFamily="TT Positive Extended, sans-serif"
                >
                  +{point.growth}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default IncidentsChart;
