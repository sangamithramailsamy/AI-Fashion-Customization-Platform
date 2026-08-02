/**
 * Tasteful SVG illustrations for sleeve and neck types.
 * Neutral, on-brand line illustrations that stand in for final
 * boutique media — which will be supplied/loaded from the backend later.
 * Uses theme tokens so it adapts to Light/Dark automatically.
 */

interface Props {
  type: 'sleeve' | 'neck';
  variant: string;
  selected?: boolean;
  className?: string;
}

export default function GarmentIllustration({ type, variant, selected, className = '' }: Props) {
  const stroke = 'var(--anim-dark-brown)';
  const accent = 'var(--primary)';
  const fill = selected ? 'var(--surface)' : 'transparent';

  return (
    <svg
      viewBox="0 0 120 140"
      className={className}
      role="img"
      aria-label={`${type} illustration: ${variant}`}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Base garment torso — a simple bodice */}
      <path
        d="M40 40 L40 110 Q40 116 46 116 L74 116 Q80 116 80 110 L80 40 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
      {/* shoulders */}
      <path d="M40 40 L30 44 M80 40 L90 44" fill="none" stroke={stroke} strokeWidth={1.5} />

      {type === 'sleeve' && <SleeveVariant variant={variant} stroke={stroke} accent={accent} fill={fill} />}
      {type === 'neck' && <NeckVariant variant={variant} stroke={stroke} accent={accent} />}

      {/* label dot */}
      {selected && <circle cx="60" cy="128" r="3" fill={accent} />}
    </svg>
  );
}

function SleeveVariant({ variant, stroke, accent, fill }: { variant: string; stroke: string; accent: string; fill: string }) {
  switch (variant) {
    case 'sleeveless':
      // clean armhole
      return (
        <>
          <path d="M40 40 Q34 50 34 60" fill="none" stroke={stroke} strokeWidth={1.5} />
          <path d="M80 40 Q86 50 86 60" fill="none" stroke={stroke} strokeWidth={1.5} />
        </>
      );
    case 'short':
      return (
        <>
          <path d="M40 40 L28 52 L34 62 L40 56 Z" fill={fill} stroke={stroke} strokeWidth={1.5} />
          <path d="M80 40 L92 52 L86 62 L80 56 Z" fill={fill} stroke={stroke} strokeWidth={1.5} />
        </>
      );
    case 'elbow':
      return (
        <>
          <path d="M40 40 L24 58 L30 72 L40 66 Z" fill={fill} stroke={stroke} strokeWidth={1.5} />
          <path d="M80 40 L96 58 L90 72 L80 66 Z" fill={fill} stroke={stroke} strokeWidth={1.5} />
        </>
      );
    case 'three-quarter':
      return (
        <>
          <path d="M40 40 L20 62 L26 84 L40 78 Z" fill={fill} stroke={stroke} strokeWidth={1.5} />
          <path d="M80 40 L100 62 L94 84 L80 78 Z" fill={fill} stroke={stroke} strokeWidth={1.5} />
        </>
      );
    case 'full':
      return (
        <>
          <path d="M40 40 L18 64 L24 96 L40 90 Z" fill={fill} stroke={stroke} strokeWidth={1.5} />
          <path d="M80 40 L102 64 L96 96 L80 90 Z" fill={fill} stroke={stroke} strokeWidth={1.5} />
          <line x1="24" y1="96" x2="40" y2="90" stroke={accent} strokeWidth={1} />
          <line x1="96" y1="96" x2="80" y2="90" stroke={accent} strokeWidth={1} />
        </>
      );
    default:
      return null;
  }
}

function NeckVariant({ variant, stroke, accent }: { variant: string; stroke: string; accent: string }) {
  switch (variant) {
    case 'round':
      return <path d="M48 40 Q60 50 72 40" fill="none" stroke={stroke} strokeWidth={1.5} />;
    case 'v':
      return <path d="M48 40 L60 56 L72 40" fill="none" stroke={stroke} strokeWidth={1.5} />;
    case 'square':
      return <path d="M48 40 L48 50 L72 50 L72 40" fill="none" stroke={stroke} strokeWidth={1.5} />;
    case 'boat':
      return <path d="M34 44 Q60 48 86 44" fill="none" stroke={stroke} strokeWidth={1.5} />;
    case 'high':
      return (
        <>
          <path d="M48 40 Q60 42 72 40" fill="none" stroke={stroke} strokeWidth={1.5} />
          <path d="M48 40 L48 30 Q60 28 72 30 L72 40" fill="none" stroke={accent} strokeWidth={1.2} />
        </>
      );
    default:
      return null;
  }
}
