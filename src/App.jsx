import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BookOpen, Compass, Award, Users, Bell, Clock, List, X } from 'lucide-react';
import { fetchSurahList, fetchSurahDetail, RECITERS, checkSurahCached, getCachedAudioUrl, cacheSurahAudio, fetchAyahTafsir } from './services/quranApi';
import RecitersPage from './components/RecitersPage';
import Dashboard from './components/Dashboard';
import Player from './components/Player';
import Reader from './components/Reader';
import StatsTracker from './components/StatsTracker';
import PrayersPage from './components/PrayersPage';

/* ── Mushaf SVG favicon ── */
const MUSHAF_FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#3b5444"/><rect x="14.5" y="5" width="3" height="22" rx="1" fill="#7da28a"/><path d="M14.5 6 C14.5 6 7 7.5 5.5 10 L5.5 24 C7 21.5 14.5 23 14.5 23 Z" fill="#e8f0eb" stroke="#7da28a" stroke-width="0.8"/><path d="M17.5 6 C17.5 6 25 7.5 26.5 10 L26.5 24 C25 21.5 17.5 23 17.5 23 Z" fill="#e8f0eb" stroke="#7da28a" stroke-width="0.8"/><line x1="7.5" y1="13" x2="13" y2="12" stroke="#7da28a" stroke-width="0.9" stroke-linecap="round"/><line x1="7.5" y1="16" x2="13" y2="15" stroke="#7da28a" stroke-width="0.9" stroke-linecap="round"/><line x1="7.5" y1="19" x2="13" y2="18" stroke="#7da28a" stroke-width="0.9" stroke-linecap="round"/><line x1="19" y1="12" x2="24.5" y2="13" stroke="#7da28a" stroke-width="0.9" stroke-linecap="round"/><line x1="19" y1="15" x2="24.5" y2="16" stroke="#7da28a" stroke-width="0.9" stroke-linecap="round"/><line x1="19" y1="18" x2="24.5" y2="19" stroke="#7da28a" stroke-width="0.9" stroke-linecap="round"/></svg>`;

