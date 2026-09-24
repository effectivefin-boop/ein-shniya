type BrandMarkProps = {
  className?: string;
  /** Pixel size of the square mark. Readable from 16px. */
  size?: number;
  title?: string | false;
};

/**
 * Soft-sketch second-eye / second-look mark for עין שנייה.
 * Teal imperfect dual gaze outlines + iris; coral ONLY as the small gap
 * accent between the two gaze lines. Never fill the whole eye coral.
 */
export function BrandMark({
  className = "",
  size = 32,
  title = "עין שנייה",
}: BrandMarkProps) {
  const label = title === false || title === "" ? undefined : title;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      {label ? <title>{label}</title> : null}
      {/* Outer eye almond — imperfect teal stroke */}
      <path
        d="M3.6 16.3c2.6-6.1 8.9-9.1 12.5-9.15 3.8-.05 9.6 2.7 12.3 8.9-2.5 5.9-8.6 9.2-12.4 9.15-4-.05-9.8-2.9-12.4-8.9z"
        stroke="var(--color-primary, #0d5c63)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="var(--color-primary, #0d5c63)"
        fillOpacity="0.07"
      />
      {/* Second look — inset gaze outline */}
      <path
        d="M7.1 16.2c1.85-3.7 5.9-5.45 8.95-5.45 3.2 0 6.95 1.65 8.85 5.3-1.75 3.55-5.55 5.45-8.9 5.4-3.25-.05-6.9-1.75-8.9-5.25z"
        stroke="var(--color-primary, #0d5c63)"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.9"
      />
      {/* Iris */}
      <circle
        cx="16.05"
        cy="16.05"
        r="4.15"
        stroke="var(--color-primary, #0d5c63)"
        strokeWidth="1.55"
        strokeLinecap="round"
        fill="var(--color-primary, #0d5c63)"
        fillOpacity="0.1"
      />
      {/* Coral gap accent — small arc between the two gaze lines (not a filled eye) */}
      <path
        d="M23.1 11.35c1.05 1.2 1.8 2.65 2.1 4.2"
        stroke="var(--color-gap, #e07a5f)"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.95"
      />
    </svg>
  );
}
