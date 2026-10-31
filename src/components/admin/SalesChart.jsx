import { useEffect, useId, useRef, useState } from "react";
import { formatPrice } from "../../services/productService";

// Courbe de ventes en SVG (aucune bibliothèque de graphiques à installer).
// data : [{ label, fullLabel, value }] ; value en FCFA.
const PAD = { top: 26, right: 16, bottom: 30, left: 56 };
const number = new Intl.NumberFormat("fr-FR");

function niceStep(raw) {
  const power = 10 ** Math.floor(Math.log10(raw));
  const fraction = raw / power;
  return (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * power;
}

export default function SalesChart({ data }) {
  const wrapper = useRef(null);
  const gradientId = `sales-${useId().replace(/:/g, "")}`;
  const [width, setWidth] = useState(600);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const element = wrapper.current;
    if (!element) return undefined;
    setWidth(element.clientWidth || 600);
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width) || 600));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const height = width < 480 ? 220 : 270;
  const max = Math.max(...data.map((point) => point.value), 1);
  const step = niceStep(max / 4);
  const top = step * Math.ceil(max / step);
  const ticks = Array.from({ length: top / step + 1 }, (_, index) => index * step);
  const plotWidth = width - PAD.left - PAD.right;
  const plotHeight = height - PAD.top - PAD.bottom;
  const x = (index) => PAD.left + (data.length > 1 ? (index * plotWidth) / (data.length - 1) : plotWidth / 2);
  const y = (value) => PAD.top + (1 - value / top) * plotHeight;
  const baseline = PAD.top + plotHeight;

  const points = data.map((point, index) => [x(index), y(point.value)]);
  const line = points.reduce((path, [px, py], index) => {
    if (index === 0) return `M${px},${py}`;
    const [prevX, prevY] = points[index - 1];
    const mid = (prevX + px) / 2;
    return `${path} C${mid},${prevY} ${mid},${py} ${px},${py}`;
  }, "");
  const area = `${line} L${points[points.length - 1][0]},${baseline} L${points[0][0]},${baseline} Z`;

  const active = hovered ?? data.length - 1;
  const [activeX, activeY] = points[active];
  const tooltipLeft = Math.min(Math.max(activeX, 70), width - 70);

  const onPointerMove = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    const position = event.clientX - box.left;
    let nearest = 0;
    points.forEach(([px], index) => {
      if (Math.abs(px - position) < Math.abs(points[nearest][0] - position)) nearest = index;
    });
    setHovered(nearest);
  };

  return (
    <div ref={wrapper} className="relative w-full min-w-0" style={{ height }}>
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={`Évolution des ventes sur ${data.length} jours, en FCFA`}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setHovered(null)}
        className="absolute left-0 top-0 block touch-pan-y"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#15803D" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#15803D" stopOpacity="0" />
          </linearGradient>
        </defs>
        <text x={PAD.left - 10} y={10} textAnchor="end" className="fill-gray-400 text-[10px] font-semibold">FCFA</text>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} stroke="#E5E7EB" strokeDasharray={tick === 0 ? undefined : "3 4"} />
            <text x={PAD.left - 10} y={y(tick) + 4} textAnchor="end" className="fill-gray-400 text-[11px]">{number.format(tick)}</text>
          </g>
        ))}
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <line x1={activeX} x2={activeX} y1={PAD.top} y2={baseline} stroke="#15803D" strokeOpacity="0.25" strokeDasharray="3 3" />
        {points.map(([px, py], index) => (
          <circle key={data[index].label + index} cx={px} cy={py} r={index === active ? 5.5 : 3.5} fill={index === active ? "#DC2626" : "#fff"} stroke={index === active ? "#fff" : "#15803D"} strokeWidth={index === active ? 2.5 : 2} />
        ))}
        {data.map((point, index) => (
          <text key={point.label + index} x={points[index][0]} y={height - 8} textAnchor="middle" className={`text-[11px] ${index === active ? "fill-gray-900 font-bold" : "fill-gray-500"}`}>{point.label}</text>
        ))}
      </svg>
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg"
        style={{ left: tooltipLeft, top: Math.max(activeY - 12, 28) }}
        aria-hidden="true"
      >
        <span className="block text-white/70">{data[active].fullLabel}</span>
        <span className="font-bold">{formatPrice(data[active].value)}</span>
      </div>
      <ul className="sr-only">
        {data.map((point) => (
          <li key={point.fullLabel}>{point.fullLabel} : {formatPrice(point.value)}</li>
        ))}
      </ul>
    </div>
  );
}
