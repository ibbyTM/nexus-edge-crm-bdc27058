import { useEffect, useState, useRef } from 'react';

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const start = prev.current;
    const end = typeof target === 'number' ? target : parseFloat(String(target)) || 0;
    if (start === end) { setValue(end); return; }

    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setValue(current);
      if (progress < 1) requestAnimationFrame(step);
      else prev.current = end;
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return value;
}

interface StatCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  color?: string;
  icon?: React.ReactNode;
  decimals?: number;
}

export default function StatCard({ label, value, suffix = '', prefix = '', color = '', icon, decimals = 0 }: StatCardProps) {
  const animated = useCountUp(typeof value === 'number' ? value : parseFloat(String(value)) || 0);
  const display = decimals > 0 ? animated.toFixed(decimals) : Math.round(animated).toLocaleString();

  return (
    <div className="stat-card animate-in">
      {icon && <div className="stat-icon">{icon}</div>}
      <div>
        <div className="stat-label">{label}</div>
        <div className={`stat-value ${color}`}>
          {prefix}{display}{suffix}
        </div>
      </div>
    </div>
  );
}
