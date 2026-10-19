import React, { useEffect, useState } from 'react';
import { SurfaceFinishMode } from '../three/signatureObject';

export interface BottomControlDockProps {
  paradoxValue: number;
  onParadoxChange: (val: number | null) => void;
  finishMode: SurfaceFinishMode;
  onFinishModeChange: (mode: SurfaceFinishMode) => void;
  cameraPreset: 'narrative' | 'isometric' | 'elevation';
  onCameraPresetChange: (preset: 'narrative' | 'isometric' | 'elevation') => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  onResetView: () => void;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  paradoxValue,
  onParadoxChange,
  finishMode,
  onFinishModeChange,
  cameraPreset,
  onCameraPresetChange,
  reducedMotion,
  onToggleReducedMotion,
  onResetView,
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key.toLowerCase() === 'h') {
        setCollapsed((prev) => !prev);
      }
    };
    const onResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <aside
      aria-label="Spatial architecture controls"
      className="fixed bottom-2 left-1/2 -translate-x-1/2 z-30 w-[min(920px,95vw)] pointer-events-auto"
    >
      <div className="flex justify-center mb-1">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-expanded={!collapsed}
          className="px-3 py-0.5 text-[11px] font-mono-tech tracking-wider text-[#E9E5DA] bg-[#161715] border border-[#454642]/70 hover:border-[#888983] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {collapsed ? '▴ Show Spatial Controls (H)' : '▾ Hide Spatial Controls (H)'}
        </button>
      </div>

      {!collapsed && (
        <div className="bg-[#161715]/95 border border-[#454642]/80 px-3.5 py-2 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 text-xs text-[#E9E5DA]">
          {/* 1. Paradox Geometry Decomposition Slider */}
          <div className="flex items-center gap-3 min-w-[200px] flex-1">
            <label
              htmlFor="paradox-slider"
              className="font-mono-tech text-[11px] text-[#888983] whitespace-nowrap shrink-0"
            >
              Paradox Axis
            </label>
            <input
              id="paradox-slider"
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={paradoxValue}
              onChange={(e) => onParadoxChange(parseFloat(e.target.value))}
              className="w-full accent-[#E9E5DA] cursor-pointer h-1 bg-[#454642]"
            />
            <span className="font-mono-tech text-[11px] text-[#E9E5DA] w-9 text-right whitespace-nowrap shrink-0">
              {Math.round(paradoxValue * 100)}%
            </span>
          </div>

          {/* 2. Surface Material Finish Switcher */}
          <div
            role="group"
            aria-label="Surface material finish"
            className="flex items-center gap-1 bg-[#111210] p-1 border border-[#454642]/50"
          >
            {(['obsidian', 'graphite', 'wireframe'] as SurfaceFinishMode[]).map(
              (mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onFinishModeChange(mode)}
                  className={`px-2.5 py-1 text-[11px] capitalize transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    finishMode === mode
                      ? 'bg-[#E9E5DA] text-[#111210] font-medium'
                      : 'text-[#888983] hover:text-[#E9E5DA]'
                  }`}
                >
                  {mode}
                </button>
              )
            )}
          </div>

          {/* 3. Camera Perspective Presets */}
          <div
            role="group"
            aria-label="Camera perspective"
            className="flex items-center gap-1 bg-[#111210] p-1 border border-[#454642]/50"
          >
            {(
              [
                { id: 'narrative', label: 'Narrative' },
                { id: 'isometric', label: 'Isometric' },
                { id: 'elevation', label: 'Elevation' },
              ] as const
            ).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onCameraPresetChange(preset.id)}
                className={`px-2.5 py-1 text-[11px] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  cameraPreset === preset.id
                    ? 'bg-[#E9E5DA] text-[#111210] font-medium'
                    : 'text-[#888983] hover:text-[#E9E5DA]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* 4. Motion & Reset Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleReducedMotion}
              aria-pressed={reducedMotion}
              className="px-2.5 py-1 text-[11px] border border-[#454642] text-[#888983] hover:text-[#E9E5DA] hover:border-[#888983] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {reducedMotion ? 'Motion: Still' : 'Motion: Calm'}
            </button>
            <button
              type="button"
              onClick={onResetView}
              className="px-2.5 py-1 text-[11px] border border-[#454642] text-[#E9E5DA] hover:bg-[#20211F] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Reset View
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
