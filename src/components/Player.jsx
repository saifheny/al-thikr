import React, { useState, useRef, useMemo } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, Download, Repeat,
  ChevronUp, ChevronDown, Volume2, BookOpen, Languages,
  Heart, BookmarkCheck, Type, X, Sparkles
} from 'lucide-react';

// Pre-computed static wavy path — the wave never moves, only the knob & fill moves
function WavyProgress({ progressPct, duration, currentTime, onSeek }) {
  const containerRef = useRef(null);
  const W = 280; // SVG internal width
  const H = 28;
  const amplitude = 4;
  const frequency = 0.055;

  // Build a static wave path once
  const wavePath = useMemo(() => {
    let d = `M0,${H / 2}`;
    for (let x = 0; x <= W; x += 2) {
      const y = H / 2 + Math.sin(x * frequency) * amplitude;
      d += ` L${x},${y}`;
    }
    return d;
  }, []);

  // Compute knob position along the wave
  const fillWidth = (progressPct / 100) * W;
  const knobY = H / 2 + Math.sin(fillWidth * frequency) * amplitude;

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleClick = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  };

  return (
    <div className="progress-section">
      <div ref={containerRef} className="wavy-progress-container" onClick={handleClick}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={H}>
          <defs>
            <clipPath id="waveClip">
              <rect x="0" y="0" width={fillWidth} height={H} />
            </clipPath>
          </defs>
          {/* Background track */}
          <path d={wavePath} stroke="var(--progress-track)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* Filled portion */}
          <path d={wavePath} stroke="var(--accent-sage)" strokeWidth="3.5" fill="none"
            strokeLinecap="round" clipPath="url(#waveClip)" />
          {/* Knob — only this moves */}
          {fillWidth > 2 && (
            <circle cx={fillWidth} cy={knobY} r="5.5" fill="var(--accent-sage-dark)" />
          )}
        </svg>
      </div>
      <div className="progress-time-labels">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

const MushafIllustration = ({ size, isPlaying }) => (
  <div className="mushaf-illustration-wrapper" style={{ width: size, height: size, position: 'relative' }}>
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '70%', height: '70%', transition: 'transform 0.4s ease' }} className={isPlaying ? 'pulse-mushaf' : ''}>
      {/* Book spine */}
      <rect x="37" y="10" width="6" height="58" rx="2" fill="var(--accent-sage-dark)" opacity="0.6" />
      {/* Left page */}
      <path d="M37 12 C37 12 18 14 14 18 L14 62 C18 58 37 60 37 60 Z" fill="var(--accent-sage-light)" stroke="var(--accent-sage-dark)" strokeWidth="1.5" />
      {/* Right page */}
      <path d="M43 12 C43 12 62 14 66 18 L66 62 C62 58 43 60 43 60 Z" fill="var(--accent-sage-light)" stroke="var(--accent-sage-dark)" strokeWidth="1.5" />
      {/* Text lines — left */}
      <line x1="19" y1="25" x2="34" y2="23" stroke="var(--accent-sage)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="19" y1="31" x2="34" y2="29" stroke="var(--accent-sage)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="19" y1="37" x2="34" y2="35" stroke="var(--accent-sage)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="19" y1="43" x2="34" y2="41" stroke="var(--accent-sage)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="19" y1="49" x2="34" y2="47" stroke="var(--accent-sage)" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      {/* Text lines — right */}
      <line x1="46" y1="23" x2="61" y2="25" stroke="var(--accent-sage)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="46" y1="29" x2="61" y2="31" stroke="var(--accent-sage)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="46" y1="35" x2="61" y2="37" stroke="var(--accent-sage)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="46" y1="41" x2="61" y2="43" stroke="var(--accent-sage)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="46" y1="47" x2="61" y2="49" stroke="var(--accent-sage)" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
    {/* Animated visualizer spectrum overlay */}
    <div className={`audio-visualizer ${isPlaying ? 'playing' : ''}`}>
      <span className="vis-bar"></span>
      <span className="vis-bar"></span>
      <span className="vis-bar"></span>
      <span className="vis-bar"></span>
      <span className="vis-bar"></span>
      <span className="vis-bar"></span>
      <span className="vis-bar"></span>
    </div>
  </div>
);

