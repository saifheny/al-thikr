import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BookOpen, Compass, Award, Users, Bell, Clock, List, X } from 'lucide-react';
import { fetchSurahList, fetchSurahDetail, RECITERS, checkSurahCached, getCachedAudioUrl, cacheSurahAudio, fetchAyahTafsir } from './services/quranApi';
import RecitersPage from './components/RecitersPage';
import Dashboard from './components/Dashboard';
import Player from './components/Player';
import Reader from './components/Reader';
import StatsTracker from './components/StatsTracker';
import PrayersPage from './components/PrayersPage';
import HadithPage from './components/HadithPage';
import OnboardingTour from './components/OnboardingTour';


export default function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
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
  const [readHadiths, setReadHadiths] = useState(() => JSON.parse(localStorage.getItem('readHadiths') || '[]'));
  const [pinnedReciters, setPinnedReciters] = useState(() => JSON.parse(localStorage.getItem('pinnedReciters') || '[]'));
  const [pinnedSurahs, setPinnedSurahs] = useState(() => JSON.parse(localStorage.getItem('pinnedSurahs') || '[]'));

  const [downloadProgress, setDownloadProgress] = useState(null);
  const [cachedSurahNums, setCachedSurahNums] = useState(() => JSON.parse(localStorage.getItem('cachedSurahs') || '[]'));

  const [tafsirData, setTafsirData] = useState(null); // null means closed, otherwise { ayah, text, loading }
  const [showTour, setShowTour] = useState(() => !localStorage.getItem('tourCompleted'));

  const audioRef = useRef(new Audio());
  const notifTimer = useRef(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    }
  };

  useEffect(() => {
    document.title = 'Ø§Ù„Ø°ÙƒØ± Ø§Ù„Ø­ÙƒÙŠÙ… - ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„Ù‚Ø±Ø¢Ù† Ø§Ù„ÙƒØ±ÙŠÙ…';
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
        showNotification('Ø­ØµÙ„Øª Ù…Ø´ÙƒÙ„Ø© ÙˆØ¥Ø­Ù†Ø§ Ø¨Ù†Ø­Ù…Ù„ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø³ÙˆØ±');
      } finally {
        setLoading(false);
      }
    })();

    // Request Notification permission automatically on first load
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const persist = (key, val) => localStorage.setItem(key, JSON.stringify(val));

  const handleToggleFavorite = (num) => {
    if (!num) return;
    setFavorites(prev => {
      const next = prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num];
      persist('favorites', next);
      showNotification(prev.includes(num) ? 'Ø£ÙØ²ÙŠÙ„Øª Ù…Ù† Ø§Ù„Ù…ÙØ¶Ù„Ø©' : 'Ø£ÙØ¶ÙŠÙØª Ù„Ù„Ù…ÙØ¶Ù„Ø©');
      return next;
    });
  };

  const handleToggleMemorized = (num) => {
    if (!num) return;
    setMemorized(prev => {
      const next = prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num];
      persist('memorized', next);
      showNotification(prev.includes(num) ? 'Ø£ÙØ²ÙŠÙ„Øª Ù…Ù† Ø§Ù„Ù…Ø­ÙÙˆØ¸Ø§Øª' : 'ØªÙ… ØªØ³Ø¬ÙŠÙ„Ù‡Ø§ Ù…Ø­ÙÙˆØ¸Ø© âœ“');
      return next;
    });
  };

  const handleMarkHadithRead = (num) => {
    if (!num) return;
    setReadHadiths(prev => {
      const next = prev.includes(num) ? prev : [...prev, num];
      persist('readHadiths', next);
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
      showNotification('ÙÙŠ Ù…Ø´ÙƒÙ„Ø© ÙÙŠ ØªØ­Ù…ÙŠÙ„ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø³ÙˆØ±Ø©');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReciter = (reciter) => {
    setActiveReciter(reciter);
    showNotification(`ØªÙ… Ø§Ø®ØªÙŠØ§Ø±: ${reciter.name}`);
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
      else showNotification('ÙˆØµÙ„Øª Ø¥Ù„Ù‰ Ù†Ù‡Ø§ÙŠØ© Ø§Ù„Ù…ØµØ­Ù Ø§Ù„Ø´Ø±ÙŠÙ');
    }
  }, [activeSurah, activeAyahIndex, isLoopSurah]);

  const handlePrev = () => {
    if (!activeSurah) return;
    if (activeAyahIndex > 0) setActiveAyahIndex(prev => prev - 1);
    else { const prev = activeSurah.number - 1; if (prev >= 1) handleSelectSurah(prev); }
  };

  const handleSpeedChange = (s) => { setSpeed(s); audioRef.current.playbackRate = s; showNotification(`Ø³Ø±Ø¹Ø© Ø§Ù„ØªÙ„Ø§ÙˆØ©: ${s}x`); };
  const handleSeek = (t) => { audioRef.current.currentTime = t; setCurrentTime(t); };
  const handleToggleLoopSurah = () => { setIsLoopSurah(p => !p); if (!isLoopSurah) setIsLoopAyah(false); showNotification(!isLoopSurah ? 'ØªÙƒØ±Ø§Ø± Ø§Ù„Ø³ÙˆØ±Ø© ÙØ¹Ù‘Ø§Ù„' : 'Ø¥Ù„ØºØ§Ø¡ ØªÙƒØ±Ø§Ø± Ø§Ù„Ø³ÙˆØ±Ø©'); };
  const handleToggleLoopAyah = () => { setIsLoopAyah(p => !p); if (!isLoopAyah) setIsLoopSurah(false); showNotification(!isLoopAyah ? 'ØªÙƒØ±Ø§Ø± Ø§Ù„Ø¢ÙŠØ© ÙØ¹Ù‘Ø§Ù„' : 'Ø¥Ù„ØºØ§Ø¡ ØªÙƒØ±Ø§Ø± Ø§Ù„Ø¢ÙŠØ©'); };
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
      showNotification(`Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø³ÙˆØ±Ø© ${activeSurah.name.replace('Ø³ÙÙˆØ±ÙŽØ©Ù ', '')} Ù„Ù„Ø§Ø³ØªÙ…Ø§Ø¹ Ø¯ÙˆÙ† Ø§ØªØµØ§Ù„...`);
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
      showNotification(`âœ“ ØªÙ… Ø­ÙØ¸ Ø³ÙˆØ±Ø© ${activeSurah.name.replace('Ø³ÙÙˆØ±ÙŽØ©Ù ', '')} Ø¨Ù†Ø¬Ø§Ø­! ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ø¢Ù† ØªØ´ØºÙŠÙ„Ù‡Ø§ Ø¯ÙˆÙ† Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª.`);
    } catch (e) {
      setDownloadProgress(null);
      showNotification('Ù…Ø¹Ù„Ø´ØŒ Ø§Ù„Ø³ÙˆØ±Ø© Ù…Ù†Ø²Ù„ØªØ´. ÙŠØ§Ø±ÙŠØª ØªØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù„Ù†Øª Ø¹Ù†Ø¯Ùƒ.');
    }
  };

  const handleOpenTafsir = async (ayah) => {
    setTafsirData({ ayah, text: '', loading: true });
    try {
      const text = await fetchAyahTafsir(ayah.number);
      setTafsirData({ ayah, text, loading: false });
    } catch {
      setTafsirData({ ayah, text: 'Ù…Ø¹Ù„Ø´ Ù…Ù‚Ø¯Ø±Ù†Ø§Ø´ Ù†Ø­Ù…Ù„ Ø§Ù„ØªÙØ³ÙŠØ±ØŒ Ø§ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù„Ù†Øª Ø¨ØªØ§Ø¹Ùƒ.', loading: false });
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
    { key: 'reciters', icon: Users, label: 'Ø§Ù„Ù‚Ø±Ø§Ø¡' },
    { key: 'dashboard', icon: List, label: 'Ø§Ù„Ø³ÙˆØ±' },
    { key: 'player', icon: BookOpen, label: 'Ø§Ù„Ù…ØµØ­Ù' },
    { key: 'prayers', icon: Clock, label: 'Ø§Ù„Ø£Ø°Ø§Ù† ÙˆØ§Ù„Ù‚Ø¨Ù„Ø©' },
    { key: 'stats', icon: Award, label: 'Ø§Ù„Ø¥Ù†Ø¬Ø§Ø²Ø§Øª' },
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
      {showTour && (
        <OnboardingTour onComplete={() => {
          setShowTour(false);
          localStorage.setItem('tourCompleted', 'true');
        }} />
      )}

      {showInstallPrompt && (
        <div className="install-prompt-banner">
          <div className="install-prompt-content">
            <img src="/al-thikr/custom-icon.jpg" alt="Icon" className="install-icon" />
            <div className="install-text">
              <h4>Ø§Ù„Ø°ÙƒØ± Ø§Ù„Ø­ÙƒÙŠÙ…</h4>
              <p>Ù‚Ù… Ø¨ØªØ«Ø¨ÙŠØª Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ Ù„Ù„ÙˆØµÙˆÙ„ Ø§Ù„Ø³Ø±ÙŠØ¹ Ø¨Ø¯ÙˆÙ† Ø¥Ù†ØªØ±Ù†Øª</p>
            </div>
          </div>
          <div className="install-actions">
            <button className="btn-install" onClick={handleInstallApp}>ØªØ«Ø¨ÙŠØª</button>
            <button className="btn-dismiss" onClick={() => setShowInstallPrompt(false)}><X size={18} /></button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <nav className="sidebar">
          <div>
            <div className="logo-section">
              <div className="logo-icon"><MushafIcon /></div>
              <span className="logo-text">Ø§Ù„Ø°ÙƒØ± Ø§Ù„Ø­ÙƒÙŠÙ…</span>
            </div>
            <ul className="sidebar-nav">
              {navItems.map(n => (
                <li key={n.key} className={tab === n.key ? 'active' : ''} onClick={() => { setTab(n.key); setSheetOpen(false); }}>
                  <n.icon size={18} /> {n.label}
                </li>
              ))}
            </ul>
          </div>
          <div className="sidebar-bottom-actions" style={{ padding: '1rem 0', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
            <span>ØªØ§Ø¨Ø¹ Ù„Ù…Ø¤Ø³Ø³Ø© SA 2026</span>
          </div>
        </nav>
      )}

      {/* Main content */}
      <main className="main-content">
        {loading && <div className="loading-bar"><span className="spinner" /> Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ù…ÙŠÙ„...</div>}
        {notification && <div className="notification"><Bell size={13} /><span>{notification}</span></div>}

        {tab === 'reciters' && (
          <>
            <RecitersPage reciters={RECITERS} pinnedReciters={pinnedReciters} onTogglePin={handleTogglePinReciter} onSelectReciter={handleSelectReciter} />
            <div className="hadith-promo-card" onClick={() => setTab('hadith')}>
              <div className="hadith-promo-icon"><BookOpen size={28} /></div>
              <div className="hadith-promo-info">
                <h3>Ø§Ù„Ø£Ø±Ø¨Ø¹ÙˆÙ† Ø§Ù„Ù†ÙˆÙˆÙŠØ©</h3>
                <p>Ø£Ø­Ø§Ø¯ÙŠØ« Ù…Ø®ØªØ§Ø±Ø© ÙÙŠ Ø£ØµÙˆÙ„ Ø§Ù„Ø¯ÙŠÙ† ÙˆÙ‚ÙˆØ§Ø¹Ø¯ Ø§Ù„Ø¥Ø³Ù„Ø§Ù…</p>
              </div>
              <span className="hadith-promo-btn">Ø§Ø¨Ø¯Ø£ Ø§Ù„Ø¢Ù†</span>
            </div>
          </>
        )}

        {tab === 'dashboard' && (
          <Dashboard surahs={surahs} activeSurah={activeSurah} activeReciter={activeReciter} onSelectSurah={handleSelectSurah} pinnedSurahs={pinnedSurahs} onTogglePinSurah={handleTogglePinSurah} favorites={favorites} setTab={setTab} onPlayRadio={() => { if(isPlaying) handlePlayPause(); }} />
        )}

        {tab === 'hadith' && <HadithPage onBack={() => setTab('reciters')} readHadiths={readHadiths} onMarkRead={handleMarkHadithRead} />}

        {tab === 'player' && (
          <div className="quran-workspace">
            <div className="player-pane">
  {!isMobile ? (
    <div className="phone-mockup">
      <div className="phone-screen">
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
    </div>
  ) : (
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
  )}
</div>
            {!isMobile && (<Reader
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
          <StatsTracker surahs={surahs} favorites={favorites} memorized={memorized} readHadiths={readHadiths} onToggleMemorized={handleToggleMemorized} onSelectSurah={handleSelectSurah} setTab={setTab} />
        )}
      </main>

    {/* Mobile Bottom Nav */}
    {isMobile && tab !== 'hadith' && (
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
              <h3>Ø§Ù„ØªÙØ³ÙŠØ± Ø§Ù„Ù…ÙŠØ³Ø±</h3>
              <button className="tafsir-close-btn" onClick={() => setTafsirData(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="tafsir-ayah-box">
              <p style={{ fontFamily: 'var(--font-ar)', fontSize: '1.2rem', lineHeight: 2.2, color: 'var(--sage-dark)', fontWeight: 600 }}>
                {tafsirData.ayah.text}
              </p>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'var(--font-en)' }}>
                Ø§Ù„Ø¢ÙŠØ© {tafsirData.ayah.numberInSurah}
              </span>
            </div>
            <div className="tafsir-content">
              {tafsirData.loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                  <span className="spinner" /> Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªÙØ³ÙŠØ±...
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


