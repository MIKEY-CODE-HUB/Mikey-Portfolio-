import React, { useEffect, useState } from 'react';
import { RouteId } from '../domain/portfolioData';

export interface MikeyGlyphProps {
  activeRouteId: RouteId;
  foldDepth: number;
  isDiscovering?: boolean;
  reducedMotion?: boolean;
  onTriggerFoldPulse?: () => void;
}

/**
 * Custom MIKEY Mini-Avatar / Architectural Glyph
 *
 * A miniature sculptural representation of THE FOLD + MIKEY monogram:
 * - Outer nested frame in bone-white (#E9E5DA)
 * - Articulating inner folded plane that responds to cursor angle, active chapter, and foldDepth
 * - Dual-accent vertex node (Electric Cobalt #526BFF / Warm Amber #F0A65A)
 */
export const MikeyGlyph: React.FC<MikeyGlyphProps> = ({
  activeRouteId,
  foldDepth,
  isDiscovering = false,
  reducedMotion = false,
  onTriggerFoldPulse,
}) => {
  const [pointerTilt, setPointerTilt] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const ny = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      setPointerTilt({ x: nx * 2.2, y: ny * 2.2 });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reducedMotion]);

  const isAmberChapter =
    activeRouteId === 'about' ||
    activeRouteId === 'spaces' ||
    activeRouteId === 'work-deadzone';
  const accentHex = isAmberChapter ? '#F0A65A' : '#526BFF';

  const foldShift = (foldDepth - 0.3) * 3.5 + (hovered ? 1.8 : 0);
  const tx = reducedMotion ? 0 : pointerTilt.x;
  const ty = reducedMotion ? 0 : pointerTilt.y;

  return (
    <button
      type="button"
      onClick={onTriggerFoldPulse}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="MIKEY architectural glyph — Click to shift The Fold"
      title="MIKEY Architectural Companion · Click to unfold another layer"
      data-testid="mikey-glyph"
      className="group relative inline-flex items-center justify-center w-8 h-8 bg-[#161715] border border-[#454642] hover:border-[#E9E5DA] transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-[#E9E5DA]"
    >
      <svg
        viewBox="0 0 32 32"
        className="w-5 h-5 overflow-visible"
        aria-hidden="true"
      >
        {/* Outer Monumental Frame */}
        <rect
          x={4}
          y={4}
          width={24}
          height={24}
          fill="none"
          stroke="#E9E5DA"
          strokeWidth={1.5}
          opacity={0.9}
        />

        {/* Middle Nested Frame (Articulates with foldDepth & cursor) */}
        <g
          transform={`translate(${(tx * 0.55).toFixed(2)}, ${(ty * 0.55).toFixed(
            2
          )})`}
        >
          <polygon
            points={`8,8 ${24 - foldShift * 0.4},9 23,24 9,${
              23 - foldShift * 0.3
            }`}
            fill="#20211F"
            stroke={hovered || isDiscovering ? accentHex : '#888983'}
            strokeWidth={1.3}
          />
        </g>

        {/* Inner Folded M-Monogram & Bridge Vector */}
        <g
          transform={`translate(${tx.toFixed(2)}, ${ty.toFixed(2)})`}
        >
          <path
            d={`M 10 21 L 10 11 L 16 ${16.5 + foldShift * 0.35} L 22 11 L 22 21`}
            fill="none"
            stroke="#F8F7F2"
            strokeWidth={1.6}
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
          {/* Impossible Bridge Seam */}
          <line
            x1={7}
            y1={24}
            x2={25}
            y2={8}
            stroke={accentHex}
            strokeWidth={1.2}
            opacity={hovered || isDiscovering ? 1 : 0.75}
          />
          {/* Illuminated Vertex Node */}
          <rect
            x={14.6}
            y={14.8 + foldShift * 0.3}
            width={2.8}
            height={2.8}
            fill={accentHex}
          />
        </g>
      </svg>
    </button>
  );
};
