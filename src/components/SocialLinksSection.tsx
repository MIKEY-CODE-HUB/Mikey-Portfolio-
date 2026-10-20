import React, { forwardRef } from 'react';
import { EXTERNAL_PROFILES } from '../domain/portfolioData';
import { SocialPlatformIcon } from './SocialPlatformIcon';

export interface SocialLinksSectionProps {
  onNavigate: (path: string) => void;
}

export const SocialLinksSection = forwardRef<
  HTMLElement,
  SocialLinksSectionProps
>(({ onNavigate }, ref) => {
  return (
    <section
      ref={ref}
      id="social-links"
      aria-labelledby="social-links-heading"
      data-testid="social-links-section"
      className="scroll-mt-24 w-full max-w-[1360px] mx-auto px-6 md:px-12 py-12 pb-20"
    >
      <div className="bg-[#111210]/94 border border-[#454642]/75 px-7 sm:px-10 md:px-12 py-8 sm:py-10 pointer-events-auto">
        {/* Top Row: Heading, Description, and Navigation Buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-2.5">
            <div className="flex items-center gap-3 text-xs font-mono-tech text-[#526BFF]">
              <span
                className="inline-block w-5 h-[2px] bg-[#526BFF]"
                aria-hidden="true"
              />
              <span>06 — SOCIAL LINKS · CONTINUE THE CONVERSATION</span>
            </div>

            <h2
              id="social-links-heading"
              className="font-editorial text-3xl sm:text-4xl md:text-[44px] text-[#F8F7F2] tracking-tight leading-[1.12]"
            >
              Continue the Conversation
            </h2>

            <p className="text-xs sm:text-sm text-[#E9E5DA]/85 leading-relaxed max-w-2xl pt-0.5">
              Direct external profiles across engineering, competitive programming,
              professional updates, and soundscapes. Every coordinate below opens
              directly in a new tab.
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-wrap items-center lg:justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/about')}
              className="px-4 py-2 text-xs font-mono-tech text-[#E9E5DA] bg-[#161715]/90 border border-[#454642] hover:border-[#888983] active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F8F7F2]"
            >
              Read Introduction (02)
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-4 py-2 text-xs font-mono-tech text-[#111210] bg-[#E9E5DA] hover:bg-[#F8F7F2] active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F8F7F2]"
            >
              Return to Threshold (01)
            </button>
          </div>
        </div>

        {/* Middle Row: Compact Horizontal Social Row with Thin Vertical Separators */}
        <nav
          aria-label="MIKEY social links"
          data-testid="verified-social-profiles"
          className="mt-10 mb-12 grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-center lg:justify-between gap-y-6 gap-x-4"
        >
          {EXTERNAL_PROFILES.map((profile, idx) => (
            <React.Fragment key={profile.id}>
              <a
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={profile.ariaLabel}
                data-testid={`social-link-${profile.id}`}
                className="group inline-flex items-center gap-3.5 py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#526BFF]"
              >
                <SocialPlatformIcon
                  platformId={profile.id}
                  className="w-5 h-5 text-[#F8F7F2] group-hover:text-[#526BFF] transition-colors shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-editorial text-base sm:text-[17px] text-[#F8F7F2] group-hover:text-[#526BFF] transition-colors leading-snug">
                    {profile.label}
                  </span>
                  <span className="font-mono-tech text-[11px] text-[#888983] leading-snug whitespace-nowrap">
                    {profile.domain}
                  </span>
                </div>
              </a>

              {idx < EXTERNAL_PROFILES.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden lg:block w-[1px] h-9 bg-[#454642]/65 shrink-0"
                />
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Minimal Architectural Footer */}
        <footer className="pt-4 border-t border-[#454642]/50 flex items-center justify-between text-[11px] font-mono-tech text-[#888983] tracking-wider">
          <span>MIKEY · ARCHITECTURAL PORTFOLIO</span>
        </footer>
      </div>
    </section>
  );
});

SocialLinksSection.displayName = 'SocialLinksSection';