export default function App() {
  const [tab, setTab] = useState('reciters');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [surahs, setSurahs] = useState([]);
  const [activeSurahNum, setActiveSurahNum] = useState(null);
  const [activeSurah, setActiveSurah] = useState(null);
  const [activeReciter, setActiveReciter] = useState(RECITERS[0]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [activeAyahIndex, setActiveAyahIndex] = useState(0);
  const [isLoopSurah, setIsLoopSurah] = useState(false);
  const [isLoopAyah, setIsLoopAyah] = useState(false);

  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites') || '[]'));
  const [memorized, setMemorized] = useState(() => JSON.parse(localStorage.getItem('memorized') || '[]'));
  const [pinnedReciters, setPinnedReciters] = useState(() => JSON.parse(localStorage.getItem('pinnedReciters') || '[]'));
  const [pinnedSurahs, setPinnedSurahs] = useState(() => JSON.parse(localStorage.getItem('pinnedSurahs') || '[]'));

  const [downloadProgress, setDownloadProgress] = useState(null);
  const [cachedSurahNums, setCachedSurahNums] = useState(() => JSON.parse(localStorage.getItem('cachedSurahs') || '[]'));

  const [tafsirData, setTafsirData] = useState(null); // null means closed, otherwise { ayah, text, loading }

  const audioRef = useRef(new Audio());
  const notifTimer = useRef(null);

  // Set Mushaf favicon
  useEffect(() => {
    const svg = encodeURIComponent(MUSHAF_FAVICON);
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = `data:image/svg+xml,${svg}`;
    document.head.appendChild(link);
    document.title = 'الذكر الحكيم';
  }, []);

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showNotification = useCallback((msg) => {
    setNotification(msg);
    if (notifTimer.current) clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotification(''), 3000);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchSurahList();
        setSurahs(data);
      } catch {
        showNotification('حصلت مشكلة وإحنا بنحمل قائمة السور');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = (key, val) => localStorage.setItem(key, JSON.stringify(val));

  const handleToggleFavorite = (num) => {
    if (!num) return;
    setFavorites(prev => {
      const next = prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num];
      persist('favorites', next);
      showNotification(prev.includes(num) ? 'أُزيلت من المفضلة' : 'أُضيفت للمفضلة');
      return next;
    });
  };

  const handleToggleMemorized = (num) => {
    if (!num) return;
    setMemorized(prev => {
      const next = prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num];
      persist('memorized', next);
      showNotification(prev.includes(num) ? 'أُزيلت من المحفوظات' : 'تم تسجيلها محفوظة ✓');
      return next;
    });
  };

  const handleTogglePinReciter = (id) => {
    setPinnedReciters(prev => { const next = prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]; persist('pinnedReciters', next); return next; });
  };

  const handleTogglePinSurah = (num) => {
    setPinnedSurahs(prev => { const next = prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]; persist('pinnedSurahs', next); return next; });
  };

  const handleSelectSurah = async (surahNumber) => {
    try {
      setLoading(true);
      setActiveSurahNum(surahNumber);
      const detail = await fetchSurahDetail(surahNumber, activeReciter.id);
      setActiveSurah(detail);
      setActiveAyahIndex(0);
      setIsPlaying(false);
      setCurrentTime(0);
      setSheetOpen(false);
    } catch {
      showNotification('في مشكلة في تحميل تفاصيل السورة');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReciter = (reciter) => {
    setActiveReciter(reciter);
    showNotification(`تم اختيار: ${reciter.name}`);
    setTab('dashboard');
  };

  const handlePlayPause = () => setIsPlaying(prev => !prev);

  const handleNext = useCallback(() => {
    if (!activeSurah) return;
    if (activeAyahIndex < activeSurah.ayahs.length - 1) {
      setActiveAyahIndex(prev => prev + 1);
    } else if (isLoopSurah) {
      setActiveAyahIndex(0);
    } else {
      const next = activeSurah.number + 1;
      if (next <= 114) handleSelectSurah(next);
      else showNotification('وصلت إلى نهاية المصحف الشريف');
    }
  }, [activeSurah, activeAyahIndex, isLoopSurah]);

  const handlePrev = () => {
    if (!activeSurah) return;
    if (activeAyahIndex > 0) setActiveAyahIndex(prev => prev - 1);
    else { const prev = activeSurah.number - 1; if (prev >= 1) handleSelectSurah(prev); }
  };

  const handleSpeedChange = (s) => { setSpeed(s); audioRef.current.playbackRate = s; showNotification(`سرعة التلاوة: ${s}x`); };
  const handleSeek = (t) => { audioRef.current.currentTime = t; setCurrentTime(t); };
  const handleToggleLoopSurah = () => { setIsLoopSurah(p => !p); if (!isLoopSurah) setIsLoopAyah(false); showNotification(!isLoopSurah ? 'تكرار السورة فعّال' : 'إلغاء تكرار السورة'); };
  const handleToggleLoopAyah = () => { setIsLoopAyah(p => !p); if (!isLoopAyah) setIsLoopSurah(false); showNotification(!isLoopAyah ? 'تكرار الآية فعّال' : 'إلغاء تكرار الآية'); };
  const handleAyahClick = (index) => { setActiveAyahIndex(index); setIsPlaying(true); };
  
  const handleClosePlayer = () => {
    setIsPlaying(false);
    audioRef.current.pause();
    setActiveSurah(null);
    setActiveSurahNum(null);
    setCurrentTime(0);
    setDuration(0);
    setSheetOpen(false);
  };

  const handleDownload = async () => {
    if (!activeSurah) return;
    try {
      showNotification(`جاري تحميل سورة ${activeSurah.name.replace('سُورَةُ ', '')} للاستماع دون اتصال...`);
      setDownloadProgress({ current: 0, total: activeSurah.ayahs.length, surahNum: activeSurah.number });
      
      await cacheSurahAudio(activeSurah.ayahs, (current, total) => {
        setDownloadProgress({ current, total, surahNum: activeSurah.number });
      });

      // Save to list of cached surahs
      setCachedSurahNums(prev => {
        const next = prev.includes(activeSurah.number) ? prev : [...prev, activeSurah.number];
        localStorage.setItem('cachedSurahs', JSON.stringify(next));
        return next;
      });

      setDownloadProgress(null);
      showNotification(`✓ تم حفظ سورة ${activeSurah.name.replace('سُورَةُ ', '')} بنجاح! يمكنك الآن تشغيلها دون اتصال بالإنترنت.`);
    } catch (e) {
      setDownloadProgress(null);
      showNotification('معلش، السورة منزلتش. ياريت تتأكد من النت عندك.');
    }
  };

  const handleOpenTafsir = async (ayah) => {
    setTafsirData({ ayah, text: '', loading: true });
    try {
      const text = await fetchAyahTafsir(ayah.number);
      setTafsirData({ ayah, text, loading: false });
    } catch {
      setTafsirData({ ayah, text: 'معلش مقدرناش نحمل التفسير، اتأكد من النت بتاعك.', loading: false });
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onDur = () => setDuration(audio.duration || 0);
    const onEnd = () => { if (isLoopAyah) { audio.currentTime = 0; audio.play().catch(() => {}); } else handleNext(); };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('durationchange', onDur);
    audio.addEventListener('ended', onEnd);
    return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('durationchange', onDur); audio.removeEventListener('ended', onEnd); };
  }, [activeSurah, activeAyahIndex, isLoopAyah, handleNext]);

  useEffect(() => {
    if (!activeSurah) return;
    const ayah = activeSurah.ayahs[activeAyahIndex];
    if (!ayah?.audio) return;
    
    let active = true;
    (async () => {
      const src = await getCachedAudioUrl(ayah.audio);
      if (!active) return;
      audioRef.current.pause();
      audioRef.current.src = src;
      audioRef.current.load();
      audioRef.current.playbackRate = speed;
      if (isPlaying) audioRef.current.play().catch(() => {});
    })();
    
    return () => {
      active = false;
    };
  }, [activeSurah, activeAyahIndex]);

  useEffect(() => {
    if (isPlaying) { if (audioRef.current.src) audioRef.current.play().catch(() => {}); }
    else audioRef.current.pause();
  }, [isPlaying]);

  // Auto-scroll to active ayah in reader
  useEffect(() => {
    const el = document.getElementById(`ayah-${activeAyahIndex}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeAyahIndex]);

  const navItems = [
    { key: 'reciters', icon: Users, label: 'القراء' },
    { key: 'dashboard', icon: List, label: 'السور' },
    { key: 'player', icon: BookOpen, label: 'المصحف' },
    { key: 'prayers', icon: Clock, label: 'الأذان والقبلة' },
    { key: 'stats', icon: Award, label: 'الإنجازات' },
  ];

  const MushafIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
      <rect x="11" y="2" width="2" height="20" rx="0.5" />
      <path d="M11 3 C11 3 4 4.5 3 7 L3 19 C4 17 11 18.5 11 18.5 Z" />
      <path d="M13 3 C13 3 20 4.5 21 7 L21 19 C20 17 13 18.5 13 18.5 Z" />
    </svg>
  );

  return (
    <div className="app-container">

      {/* Desktop Sidebar */}
      {!isMobile && (
        <nav className="sidebar">
          <div>
            <div className="logo-section">
              <div className="logo-icon"><MushafIcon /></div>
              <span className="logo-text">الذكر الحكيم</span>
            </div>
            <ul className="nav-links">
              {navItems.map(n => (
                <li key={n.key} className={`nav-item ${tab === n.key ? 'active' : ''}`} onClick={() => setTab(n.key)}>
                  <n.icon size={19} />
                  <span>{n.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="sidebar-bottom-actions" style={{ padding: '1rem 0', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
            <span>تابع لمؤسسة SA 2026</span>
          </div>
        </nav>
      )}

      {/* Main content */}
      <main className="main-content">
        {loading && <div className="loading-bar"><span className="spinner" /> جاري التحميل...</div>}
        {notification && <div className="notification"><Bell size={13} /><span>{notification}</span></div>}

        {tab === 'reciters' && (
          <RecitersPage reciters={RECITERS} pinnedReciters={pinnedReciters} onTogglePin={handleTogglePinReciter} onSelectReciter={handleSelectReciter} />
        )}

        {tab === 'dashboard' && (
          <Dashboard surahs={surahs} activeSurah={activeSurah} activeReciter={activeReciter} onSelectSurah={handleSelectSurah} pinnedSurahs={pinnedSurahs} onTogglePinSurah={handleTogglePinSurah} favorites={favorites} setTab={setTab} onPlayRadio={() => { if(isPlaying) handlePlayPause(); }} />
        )}

        {tab === 'player' && (
          <div className="quran-workspace">
            <div className="player-pane">
              <Player
                activeSurah={activeSurah} activeReciter={activeReciter} isPlaying={isPlaying}
                currentTime={currentTime} duration={duration} speed={speed} activeAyahIndex={activeAyahIndex}
                onPlayPause={handlePlayPause} onNext={handleNext} onPrev={handlePrev}
                onSpeedChange={handleSpeedChange} onSeek={handleSeek}
                isLoopSurah={isLoopSurah} isLoopAyah={isLoopAyah}
                onToggleLoopSurah={handleToggleLoopSurah} onToggleLoopAyah={handleToggleLoopAyah}
                onDownload={handleDownload} sheetOpen={sheetOpen} setSheetOpen={setSheetOpen}
                showTranslation={showTranslation} setShowTranslation={setShowTranslation} isMobile={isMobile}
                isFavorite={activeSurahNum ? favorites.includes(activeSurahNum) : false}
                onToggleFavorite={() => handleToggleFavorite(activeSurahNum)}
                isMemorized={activeSurahNum ? memorized.includes(activeSurahNum) : false}
                onToggleMemorized={() => handleToggleMemorized(activeSurahNum)}
                onAyahClick={handleAyahClick}
                downloadProgress={downloadProgress}
                isCached={activeSurahNum ? cachedSurahNums.includes(activeSurahNum) : false}
                onClose={handleClosePlayer}
                onOpenTafsir={handleOpenTafsir}
              />
            </div>
            {!isMobile && (
              <Reader
                activeSurah={activeSurah} activeAyahIndex={activeAyahIndex} onAyahClick={handleAyahClick}
                showTranslation={showTranslation} setShowTranslation={setShowTranslation}
                isFavorite={activeSurahNum ? favorites.includes(activeSurahNum) : false}
                onToggleFavorite={() => handleToggleFavorite(activeSurahNum)}
                isMemorized={activeSurahNum ? memorized.includes(activeSurahNum) : false}
                onToggleMemorized={() => handleToggleMemorized(activeSurahNum)}
                onOpenTafsir={handleOpenTafsir}
              />
            )}
          </div>
        )}

        {tab === 'prayers' && (
          <PrayersPage showNotification={showNotification} />
        )}

        {tab === 'stats' && (
          <StatsTracker surahs={surahs} favorites={favorites} memorized={memorized} onToggleMemorized={handleToggleMemorized} onSelectSurah={handleSelectSurah} setTab={setTab} />
        )}
      </main>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <nav className="mobile-bottom-nav">
          {navItems.map(n => {
            const active = tab === n.key;
            return (
              <button key={n.key} className={`mob-nav-btn ${active ? 'active' : ''}`} onClick={() => setTab(n.key)} title={n.label}>
                <div className={`mob-nav-bubble ${active ? 'active' : ''}`}>
                  <n.icon size={20} />
                </div>
              </button>
            );
          })}
        </nav>
      )}

      {/* Tafsir Modal */}
      {tafsirData && (
        <div className="tafsir-overlay" onClick={() => setTafsirData(null)}>
          <div className="tafsir-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tafsir-modal-header">
              <h3>التفسير الميسر</h3>
              <button className="tafsir-close-btn" onClick={() => setTafsirData(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="tafsir-ayah-box">
              <p style={{ fontFamily: 'var(--font-ar)', fontSize: '1.2rem', lineHeight: 2.2, color: 'var(--sage-dark)', fontWeight: 600 }}>
                {tafsirData.ayah.text}
              </p>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'var(--font-en)' }}>
                الآية {tafsirData.ayah.numberInSurah}
              </span>
            </div>
            <div className="tafsir-content">
              {tafsirData.loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                  <span className="spinner" /> جاري تحميل التفسير...
                </div>
              ) : (
                <p style={{ lineHeight: 2, fontSize: '1.05rem', color: 'var(--text)' }}>
                  {tafsirData.text}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
