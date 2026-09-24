type SoftSketchGapChartProps = {
  className?: string;
};

/**
 * Hand-drawn soft-sketch gap chart (SVG).
 * Teal structure + coral gap mark (decoration only via --color-gap).
 * Readable gap amounts elsewhere use --color-gap-text. No text in the graphic.
 */
export function SoftSketchGapChart({ className = "" }: SoftSketchGapChartProps) {
  return (
    <svg
      viewBox="0 0 420 260"
      className={className}
      role="img"
      aria-label="גרף סקיצה: היום מול אפשרי עם סימון פער"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Faint paper guides */}
      <path
        d="M28 70h364"
        stroke="var(--color-primary)"
        strokeOpacity="0.12"
        strokeWidth="1"
        strokeDasharray="3 5"
      />
      <path
        d="M28 200h364"
        stroke="var(--color-primary)"
        strokeOpacity="0.14"
        strokeWidth="1.2"
      />

      {/* Today bar — imperfect rounded path */}
      <path
        d="M72 198
           C70 150 71 120 73 108
           C74 100 82 96 92 97
           L148 96
           C158 96 165 102 164 112
           C163 140 164 170 165 198
           Z"
        fill="var(--color-primary)"
        fillOpacity="0.12"
        stroke="var(--color-primary)"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Possible bar — taller, slightly offset */}
      <path
        d="M230 198
           C228 130 229 90 231 62
           C232 52 242 48 254 49
           L324 48
           C336 48 344 56 343 68
           C342 110 343 155 344 198
           Z"
        fill="var(--color-primary)"
        fillOpacity="0.07"
        stroke="var(--color-primary)"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Tiny measurement dots */}
      <circle cx="92" cy="97" r="2.4" fill="var(--color-primary)" fillOpacity="0.55" />
      <circle cx="254" cy="49" r="2.4" fill="var(--color-primary)" fillOpacity="0.55" />

      {/* Dimension tick between tops */}
      <path
        d="M165 108 C190 90 210 70 228 62"
        stroke="var(--color-primary)"
        strokeOpacity="0.35"
        strokeWidth="1.2"
        strokeDasharray="2 4"
        strokeLinecap="round"
      />

      {/* Coral gap mark — decorative --color-gap stroke (not readable text) */}
      <path
        d="M190 88
           C198 110 200 135 196 160
           C194 172 190 182 186 190"
        stroke="var(--color-gap)"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.92"
      />
      {/* soft secondary marker texture */}
      <path
        d="M194 95
           C200 118 201 140 198 162"
        stroke="var(--color-gap)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}
