import React from 'react';
import './ImportChart.css';

interface ImportData {
  year: string;
  foreign: number;
  domestic: number;
}

interface ImportChartProps {
  subtitle: string;
  data: ImportData[];
}

const ImportChart: React.FC<ImportChartProps> = ({ subtitle, data }) => {
  // Параметры графика
  const width = 2700;
  const height = 1400;
  const padding = { top: 80, right: 100, bottom: 220, left: 180 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = 100;
  const yLabels = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];
  const gridLines = 11;

  // Ширина группы столбцов
  const groupWidth = 680;
  const barWidth = 320;
  const barGap = 40;
  const groupSpacing = (chartWidth - groupWidth * data.length) / (data.length + 1);

  // Функция для получения X позиции группы
  const getGroupX = (index: number) => {
    return padding.left + groupSpacing + (groupWidth + groupSpacing) * index;
  };

  return (
    <div className="import-chart">
      {/* Подзаголовок */}
      <h2 className="import-chart__subtitle">
        {subtitle}
      </h2>

      {/* Белый контейнер */}
      <div className="import-chart__graph">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="import-chart__svg"
        >
          {/* Градиенты */}
          <defs>
            {/* Градиент для зарубежных решений */}
            <linearGradient id="foreignGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(106, 127, 152, 0.5)" />
              <stop offset="100%" stopColor="rgba(106, 127, 152, 0.1)" />
            </linearGradient>
            
            {/* Градиент для отечественных решений */}
            <linearGradient id="domesticGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255, 0, 0, 0.5)" />
              <stop offset="100%" stopColor="rgba(255, 0, 0, 0.1)" />
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
              fill="#000000"
              fontSize="36"
              fontFamily="TT Positive Extended, sans-serif"
            >
              {label}%
            </text>
          ))}

          {/* Группы столбцов */}
          {data.map((item, index) => {
            const groupX = getGroupX(index);
            const foreignHeight = (item.foreign / maxValue) * chartHeight;
            const domesticHeight = (item.domestic / maxValue) * chartHeight;
            const foreignY = chartHeight + padding.top - foreignHeight;
            const domesticY = chartHeight + padding.top - domesticHeight;

            return (
              <g key={index}>
                {/* Зарубежные решения (левый столбец) */}
                <rect
                  x={groupX}
                  y={foreignY}
                  width={barWidth}
                  height={foreignHeight}
                  fill="url(#foreignGradient)"
                  rx="16"
                />

                {/* Отечественные решения (правый столбец) */}
                <rect
                  x={groupX + barWidth + barGap}
                  y={domesticY}
                  width={barWidth}
                  height={domesticHeight}
                  fill="url(#domesticGradient)"
                  rx="16"
                />

                {/* Стрелка вверх на отечественных решениях */}
                <g transform={`translate(${groupX + barWidth + barGap + barWidth / 2}, ${domesticY + 120})`}>
                  {/* Тело стрелки */}
                  <rect
                    x="-32"
                    y="-28"
                    width="64"
                    height="80"
                    fill="rgba(255, 255, 255, 0.5)"
                    rx="8"
                  />
                  {/* Наконечник стрелки */}
                  <path
                    d="M0,-68 L-58,-23 L-32,-23 L-32,-28 L32,-28 L32,-23 L58,-23 Z"
                    fill="rgba(255, 255, 255, 0.5)"
                  />
                </g>

                {/* Подпись процента над зарубежными */}
                <g transform={`translate(${groupX + barWidth / 2 - 140}, ${foreignY - 120})`}>
                  <rect width="280" height={item.foreign >= 70 ? 160 : 130} rx="12" fill="transparent" />
                  <text
                    x="140"
                    y={item.foreign >= 70 ? 110 : 85}
                    textAnchor="middle"
                    fill="#44536A"
                    fontSize={item.foreign >= 70 ? "96" : "64"}
                    fontWeight="900"
                    fontFamily="TT Positive Extended, sans-serif"
                  >
                    {item.foreign}%
                  </text>
                </g>

                {/* Подпись процента над отечественными */}
                <g transform={`translate(${groupX + barWidth + barGap + barWidth / 2 - 140}, ${domesticY - 120})`}>
                  <rect width="280" height={item.domestic >= 70 ? 160 : 130} rx="12" fill="transparent" />
                  <text
                    x="140"
                    y={item.domestic >= 70 ? 110 : 85}
                    textAnchor="middle"
                    fill="#44536A"
                    fontSize={item.domestic >= 70 ? "96" : "64"}
                    fontWeight="900"
                    fontFamily="TT Positive Extended, sans-serif"
                  >
                    {item.domestic}%
                  </text>
                </g>

                {/* Подписи под столбцами */}
                <text
                  x={groupX + barWidth / 2}
                  y={chartHeight + padding.top + 40}
                  textAnchor="middle"
                  fill="#000000"
                  fontSize="36"
                  fontFamily="TT Positive Extended, sans-serif"
                >
                  Зарубежные
                </text>
                <text
                  x={groupX + barWidth / 2}
                  y={chartHeight + padding.top + 85}
                  textAnchor="middle"
                  fill="#000000"
                  fontSize="36"
                  fontFamily="TT Positive Extended, sans-serif"
                >
                  решения
                </text>

                <text
                  x={groupX + barWidth + barGap + barWidth / 2}
                  y={chartHeight + padding.top + 40}
                  textAnchor="middle"
                  fill="#000000"
                  fontSize="36"
                  fontFamily="TT Positive Extended, sans-serif"
                >
                  Отечественные
                </text>
                <text
                  x={groupX + barWidth + barGap + barWidth / 2}
                  y={chartHeight + padding.top + 85}
                  textAnchor="middle"
                  fill="#000000"
                  fontSize="36"
                  fontFamily="TT Positive Extended, sans-serif"
                >
                  решения
                </text>

                {/* Название года */}
                <line
                  x1={groupX}
                  y1={chartHeight + padding.top + 110}
                  x2={groupX + groupWidth}
                  y2={chartHeight + padding.top + 110}
                  stroke="#44536A"
                  strokeWidth="3"
                />
                <text
                  x={groupX + groupWidth / 2}
                  y={chartHeight + padding.top + 170}
                  textAnchor="middle"
                  fill="#44536A"
                  fontSize="64"
                  fontWeight="700"
                  fontFamily="TT Positive Extended, sans-serif"
                >
                  {item.year}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default ImportChart;
