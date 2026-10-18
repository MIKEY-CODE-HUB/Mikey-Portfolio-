import React, { useState } from 'react';

export const SynthesisStudio: React.FC = () => {
  // 1. High-Thinking Inquiry (gemini-4-argon + ThinkingLevel.HIGH)
  const [inquiryInput, setInquiryInput] = useState(
    'How do formal mathematical models and human intuition complement each other when building complex software?'
  );
  const [inquiryResult, setInquiryResult] = useState<string | null>(null);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);

  // 2. High-Quality Architectural Plate Generator (gemini-3-pro-image-preview + 1K / 2K / 4K)
  const [platePrompt, setPlatePrompt] = useState(
    'Monumental obsidian Penrose monolith inside a dark concrete library with bone-white geometric light shafts'
  );
  const [plateSize, setPlateSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [plateImageUrl, setPlateImageUrl] = useState<string | null>(null);
  const [plateLoading, setPlateLoading] = useState(false);
  const [plateError, setPlateError] = useState<string | null>(null);

  const handleRunInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryInput.trim()) {
      setInquiryError('Please enter a philosophical or technical question first.');
      return;
    }
    setInquiryError(null);
    setInquiryLoading(true);
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: inquiryInput.trim(),
          context: 'MIKEY Portfolio — Notes & Philosophical Margins',
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to complete synthesis.');
      }
      setInquiryResult(data.answer);
    } catch (err: unknown) {
      setInquiryError(
        err instanceof Error ? err.message : 'Unable to reach synthesis server.'
      );
    } finally {
      setInquiryLoading(false);
    }
  };

  const handleGeneratePlate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platePrompt.trim()) {
      setPlateError('Please describe the architectural study plate you want to render.');
      return;
    }
    setPlateError(null);
    setPlateLoading(true);
    try {
      const response = await fetch('/api/generate-plate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: platePrompt.trim(),
          size: plateSize,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to generate architectural plate.');
      }
      setPlateImageUrl(data.imageUrl);
    } catch (err: unknown) {
      setPlateError(
        err instanceof Error ? err.message : 'Unable to generate architectural plate.'
      );
    } finally {
      setPlateLoading(false);
    }
  };

  return (
    <div className="mt-12 pt-10 border-t border-[#454642]/60 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Deep Philosophical & Systems Reasoning (gemini-4-argon ThinkingLevel.HIGH) */}
      <div className="bg-[#161715]/90 border border-[#454642]/70 p-6 flex flex-col justify-between">
        <div>
          <div className="text-xs font-mono-tech text-[#888983] mb-2">
            04.A · Deep Reasoning Synthesis · High Thinking Mode
          </div>
          <h3 className="font-editorial text-2xl text-[#F8F7F2] mb-2">
            Dialectical Systems Inquiry
          </h3>
          <p className="text-sm text-[#888983] leading-relaxed mb-5">
            Explore a question at the intersection of algorithms, quantitative reasoning,
            and philosophy using deep reasoning.
          </p>

          <form onSubmit={handleRunInquiry} className="space-y-4">
            <div>
              <label
                htmlFor="inquiry-input"
                className="block text-xs text-[#E9E5DA] mb-1.5"
              >
                Proposition or Question
              </label>
              <textarea
                id="inquiry-input"
                rows={3}
                value={inquiryInput}
                onChange={(e) => setInquiryInput(e.target.value)}
                className="w-full bg-[#111210] border border-[#454642] p-3 text-sm text-[#F8F7F2] focus:border-[#E9E5DA] focus:outline-none"
                placeholder="Ask a question about systems, paradox, or learning..."
              />
            </div>

            {inquiryError && (
              <p role="alert" className="text-xs text-[#E9E5DA] bg-[#20211F] p-2.5 border border-[#888983]">
                {inquiryError}
              </p>
            )}

            <button
              type="submit"
              disabled={inquiryLoading}
              className="px-4 py-2 text-xs font-medium bg-[#E9E5DA] text-[#111210] hover:bg-[#F8F7F2] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
            >
              {inquiryLoading ? 'Synthesizing Reflection...' : 'Synthesize Reflection'}
            </button>
          </form>
        </div>

        {inquiryResult && (
          <div
            className="mt-6 pt-5 border-t border-[#454642]/50 space-y-3 text-sm text-[#E9E5DA] leading-relaxed"
            data-testid="inquiry-result"
          >
            {inquiryResult.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Monochromatic Architectural Study Plate Generator (1K / 2K / 4K) */}
      <div className="bg-[#161715]/90 border border-[#454642]/70 p-6 flex flex-col justify-between">
        <div>
          <div className="text-xs font-mono-tech text-[#888983] mb-2">
            04.B · Spatial Study Plate · 1K / 2K / 4K Resolution
          </div>
          <h3 className="font-editorial text-2xl text-[#F8F7F2] mb-2">
            Impossible Architecture Plate Generator
          </h3>
          <p className="text-sm text-[#888983] leading-relaxed mb-5">
            Render a monochromatic architectural study plate matching this world’s
            obsidian-and-bone visual language at your chosen output resolution.
          </p>

          <form onSubmit={handleGeneratePlate} className="space-y-4">
            <div>
              <label
                htmlFor="plate-prompt"
                className="block text-xs text-[#E9E5DA] mb-1.5"
              >
                Spatial Study Description
              </label>
              <input
                id="plate-prompt"
                type="text"
                value={platePrompt}
                onChange={(e) => setPlatePrompt(e.target.value)}
                className="w-full bg-[#111210] border border-[#454642] p-3 text-sm text-[#F8F7F2] focus:border-[#E9E5DA] focus:outline-none"
                placeholder="Describe an impossible architectural composition..."
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#888983] whitespace-nowrap">
                  Image Size:
                </span>
                <div
                  role="group"
                  aria-label="Select image resolution size"
                  className="flex items-center gap-1 bg-[#111210] p-1 border border-[#454642]"
                >
                  {(['1K', '2K', '4K'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setPlateSize(sz)}
                      className={`px-3 py-1 text-xs font-mono-tech transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        plateSize === sz
                          ? 'bg-[#E9E5DA] text-[#111210] font-medium'
                          : 'text-[#888983] hover:text-[#E9E5DA]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={plateLoading}
                className="px-4 py-2 text-xs font-medium bg-[#E9E5DA] text-[#111210] hover:bg-[#F8F7F2] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                {plateLoading ? `Rendering ${plateSize} Plate...` : `Render ${plateSize} Plate`}
              </button>
            </div>

            {plateError && (
              <p role="alert" className="text-xs text-[#E9E5DA] bg-[#20211F] p-2.5 border border-[#888983]">
                {plateError}
              </p>
            )}
          </form>
        </div>

        {plateImageUrl && (
          <div className="mt-6 pt-5 border-t border-[#454642]/50">
            <div className="aspect-video w-full bg-[#111210] border border-[#454642] overflow-hidden">
              <img
                src={plateImageUrl}
                alt={`Architectural study plate (${plateSize}): ${platePrompt}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-mono-tech text-[#888983]">
              <span>Resolution · {plateSize}</span>
              <span>Monochrome Study Archive</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
