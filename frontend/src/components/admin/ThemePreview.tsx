'use client';

import React from 'react';

interface ThemePreviewProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: number;
  glassmorphismIntensity: number;
}

export default function ThemePreview({
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor,
  textColor,
  fontFamily,
  borderRadius,
  glassmorphismIntensity,
}: ThemePreviewProps) {
  const glassOpacity = Math.round((glassmorphismIntensity / 100) * 255)
    .toString(16)
    .padStart(2, '0');

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
        Live Preview
      </h3>

      {/* Preview container */}
      <div
        className="relative overflow-hidden p-6 border border-white/10"
        style={{
          backgroundColor,
          borderRadius: `${borderRadius}px`,
          fontFamily,
        }}
      >
        {/* Glass card */}
        <div
          className="relative p-5 border"
          style={{
            backgroundColor: `${secondaryColor}${glassOpacity}`,
            borderColor: `${textColor}20`,
            borderRadius: `${borderRadius}px`,
            backdropFilter: `blur(${glassmorphismIntensity / 5}px)`,
          }}
        >
          {/* Header text */}
          <h4
            className="text-lg font-bold mb-2"
            style={{ color: primaryColor, fontFamily }}
          >
            Sample Heading
          </h4>

          {/* Body text */}
          <p
            className="text-sm mb-4 opacity-80"
            style={{ color: textColor, fontFamily }}
          >
            This preview updates in real-time as you change theme values.
          </p>

          {/* Accent element (button mock) */}
          <div className="flex items-center gap-3">
            <span
              className="inline-block px-4 py-1.5 text-xs font-semibold"
              style={{
                backgroundColor: accentColor,
                color: backgroundColor,
                borderRadius: `${borderRadius / 2}px`,
              }}
            >
              Button
            </span>
            <span
              className="text-xs underline"
              style={{ color: accentColor }}
            >
              Link Text
            </span>
          </div>
        </div>

        {/* Color swatches row */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {[
            { label: 'Primary', color: primaryColor },
            { label: 'Secondary', color: secondaryColor },
            { label: 'Accent', color: accentColor },
            { label: 'Background', color: backgroundColor },
            { label: 'Text', color: textColor },
          ].map((swatch) => (
            <div key={swatch.label} className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 border border-white/20"
                style={{
                  backgroundColor: swatch.color,
                  borderRadius: `${Math.min(borderRadius, 8)}px`,
                }}
              />
              <span
                className="text-[10px] opacity-60"
                style={{ color: textColor }}
              >
                {swatch.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
