import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, BookmarkCheck, Heart, Sparkles, Languages, Type } from 'lucide-react';

export default function Reader({
  activeSurah,
  activeAyahIndex,
  onAyahClick,
  showTranslation,
  setShowTranslation,
  isFavorite,
  onToggleFavorite,
  isMemorized,
  onToggleMemorized,
  onOpenTafsir
}) {
  const [fontSize, setFontSize] = useState(1.85);
  const containerRef = useRef(null);

  useEffect(() => {
    if (activeAyahIndex !== null && containerRef.current) {
      const activeElement = document.getElementById(`ayah-desktop-${activeAyahIndex}`);
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [activeAyahIndex]);

  if (!activeSurah) {
    return (
      <div className="reader-pane" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="empty-state">
          <BookOpen size={56} strokeWidth={1.2} style={{ color: 'var(--accent-sage)' }} />
          <h2>تصفح مصحف الذكر الحكيم</h2>
          <p>اختر سورة لقراءتها والاستماع لتلاوتها العطرة مباشرة.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reader-pane">
      <div className="reader-header">
        <div className="reader-title">
          <h2>{activeSurah.name}</h2>
          <div className="reader-subtitle">
            <span>{activeSurah.englishName}</span>
            <span style={{ margin: '0 0.4rem' }}>•</span>
            <span>{activeSurah.numberOfAyahs} آية</span>
            <span style={{ margin: '0 0.4rem' }}>•</span>
            <span>{activeSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
          </div>
        </div>

        <div className="reader-options">
          <button 
            className="option-btn" 
            onClick={() => setFontSize(prev => Math.max(1.3, prev - 0.1))}
          >
            <Type size={13} /> -
          </button>
          <button 
            className="option-btn" 
            onClick={() => setFontSize(prev => Math.min(2.8, prev + 0.1))}
          >
            <Type size={13} /> +
          </button>

          <button 
            className={`option-btn ${showTranslation ? 'active' : ''}`}
            onClick={() => setShowTranslation(!showTranslation)}
          >
            <Languages size={14} /> 
            <span>الترجمة</span>
          </button>

          <button 
            className={`option-btn ${isFavorite ? 'active' : ''}`}
            onClick={onToggleFavorite}
          >
            <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
            <span>المفضلة</span>
          </button>

          <button 
            className={`option-btn ${isMemorized ? 'active' : ''}`}
            onClick={onToggleMemorized}
          >
            <BookmarkCheck size={14} />
            <span>{isMemorized ? 'تم الحفظ' : 'تعليم كتم الحفظ'}</span>
          </button>
        </div>
      </div>

      <div className="verses-container" ref={containerRef}>
        {activeSurah.number !== 1 && activeSurah.number !== 9 && (
          <div className="bismillah-container">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        )}

        <div className="mushaf-flow-container" style={{ fontSize: `${fontSize}rem` }}>
          {activeSurah.ayahs.map((ayah, index) => {
            const isActive = index === activeAyahIndex;
            let text = ayah.text;
            if (index === 0 && activeSurah.number !== 1 && text.startsWith('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')) {
              text = text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '').trim();
            }

            return (
              <React.Fragment key={ayah.number}>
                <span
                  id={`ayah-desktop-${index}`}
                  className={`mushaf-ayah ${isActive ? 'active' : ''}`}
                  onClick={() => onAyahClick(index)}
                >
                  {text} <span className="ayah-end">﴿{ayah.numberInSurah}﴾</span>
                </span>
                {isActive && (
                  <span className="mushaf-translation-row">
                    {showTranslation && <span>{ayah.translation}</span>}
                    <button 
                      onClick={(e) => { e.stopPropagation(); onOpenTafsir(ayah); }}
                      style={{ background: 'var(--sage-glow)', color: 'var(--sage-dark)', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font)' }}
                    >
                      <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} /> التفسير الميسر
                    </button>
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
