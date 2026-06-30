import React from 'react';

/**
 * TemperGauge — AlgoForge's signature progress visualization.
 * 
 * Represents mastery as heat: cold iron (0%) → ember (50%) → white-hot (100%).
 * Replaces generic gray progress bars and donut charts across the app.
 * 
 * @param {number} progress - 0 to 100
 * @param {string} variant - "bar" (default horizontal) or "ring" (radial SVG)
 * @param {number} size - Ring diameter in px (only for variant="ring", default 160)
 * @param {number} strokeWidth - Ring stroke width (only for variant="ring", default 12)
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} children - Content to render inside ring center
 */
const TemperGauge = ({
  progress = 0,
  variant = 'bar',
  size = 160,
  strokeWidth = 12,
  className = '',
  children,
  label,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  if (variant === 'ring') {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - clampedProgress / 100);
    const center = size / 2;

    return (
      <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="temper-gradient-ring" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2A1810" />
              <stop offset="25%" stopColor="#6B3A1C" />
              <stop offset="50%" stopColor="#E8722C" />
              <stop offset="75%" stopColor="#FF8A3D" />
              <stop offset="100%" stopColor="#FFD9A0" />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#1B1E24"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Fill */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#temper-gradient-ring)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center content */}
        {children && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {children}
          </div>
        )}
      </div>
    );
  }

  // Default: horizontal bar
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm text-text-secondary">{label}</span>
          <span className="text-sm font-mono text-text-muted">{clampedProgress}%</span>
        </div>
      )}
      <div className="temper-gauge-track">
        <div
          className="temper-gauge-fill"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default TemperGauge;
