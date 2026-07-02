import React from 'react';

export function SvgAvatar({ config, size = 52, name = '' }) {
  const { bg, skin, beard, turbanColor, turbanType } = config;
  const r = size / 2;
  const s = size; 

  const renderTurban = () => {
    switch (turbanType) {
      case 'imama': 
        return (
          <>
            <ellipse cx={r} cy={r * 0.52} rx={r * 0.6} ry={r * 0.35} fill={turbanColor} />
            <path d={`M${r * 0.4} ${r * 0.38} Q${r} ${r * 0.1} ${r * 1.6} ${r * 0.42}`}
              fill="none" stroke={turbanColor} strokeWidth={r * 0.12} strokeLinecap="round" />
            <path d={`M${r * 0.35} ${r * 0.52} Q${r} ${r * 0.22} ${r * 1.65} ${r * 0.54}`}
              fill="none" stroke={turbanColor} strokeWidth={r * 0.1} strokeLinecap="round" opacity="0.7" />
          </>
        );
      case 'kufi': 
        return (
          <ellipse cx={r} cy={r * 0.46} rx={r * 0.55} ry={r * 0.28} fill={turbanColor} />
        );
      case 'ghutra': 
        return (
          <>
            <path d={`M${r * 0.38} ${r * 0.52} L${r * 0.3} ${r * 0.75} Q${r * 0.25} ${r * 0.9} ${r * 0.38} ${r * 0.95} L${r * 1.1} ${r * 0.95} L${r * 1.1} ${r * 0.52} Z`}
              fill={turbanColor} opacity="0.9" />
            <ellipse cx={r} cy={r * 0.46} rx={r * 0.55} ry={r * 0.26} fill={turbanColor} />
            <ellipse cx={r} cy={r * 0.52} rx={r * 0.58} ry={r * 0.1} fill="#1a1a1a" />
          </>
        );
      case 'shemagh_rw': 
        return (
          <>
            <path d={`M${r * 0.35} ${r * 0.52} L${r * 0.28} ${r * 0.8} Q${r * 0.22} ${r * 0.96} ${r * 0.4} ${r * 0.98} L${r * 1.15} ${r * 0.98} L${r * 1.15} ${r * 0.52} Z`}
              fill="#cc0000" opacity="0.85" />
            <path d={`M${r * 0.35} ${r * 0.52} L${r * 0.28} ${r * 0.8} Q${r * 0.22} ${r * 0.96} ${r * 0.4} ${r * 0.98} L${r * 1.15} ${r * 0.98} L${r * 1.15} ${r * 0.52} Z`}
              fill="url(#shemagh)" />
            <defs>
              <pattern id={`shemagh-${name}`} x="0" y="0" width={r * 0.15} height={r * 0.15} patternUnits="userSpaceOnUse">
                <rect width={r * 0.075} height={r * 0.075} fill="#cc0000" />
                <rect x={r * 0.075} y={r * 0.075} width={r * 0.075} height={r * 0.075} fill="#cc0000" />
                <rect x={r * 0.075} width={r * 0.075} height={r * 0.075} fill="#ffffff" opacity="0.3" />
                <rect y={r * 0.075} width={r * 0.075} height={r * 0.075} fill="#ffffff" opacity="0.3" />
              </pattern>
            </defs>
            <ellipse cx={r} cy={r * 0.46} rx={r * 0.55} ry={r * 0.26} fill="#cc0000" />
            <ellipse cx={r} cy={r * 0.46} rx={r * 0.55} ry={r * 0.26} fill="url(#shemagh)" />
            <ellipse cx={r} cy={r * 0.52} rx={r * 0.58} ry={r * 0.09} fill="#1a1a1a" />
          </>
        );
      default:
        return <ellipse cx={r} cy={r * 0.46} rx={r * 0.52} ry={r * 0.24} fill={turbanColor} />;
    }
  };

  const beardLength = turbanType === 'imama' ? 0.72 : 0.75;

  return (
    <svg
      width={s} height={s}
      viewBox={`0 0 ${s} ${s}`}
      style={{ borderRadius: '50%', flexShrink: 0, display: 'block' }}
    >

      <circle cx={r} cy={r} r={r} fill={bg} />

      <circle cx={r * 0.52} cy={r * 0.82} r={r * 0.08} fill={skin} />
      <circle cx={r * 1.48} cy={r * 0.82} r={r * 0.08} fill={skin} />

      <rect x={r * 0.78} y={r * 1.1} width={r * 0.44} height={r * 0.4} rx={r * 0.1} fill={skin} />

      <ellipse cx={r} cy={s * 1.05} rx={r * 0.85} ry={r * 0.4} fill={bg === '#0a1628' ? '#1a2a40' : bg} opacity="0.9" />

      <path d={`M${r * 0.78} ${r * 1.15} L${r} ${r * 1.35} L${r * 1.22} ${r * 1.15} Z`} fill="#ffffff" />
      <path d={`M${r} ${r * 1.15} L${r} ${r * 1.35}`} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" />

      <ellipse cx={r} cy={r * 1.05} rx={r * 0.42} ry={r * 0.28} fill={beard} opacity="0.85" />

      <ellipse cx={r} cy={r * 0.82} rx={r * 0.42} ry={r * 0.45} fill={skin} />

      <ellipse cx={r * 0.72} cy={r * 0.9} rx={r * 0.08} ry={r * 0.04} fill="#e74c3c" opacity="0.12" />
      <ellipse cx={r * 1.28} cy={r * 0.9} rx={r * 0.08} ry={r * 0.04} fill="#e74c3c" opacity="0.12" />

      <path d={`M${r * 0.68} ${r * 0.73} Q${r * 0.8} ${r * 0.7} ${r * 0.9} ${r * 0.74}`} fill="none" stroke={beard === '#cccccc' ? '#999999' : '#1a0a00'} strokeWidth="1.8" strokeLinecap="round" />
      <path d={`M${r * 1.32} ${r * 0.73} Q${r * 1.2} ${r * 0.7} ${r * 1.1} ${r * 0.74}`} fill="none" stroke={beard === '#cccccc' ? '#999999' : '#1a0a00'} strokeWidth="1.8" strokeLinecap="round" />

      <ellipse cx={r * 0.82} cy={r * 0.82} rx={r * 0.07} ry={r * 0.055} fill="#1a0a00" />
      <ellipse cx={r * 1.18} cy={r * 0.82} rx={r * 0.07} ry={r * 0.055} fill="#1a0a00" />

      <circle cx={r * 0.85} cy={r * 0.8} r={r * 0.02} fill="#ffffff" />
      <circle cx={r * 1.21} cy={r * 0.8} r={r * 0.02} fill="#ffffff" />

      {name === 'ar.aymanswoaid' && (
        <>
          <circle cx={r * 0.82} cy={r * 0.82} r={r * 0.12} fill="none" stroke="#2c3e50" strokeWidth="2" />
          <circle cx={r * 1.18} cy={r * 0.82} r={r * 0.12} fill="none" stroke="#2c3e50" strokeWidth="2" />
          <path d={`M${r * 0.94} ${r * 0.82} L${r * 1.06} ${r * 0.82}`} fill="none" stroke="#2c3e50" strokeWidth="2.2" />
          <path d={`M${r * 0.7} ${r * 0.82} L${r * 0.58} ${r * 0.81}`} fill="none" stroke="#2c3e50" strokeWidth="1.5" />
          <path d={`M${r * 1.3} ${r * 0.82} L${r * 1.42} ${r * 0.81}`} fill="none" stroke="#2c3e50" strokeWidth="1.5" />
        </>
      )}

      <path d={`M${r * 0.86} ${r * 0.97} Q${r} ${r * 1.05} ${r * 1.14} ${r * 0.97}`}
        fill="none" stroke={beard} strokeWidth={r * 0.045} strokeLinecap="round" opacity="0.6" />

      <path d={`M${r} ${r * 0.82} L${r} ${r * 0.92} Q${r} ${r * 0.94} ${r * 1.03} ${r * 0.93}`} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" strokeLinecap="round" />

      {renderTurban()}

      <circle cx={r} cy={r} r={r} fill="url(#depthGrad)" />
      <defs>
        <radialGradient id="depthGrad" cx="35%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function ReciterAvatar({ reciter, size = 52 }) {
  if (reciter.avatar) {
    return (
      <img
        src={reciter.avatar}
        alt={reciter.name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: 'linear-gradient(135deg, #eef3f0, #dde8e2)' }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }
  if (reciter.avatarConfig) {
    return <SvgAvatar config={reciter.avatarConfig} size={size} name={reciter.id} />;
  }

  const initials = reciter.name.split(' ').slice(0, 2).map(w => w[0]).join('');
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, #3b5444, #7da28a)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.32,
      fontFamily: 'Cairo, sans-serif', flexShrink: 0
    }}>
      {initials}
    </div>
  );
}
