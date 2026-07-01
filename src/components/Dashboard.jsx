import React, { useState, useRef, useEffect } from 'react';
import { Search, BookOpen, Star, Pin, Heart, Radio, Play, Pause } from 'lucide-react';

export default function Dashboard({
  surahs,
  activeSurah,
  activeReciter,
  onSelectSurah,
  pinnedSurahs = [],
  onTogglePinSurah,
  favorites = [],
  setTab,
  onPlayRadio
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const radioRef = useRef(null);

  useEffect(() => {
    radioRef.current = new Audio('https://n06.radiojar.com/8s5u5tpdtwzuv');
    return () => {
      radioRef.current.pause();
      radioRef.current = null;
    };
  }, []);

  const handleToggleRadio = () => {
    if (isRadioPlaying) {
      radioRef.current.pause();
      setIsRadioPlaying(false);
    } else {
      if (onPlayRadio) onPlayRadio();
      radioRef.current.play().catch(e => console.log('Radio play error', e));
      setIsRadioPlaying(true);
    }
  };

  const filteredSurahs = surahs.filter((surah) => {
    const matchesSearch =
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.name.includes(searchQuery) ||
      surah.number.toString() === searchQuery;
    if (!matchesSearch) return false;
    if (filterType === 'meccan') return surah.revelationType === 'Meccan';
    if (filterType === 'medinan') return surah.revelationType === 'Medinan';
    if (filterType === 'favorites') return favorites.includes(surah.number);
    return true;
  });

  const pinned = filteredSurahs.filter(s => pinnedSurahs.includes(s.number));
  const unpinned = filteredSurahs.filter(s => !pinnedSurahs.includes(s.number));
  const ordered = [...pinned, ...unpinned];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Radio Widget */}
      <div style={{ background: 'linear-gradient(135deg, var(--sage-glow), rgba(123, 181, 149, 0.05))', borderRadius: '14px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--sage)', color: 'white', padding: '0.8rem', borderRadius: '50%', display: 'flex' }}>
            <Radio size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sage-dark)', marginBottom: '0.2rem' }}>إذاعة القرآن الكريم</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>بث مباشر من القاهرة طوال اليوم</p>
          </div>
        </div>
        <button 
          onClick={handleToggleRadio}
          style={{ background: isRadioPlaying ? 'transparent' : 'var(--sage-dark)', color: isRadioPlaying ? 'var(--sage-dark)' : 'white', border: isRadioPlaying ? '2px solid var(--sage-dark)' : 'none', padding: '0.75rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', transition: 'var(--ease)' }}
        >
          {isRadioPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '-2px' }} />}
        </button>
      </div>

      <div className="dashboard-header">
        <div className="welcome-title">
          <h1>فهرس السور الشريفة</h1>
          <p>بصوت الشيخ {activeReciter.name}</p>
        </div>
        <div className="search-bar-container">
          <input
            type="text"
            className="search-input"
            placeholder="ابحث باسم السورة أو رقمها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={16} className="search-icon" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'الكل' },
          { key: 'meccan', label: 'مكية' },
          { key: 'medinan', label: 'مدنية' },
          { key: 'favorites', label: `المفضلة (${favorites.length})` }
        ].map((t) => (
          <button
            key={t.key}
            className={`option-btn ${filterType === t.key ? 'active' : ''}`}
            onClick={() => setFilterType(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {ordered.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={40} strokeWidth={1.5} />
          <h3>لا توجد نتائج مطابقة</h3>
          <p>جرب البحث بطريقة أخرى أو غير التصفية.</p>
        </div>
      ) : (
        <div className="surah-grid">
          {ordered.map((surah) => {
            const isPlayingNow = activeSurah && activeSurah.number === surah.number;
            const isFav = favorites.includes(surah.number);
            const isPinnedSurah = pinnedSurahs.includes(surah.number);
            return (
              <div
                key={surah.number}
                className={`surah-card ${isPlayingNow ? 'active' : ''} ${isPinnedSurah ? 'pinned' : ''}`}
                onClick={() => {
                  onSelectSurah(surah.number);
                  setTab('player');
                }}
              >
                <div className="surah-meta">
                  <span className="surah-number">{surah.number}</span>
                  <div className="surah-info">
                    <span className="surah-title-en">{surah.englishName}</span>
                    <span className="surah-details">
                      {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} &middot; {surah.numberOfAyahs} آية
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="surah-title-ar">{surah.name.replace('سُورَةُ ', '')}</span>
                  <button
                    className={`pin-btn-sm ${isPinnedSurah ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePinSurah(surah.number);
                    }}
                    title={isPinnedSurah ? 'إلغاء التثبيت' : 'تثبيت فوق'}
                  >
                    <Pin size={12} />
                  </button>
                  {isFav && <Star size={12} fill="var(--accent-sage)" color="var(--accent-sage)" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
