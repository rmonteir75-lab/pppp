import React from 'react';

interface SMExpressLogoProps {
  variant?: 'badge' | 'horizontal' | 'icon' | 'compact';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'responsive' | 'custom';
  customSize?: number;
  className?: string;
  showTagline?: boolean;
}

export const SMExpressLogo: React.FC<SMExpressLogoProps> = ({
  variant = 'badge',
  size = 'md',
  customSize,
  className = '',
  showTagline = true
}) => {
  // Dimension calculation
  const getDimension = () => {
    if (customSize) return customSize;
    switch (size) {
      case 'xs': return 36;
      case 'sm': return 52;
      case 'md': return 80;
      case 'lg': return 128;
      case 'xl': return 180;
      case '2xl': return 260;
      case 'responsive': return undefined;
      default: return 80;
    }
  };

  const dim = getDimension();

  // Full SVG Badge mirroring the exact official logo provided
  const renderBadgeSVG = (width?: number, height?: number) => (
    <svg
      viewBox="0 0 500 500"
      {...(width ? { width, height } : {})}
      className={`select-none ${size === 'responsive' ? 'w-full h-full' : ''} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="SM Express Serviços Gerais - Logo Oficial"
    >
      <defs>
        {/* High-contrast vibrant gradients */}
        <linearGradient id="smRoyalBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00358E" />
          <stop offset="50%" stopColor="#002266" />
          <stop offset="100%" stopColor="#001238" />
        </linearGradient>

        <linearGradient id="smGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE033" />
          <stop offset="50%" stopColor="#FFBA00" />
          <stop offset="100%" stopColor="#E59000" />
        </linearGradient>

        <linearGradient id="smSwooshBlue" x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#004AD6" />
          <stop offset="60%" stopColor="#003399" />
          <stop offset="100%" stopColor="#001F6B" />
        </linearGradient>

        <filter id="smDropShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* 1. Outer Dark Background Base Circle with subtle border */}
      <circle cx="250" cy="250" r="248" fill="#000918" />

      {/* 2. Outer Royal Blue Main Ring */}
      <circle cx="250" cy="250" r="242" fill="url(#smRoyalBlueGrad)" stroke="#FFBA00" strokeWidth="4.5" />

      {/* 3. Golden Accent Ring with clean white inner spacer */}
      <circle cx="250" cy="250" r="222" fill="none" stroke="url(#smGoldGrad)" strokeWidth="4.5" />
      <circle cx="250" cy="250" r="218" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />

      {/* 4. White Center Circle */}
      <circle cx="250" cy="250" r="216" fill="#FFFFFF" />

      {/* 5. Dynamic Upper Blue & Yellow Swooshes wrapping over "SM" */}
      {/* Yellow Swoosh Accent */}
      <path
        d="M 105 168 C 135 68, 370 58, 412 152 C 380 92, 200 88, 140 178 Z"
        fill="url(#smGoldGrad)"
        stroke="#FFFFFF"
        strokeWidth="1.5"
      />

      {/* Royal Blue Main Dynamic Swoosh Arc with white isolation outline */}
      <path
        d="M 78 214 C 65 138, 150 72, 340 68 C 408 66, 432 108, 422 118 C 375 82, 185 92, 102 182 C 88 199, 83 218, 78 214 Z"
        fill="url(#smSwooshBlue)"
        stroke="#FFFFFF"
        strokeWidth="2.5"
      />

      {/* Lower Left Tail Curve of Blue Swoosh */}
      <path
        d="M 78 214 C 74 234, 95 244, 165 238 C 108 246, 68 238, 78 214 Z"
        fill="#002266"
        stroke="#FFFFFF"
        strokeWidth="1.5"
      />

      {/* 6. "SM" Typography - High Contrast with White Halo Separation */}
      <g id="sm-typography">
        <text
          x="250"
          y="214"
          textAnchor="middle"
          fill="#002266"
          stroke="#FFFFFF"
          strokeWidth="9"
          paintOrder="stroke fill"
          strokeLinejoin="round"
          fontFamily="'Arial Black', 'Montserrat', 'Impact', sans-serif"
          fontWeight="900"
          fontSize="130"
          letterSpacing="-3"
        >
          SM
        </text>
      </g>

      {/* 7. "EXPRESS" Typography */}
      <text
        x="250"
        y="286"
        textAnchor="middle"
        fill="#002266"
        fontFamily="'Arial Black', 'Montserrat', sans-serif"
        fontWeight="900"
        fontStyle="italic"
        fontSize="52"
        letterSpacing="2.5"
      >
        EXPRESS
      </text>

      {/* 8. "SERVIÇOS GERAIS" with Golden Divider Lines */}
      <line x1="82" y1="310" x2="132" y2="310" stroke="#FFBA00" strokeWidth="3" strokeLinecap="round" />
      <text
        x="250"
        y="316"
        textAnchor="middle"
        fill="#00205B"
        fontFamily="'Montserrat', 'Arial', sans-serif"
        fontWeight="900"
        fontSize="17"
        letterSpacing="3.5"
      >
        SERVIÇOS GERAIS
      </text>
      <line x1="368" y1="310" x2="418" y2="310" stroke="#FFBA00" strokeWidth="3" strokeLinecap="round" />

      {/* 9. 5 Pentagon / House Service Category Icons */}
      <g id="service-houses" transform="translate(0, 5)">
        {/* House 1: Eletricidade / Raio */}
        <g transform="translate(76, 318)">
          <path d="M 30 0 L 60 16 L 60 58 L 0 58 L 0 16 Z" fill="#00205B" stroke="#FFFFFF" strokeWidth="1.5" rx="3" />
          {/* Lightning Icon in Gold */}
          <path
            d="M 34 16 L 22 32 L 30 32 L 26 48 L 38 30 L 30 30 Z"
            fill="#FFBA00"
          />
        </g>

        {/* House 2: Hidráulica / Torneira & Gotas */}
        <g transform="translate(147, 318)">
          <path d="M 30 0 L 60 16 L 60 58 L 0 58 L 0 16 Z" fill="#00205B" stroke="#FFFFFF" strokeWidth="1.5" rx="3" />
          {/* Tap & Drops Icon */}
          <path d="M 22 24 L 38 24 L 38 28 L 32 28 L 32 35 L 28 35 L 28 28 L 22 28 Z" fill="#FFFFFF" />
          <path d="M 24 20 L 36 20 L 36 23 L 24 23 Z" fill="#FFFFFF" />
          <circle cx="25" cy="42" r="2.5" fill="#38BDF8" />
          <circle cx="35" cy="42" r="2.5" fill="#38BDF8" />
        </g>

        {/* House 3: Reformas & Ferramentas / Martelo e Chave Cruzados */}
        <g transform="translate(218, 314)">
          <path d="M 32 0 L 64 16 L 64 62 L 0 62 L 0 16 Z" fill="#00205B" stroke="#FFBA00" strokeWidth="2" rx="3" />
          {/* Crossed Hammer & Wrench */}
          <path
            d="M 23 23 L 41 41 M 41 23 L 23 41"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <rect x="18" y="19" width="9" height="5" rx="1.5" fill="#FFFFFF" transform="rotate(-45 22 21)" />
          <circle cx="43" cy="21" r="3.5" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
        </g>

        {/* House 4: Segurança & CFTV / Câmera */}
        <g transform="translate(290, 318)">
          <path d="M 30 0 L 60 16 L 60 58 L 0 58 L 0 16 Z" fill="#00205B" stroke="#FFFFFF" strokeWidth="1.5" rx="3" />
          {/* Camera Icon */}
          <rect x="14" y="24" width="24" height="15" rx="3" fill="#FFFFFF" />
          <polygon points="38,28 48,22 48,41 38,35" fill="#FFFFFF" />
          <circle cx="26" cy="31.5" r="4.5" fill="#00205B" />
          <circle cx="26" cy="31.5" r="2" fill="#38BDF8" />
          <path d="M 20 39 L 20 46 L 28 46" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>

        {/* House 5: Mudanças & Carretos / Caminhão */}
        <g transform="translate(362, 318)">
          <path d="M 30 0 L 60 16 L 60 58 L 0 58 L 0 16 Z" fill="#00205B" stroke="#FFFFFF" strokeWidth="1.5" rx="3" />
          {/* Truck Icon */}
          <rect x="12" y="25" width="23" height="16" rx="1" fill="#FFFFFF" />
          <path d="M 35 29 L 45 29 L 48 35 L 48 41 L 35 41 Z" fill="#FFFFFF" />
          <circle cx="20" cy="42" r="4" fill="#00205B" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="41" cy="42" r="4" fill="#00205B" stroke="#FFFFFF" strokeWidth="1.5" />
        </g>
      </g>

      {/* 10. Curved Navy Bottom Banner with Gold Trim Arch */}
      <path
        d="M 52 392 C 108 438, 392 438, 448 392 C 452 406, 436 432, 394 452 C 302 482, 198 482, 106 452 C 64 432, 48 406, 52 392 Z"
        fill="#001438"
        stroke="#FFBA00"
        strokeWidth="3.5"
      />

      {/* 11. "QUALIDADE • CONFIANÇA • SEGURANÇA" Ribbon Text with Blue Contour */}
      <g transform="translate(0, 421)">
        <text
          x="250"
          y="0"
          textAnchor="middle"
          fill="#FFFFFF"
          stroke="#001838"
          strokeWidth="3.2"
          paintOrder="stroke fill"
          strokeLinejoin="round"
          fontFamily="'Montserrat', 'Arial', sans-serif"
          fontWeight="900"
          fontSize="14.5"
          letterSpacing="2"
        >
          QUALIDADE <tspan fill="#FFBA00" stroke="#001838" strokeWidth="2">•</tspan> CONFIANÇA <tspan fill="#FFBA00" stroke="#001838" strokeWidth="2">•</tspan> SEGURANÇA
        </text>
      </g>

      {/* 12. Bottom Slogan: "SOLUÇÕES COMPLETAS" (Gold with Blue Contour) and "PARA VOCÊ E SEU PATRIMÔNIO!" (White with Blue Contour) */}
      <g transform="translate(0, 451)">
        <text
          x="250"
          y="0"
          textAnchor="middle"
          fill="#FFBA00"
          stroke="#001838"
          strokeWidth="2.8"
          paintOrder="stroke fill"
          strokeLinejoin="round"
          fontFamily="'Montserrat', 'Arial', sans-serif"
          fontWeight="900"
          fontSize="13.5"
          letterSpacing="2"
        >
          SOLUÇÕES COMPLETAS
        </text>
        <text
          x="250"
          y="15"
          textAnchor="middle"
          fill="#FFFFFF"
          stroke="#001838"
          strokeWidth="2.4"
          paintOrder="stroke fill"
          strokeLinejoin="round"
          fontFamily="'Montserrat', 'Arial', sans-serif"
          fontWeight="800"
          fontSize="10"
          letterSpacing="1.2"
        >
          PARA VOCÊ E SEU PATRIMÔNIO!
        </text>
      </g>
    </svg>
  );

  // Horizontal Logo for Navbar/Header lockup
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex-shrink-0 drop-shadow-md transition-transform duration-200 hover:scale-105">
          {renderBadgeSVG(dim, dim)}
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className="font-black text-2xl tracking-tighter text-white drop-shadow-sm font-sans">
              SM
            </span>
            <span className="font-black text-2xl tracking-tight text-amber-400 italic drop-shadow-sm font-sans">
              EXPRESS
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="h-[1.5px] w-3 bg-amber-400 rounded-full" />
            <span className="text-[11px] tracking-widest text-slate-200 font-bold uppercase whitespace-nowrap">
              SERVIÇOS GERAIS
            </span>
            <span className="h-[1.5px] w-3 bg-amber-400 rounded-full" />
          </div>
          {showTagline && (
            <span className="text-[9.5px] text-amber-300/90 font-medium tracking-wide mt-0.5 hidden sm:inline">
              Qualidade • Confiança • Segurança
            </span>
          )}
        </div>
      </div>
    );
  }

  // Compact Badge for quick lists or pills
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {renderBadgeSVG(dim, dim)}
        <div className="leading-tight">
          <div className="font-black text-sm text-[#001838]">
            SM <span className="text-amber-500 italic">EXPRESS</span>
          </div>
          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
            Serviços Gerais
          </div>
        </div>
      </div>
    );
  }

  // Icon only
  if (variant === 'icon') {
    return renderBadgeSVG(dim, dim);
  }

  // Full Badge (Default)
  return renderBadgeSVG(dim, dim);
};