export default function Player({
  activeSurah, activeReciter, isPlaying, currentTime, duration,
  speed, activeAyahIndex, onPlayPause, onNext, onPrev, onSpeedChange,
  onSeek, isLoopSurah, isLoopAyah, onToggleLoopSurah, onToggleLoopAyah,
  onDownload, sheetOpen, setSheetOpen, showTranslation, setShowTranslation,
  isMobile, isFavorite, onToggleFavorite, isMemorized, onToggleMemorized, onAyahClick,
  downloadProgress, isCached, onClose, onOpenTafsir
}) {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [fontSize, setFontSize] = useState(1.55);
  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  if (!activeSurah) {
    return (
      <div className={isMobile ? 'mobile-player-view' : 'desktop-player-widget empty'}>
        <div className="empty-state">
          <BookOpen size={48} strokeWidth={1.5} />
          <h3>اختر سورة للبدء</h3>
          <p>تصفح الفهرس واختر السورة والشيخ المفضل لديك.</p>
        </div>
      </div>
    );
  }

  const Controls = ({ compact }) => {
    const isDownloading = downloadProgress && downloadProgress.surahNum === activeSurah.number;
    const downloadPercent = isDownloading 
      ? Math.round((downloadProgress.current / downloadProgress.total) * 100)
      : 0;

    return (
      <div className="controls-wrapper">
        <WavyProgress
          progressPct={progressPct}
          duration={duration}
          currentTime={currentTime}
          onSeek={onSeek}
        />
        <div className={compact ? 'compact-controls' : 'player-controls'}>
          {isDownloading ? (
            <button className="ctrl-btn downloading" title={`جاري التحميل... ${downloadPercent}%`} disabled style={{ position: 'relative', color: 'var(--sage)' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 'bold' }}>
                {downloadPercent}%
              </span>
            </button>
          ) : isCached ? (
            <button className="ctrl-btn cached" onClick={onDownload} title="تم التحميل للاستماع دون اتصال. اضغط لإعادة التحميل" style={{ color: 'var(--sage)' }}>
              <BookmarkCheck size={22} className="glow-icon" />
            </button>
          ) : (
            <button className="ctrl-btn" onClick={onDownload} title="تحميل للاستماع دون اتصال">
              <Download size={22} />
            </button>
          )}
          
          <button className="ctrl-btn" onClick={onPrev}>
            <SkipBack size={compact ? 26 : 26} fill="currentColor" />
          </button>
          
          <button className="ctrl-btn play-btn" onClick={onPlayPause}
            style={{ width: compact ? 60 : 58, height: compact ? 60 : 58 }}>
            {isPlaying
              ? <Pause size={26} fill="currentColor" />
              : <Play size={26} fill="currentColor" style={{ marginLeft: 2 }} />}
          </button>
          
          <button className="ctrl-btn" onClick={onNext}>
            <SkipForward size={compact ? 26 : 26} fill="currentColor" />
          </button>
          
          <div style={{ position: 'relative' }}>
            <button className={`ctrl-btn ${(isLoopSurah || isLoopAyah) ? 'active' : ''}`}
              onClick={() => setShowSpeedMenu(s => !s)}>
              <Repeat size={22} />
            </button>
            {showSpeedMenu && (
              <div className="speed-dropdown">
                <button className={`option-btn ${isLoopAyah ? 'active' : ''}`}
                  onClick={() => { onToggleLoopAyah(); setShowSpeedMenu(false); }}
                  style={{ width: '100%', justifyContent: 'flex-start', border: 'none', gap: '0.4rem' }}>
                  <Repeat size={13} /> تكرار الآية
                </button>
                <button className={`option-btn ${isLoopSurah ? 'active' : ''}`}
                  onClick={() => { onToggleLoopSurah(); setShowSpeedMenu(false); }}
                  style={{ width: '100%', justifyContent: 'flex-start', border: 'none', gap: '0.4rem' }}>
                  <Repeat size={13} /> تكرار السورة
                </button>
                <div style={{ borderTop: '1px solid var(--border)', margin: '0.2rem 0' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.2rem' }}>
                  {[0.75, 1, 1.5].map(s => (
                    <button key={s} className={`option-btn ${speed === s ? 'active' : ''}`}
                      onClick={() => { onSpeedChange(s); setShowSpeedMenu(false); }}
                      style={{ padding: '0.25rem', fontSize: '0.72rem', border: 'none', justifyContent: 'center' }}>
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderVerses = (fs) => (
    <div className="verses-container">
      {activeSurah.number !== 1 && activeSurah.number !== 9 && (
        <div className="bismillah-container" style={{ fontSize: `${(fs || fontSize) * 0.85}rem` }}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
      )}
      <div className="mushaf-flow-container" style={{ fontSize: `${fs || fontSize}rem` }}>
        {activeSurah.ayahs.map((ayah, i) => {
          const active = i === activeAyahIndex;
          let text = ayah.text;
          if (i === 0 && activeSurah.number !== 1 && text.startsWith('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')) {
            text = text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '').trim();
          }
          return (
            <React.Fragment key={ayah.number}>
              <span id={`ayah-${i}`} className={`mushaf-ayah ${active ? 'active' : ''}`} onClick={() => onAyahClick(i)}>
                {text} <span className="ayah-end">﴿{ayah.numberInSurah}﴾</span>
              </span>
              {active && (
                <span className="mushaf-translation-row" style={{ fontSize: `${(fs || fontSize) * 0.48}rem` }}>
                  {showTranslation && <span>{ayah.translation}</span>}
                  <button 
                    onClick={(e) => { e.stopPropagation(); if (onOpenTafsir) onOpenTafsir(ayah); }}
                    style={{ background: 'var(--sage-glow)', color: 'var(--sage-dark)', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font)' }}
                  >
                    <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} /> التفسير
                  </button>
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="mobile-player-view">
        <div className="mobile-player-compact">
          {/* Mobile Header with Close Button */}
          <div className="mobile-player-header">
            <button className="mobile-close-btn" onClick={onClose} title="إغلاق المشغل">
              <X size={18} />
            </button>
            <span className="mobile-player-status">المشغل الحالي</span>
          </div>

          {/* Surah info */}
          <div className="mobile-surah-info">
            <h2 className="mobile-surah-arabic">{activeSurah.name.replace('سُورَةُ ', '')}</h2>
            <span className="mobile-surah-english">{activeSurah.englishName} · سورة {activeSurah.number}</span>
          </div>

          {/* Mushaf Illustration */}
          <MushafIllustration size={180} isPlaying={isPlaying} />

          {/* Reciter */}
          <div className="mobile-reciter-chip">{activeReciter.name}</div>

          {/* Controls */}
          <Controls compact={true} />          {/* Action pills */}
          <div className="mobile-actions-row">
            <button className={`action-pill ${showTranslation ? 'active' : ''}`} onClick={() => setShowTranslation(v => !v)}>
              <Languages size={16} /> ترجمة
            </button>
            <button className={`action-pill ${isFavorite ? 'active' : ''}`} onClick={onToggleFavorite}>
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} /> مفضلة
            </button>
            <button className={`action-pill ${isMemorized ? 'active' : ''}`} onClick={onToggleMemorized}>
              <BookmarkCheck size={16} /> {isMemorized ? 'محفوظة' : 'حفظ'}
            </button>
          </div>

          {/* Swipe hint — pinned above bottom nav */}
          <button className="swipe-hint-btn" onClick={() => setSheetOpen(true)}>
            <ChevronUp size={20} className="bounce-icon" />
            <span>المصحف</span>
          </button>
        </div>

        {/* Expanded Reader (Mobile sliding sheet) */}
        <div className={`mobile-reader-expanded ${sheetOpen ? 'open' : ''}`}>
          <div className="mobile-reader-topbar">
            <button className="circle-btn" onClick={() => setSheetOpen(false)}>
              <ChevronDown size={22} />
            </button>
            <span className="reader-surah-title">{activeSurah.name}</span>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button className="circle-btn-sm" onClick={() => setFontSize(p => Math.max(1.1, p - 0.1))}>A-</button>
              <button className="circle-btn-sm" onClick={() => setFontSize(p => Math.min(2.5, p + 0.1))}>A+</button>
              <button className={`circle-btn-sm ${showTranslation ? 'active' : ''}`} onClick={() => setShowTranslation(v => !v)}>EN</button>
            </div>
          </div>
          <div className="mobile-reader-scroll">{renderVerses(fontSize)}</div>
          <div className="mobile-reader-footer">
            <Controls compact={true} />
          </div>
        </div>
      </div>
    );
  }

  /* ── DESKTOP WIDGET ── */
  return (
    <div className="desktop-player-widget">
      <div className="player-widget-header">
        <button className="widget-close-btn" onClick={onClose} title="إيقاف التلاوة وإغلاق المشغل">
          <X size={18} />
        </button>
        <span className="widget-status-text">تلاوة نشطة</span>
      </div>
      
      <MushafIllustration size={150} isPlaying={isPlaying} />
      
      <div className="widget-surah-info">
        <h2 className="widget-surah-title">
          {activeSurah.name.replace('سُورَةُ ', '')}
        </h2>
        <span className="widget-surah-details">
          {activeSurah.englishName} · سورة {activeSurah.number}
        </span>
        <div className="widget-reciter-name">{activeReciter.name}</div>
      </div>
      
      <Controls compact={false} />
      
      <div className="widget-actions-row">
        <button className={`action-pill ${showTranslation ? 'active' : ''}`} onClick={() => setShowTranslation(v => !v)}>
          <Languages size={15} /> ترجمة
        </button>
        <button className={`action-pill ${isFavorite ? 'active' : ''}`} onClick={onToggleFavorite}>
          <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} /> مفضلة
        </button>
        <button className={`action-pill ${isMemorized ? 'active' : ''}`} onClick={onToggleMemorized}>
          <BookmarkCheck size={15} /> {isMemorized ? 'محفوظة' : 'حفظ'}
        </button>
      </div>
    </div>
  );
}
