import React, { useState, useEffect, useRef } from 'react';
import { Clock, Navigation, Bell, BellOff, Compass, MapPin, Volume2, VolumeX } from 'lucide-react';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

export default function PrayersPage({ showNotification }) {
  const [coords, setCoords] = useState(null);
  const [locationName, setLocationName] = useState('موقع غير محدد');
  const [loading, setLoading] = useState(false);
  const [timings, setTimings] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [compassHeading, setCompassHeading] = useState(0); // device heading from north
  const [isMobileCompass, setIsMobileCompass] = useState(false);
  
  // Audio & Notification Preferences
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [adhanPlayedToday, setAdhanPlayedToday] = useState({});

  const adhanAudioRef = useRef(null);

  // Initialize Adhan Audio
  useEffect(() => {
    adhanAudioRef.current = new Audio('https://download.quranicaudio.com/adhan/adhan_makkah_ali_mulla.mp3');
    adhanAudioRef.current.preload = 'auto';
    return () => {
      if (adhanAudioRef.current) {
        adhanAudioRef.current.pause();
      }
    };
  }, []);

  // Request Location & Load from Cache if exists, otherwise request automatically
  useEffect(() => {
    const cachedCoords = localStorage.getItem('user_coords');
    if (cachedCoords) {
      const parsed = JSON.parse(cachedCoords);
      setCoords(parsed);
      fetchPrayers(parsed.lat, parsed.lng);
      calculateQibla(parsed.lat, parsed.lng);
    } else {
      requestLocation();
    }
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      showNotification('متصفحك مش بيدعم تحديد المكان');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const newCoords = { lat, lng };
        setCoords(newCoords);
        localStorage.setItem('user_coords', JSON.stringify(newCoords));
        fetchPrayers(lat, lng);
        calculateQibla(lat, lng);
      },
      (error) => {
        setLoading(false);
        showNotification('يا ريت تسمح لنا نوصل لمكانك عشان نظبط مواقيت الصلاة والقبلة بالظبط');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const fetchPrayers = async (lat, lng) => {
    setLoading(true);
    try {
      // Fetch timings using Umm al-Qura method (method=4)
      const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=4`);
      if (!res.ok) throw new Error('Failed to fetch timings');
      const data = await res.json();
      if (data.data) {
        setTimings(data.data.timings);
        if (data.data.meta) {
          setLocationName(data.data.meta.timezone || 'موقعك الحالي');
        }
      }
    } catch (e) {
      showNotification('حدث خطأ أثناء تحميل مواقيت الصلاة');
    } finally {
      setLoading(false);
    }
  };

  // Calculate Qibla bearing
  const calculateQibla = (lat, lng) => {
    const phiUser = (lat * Math.PI) / 180;
    const lambdaUser = (lng * Math.PI) / 180;
    const phiKaaba = (KAABA_LAT * Math.PI) / 180;
    const lambdaKaaba = (KAABA_LNG * Math.PI) / 180;

    const deltaLambda = lambdaKaaba - lambdaUser;

    const y = Math.sin(deltaLambda);
    const x = Math.cos(phiUser) * Math.tan(phiKaaba) - Math.sin(phiUser) * Math.cos(deltaLambda);

    let qiblaRad = Math.atan2(y, x);
    let qiblaDeg = (qiblaRad * 180) / Math.PI;
    
    // Normalize to 0-360
    qiblaDeg = (qiblaDeg + 360) % 360;
    setQiblaDirection(Math.round(qiblaDeg));
  };

  // Check device orientation for compass
  useEffect(() => {
    const handleOrientation = (e) => {
      // webkitCompassHeading is iOS specific, alpha is standard (but needs absolute or calibration)
      const heading = e.webkitCompassHeading || (360 - e.alpha);
      if (heading !== undefined && heading !== null) {
        setCompassHeading(Math.round(heading));
        setIsMobileCompass(true);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  // Request notifications permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      showNotification('متصفحك لا يدعم إشعارات سطح المكتب');
      return;
    }
    const perm = await Notification.requestPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      showNotification('شغلنالك إشعارات الأذان خلاص');
    } else {
      showNotification('للأسف رفضت إشعارات الأذان');
    }
  };

  // Prayer calculations & alarms loop
  useEffect(() => {
    if (!timings) return;

    const prayerOrder = [
      { name: 'الفجر', key: 'Fajr' },
      { name: 'الشروق', key: 'Sunrise' },
      { name: 'الظهر', key: 'Dhuhr' },
      { name: 'العصر', key: 'Asr' },
      { name: 'المغرب', key: 'Maghrib' },
      { name: 'العشاء', key: 'Isha' }
    ];

    const interval = setInterval(() => {
      const now = new Date();

      // Find next prayer
      let foundNext = null;
      let minDiff = Infinity;
      let nextName = '';

      prayerOrder.forEach((p) => {
        const timeStr = timings[p.key];
        if (!timeStr) return;
        const [hStr, mStr] = timeStr.split(':');
        const pDate = new Date();
        pDate.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);

        // Check if prayer time is NOW (within 30 seconds window) — before rolling to tomorrow
        const diffFromNowMs = pDate.getTime() - now.getTime();
        const diffFromNowSecs = Math.abs(Math.floor(diffFromNowMs / 1000));
        const todayStr = now.toDateString() + '_' + p.key;

        // Trigger at exact time (within 30s window)
        if (diffFromNowSecs < 30 && diffFromNowMs >= -30000 && !adhanPlayedToday[todayStr]) {
          triggerAdhan(p.name);
          setAdhanPlayedToday(prev => ({ ...prev, [todayStr]: true }));
        }

        // Trigger 2-minute warning notification
        const warnKey = todayStr + '_warn';
        if (diffFromNowMs > 0 && diffFromNowMs <= 120000 && diffFromNowMs > 60000 && !adhanPlayedToday[warnKey]) {
          if (Notification.permission === 'granted') {
            new Notification('تنبيه قبل الأذان', {
              body: `باقي دقيقتان على أذان ${p.name}`,
              icon: '/favicon.svg',
              silent: true
            });
          }
          showNotification(`⏰ باقي دقيقتان على أذان ${p.name}`);
          setAdhanPlayedToday(prev => ({ ...prev, [warnKey]: true }));
        }

        // For finding next prayer: if already passed today, roll to tomorrow
        let diff = pDate.getTime() - now.getTime();
        if (diff <= 0) {
          pDate.setDate(pDate.getDate() + 1);
          diff = pDate.getTime() - now.getTime();
        }

        if (diff < minDiff) {
          minDiff = diff;
          foundNext = pDate;
          nextName = p.name;
        }
      });

      if (foundNext) {
        setNextPrayer({ name: nextName, time: foundNext });
        
        // Format remaining time
        const diffMs = foundNext.getTime() - now.getTime();
        const totalSecs = Math.floor(diffMs / 1000);
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        
        const hrsStr = hrs.toString().padStart(2, '0');
        const minsStr = mins.toString().padStart(2, '0');
        const secsStr = secs.toString().padStart(2, '0');
        
        setTimeRemaining(`${hrsStr}:${minsStr}:${secsStr}`);
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [timings, adhanPlayedToday, soundEnabled]);

  const triggerAdhan = (prayerName) => {
    // Show Notification
    if (Notification.permission === 'granted') {
      new Notification('حان الآن موعد الأذان', {
        body: `حان الآن موعد أذان ${prayerName} بتوقيتك المحلي.`,
        icon: '/favicon.svg'
      });
    }

    // Play Adhan Audio
    if (soundEnabled && adhanAudioRef.current) {
      adhanAudioRef.current.currentTime = 0;
      adhanAudioRef.current.play().catch(e => console.log("Adhan audio play blocked:", e));
      showNotification(`🕌 حان الآن موعد أذان ${prayerName}`);
    }
  };

  const toggleSound = () => {
    if (soundEnabled) {
      if (adhanAudioRef.current) adhanAudioRef.current.pause();
      setSoundEnabled(false);
      showNotification('تم كتم صوت الأذان');
    } else {
      setSoundEnabled(true);
      showNotification('تم تفعيل صوت الأذان');
      // Test audio briefly to unlock audio context
      if (adhanAudioRef.current) {
        adhanAudioRef.current.play().then(() => {
          adhanAudioRef.current.pause();
          adhanAudioRef.current.currentTime = 0;
        }).catch(() => {});
      }
    }
  };

  // Manual rotation for desktop compass simulation
  const [manualRotation, setManualRotation] = useState(0);
  const isDragging = useRef(false);
  const startAngle = useRef(0);

  const handleCompassStart = (e) => {
    if (isMobileCompass) return; // Use real sensor
    isDragging.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const angle = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
    startAngle.current = angle - manualRotation;
  };

  const handleCompassMove = (e) => {
    if (!isDragging.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const angle = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
    setManualRotation(angle - startAngle.current);
  };

  const handleCompassEnd = () => {
    isDragging.current = false;
  };

  const activeHeading = isMobileCompass ? compassHeading : -manualRotation;
  // Qibla relative to North adjusted for compass heading
  // Qibla arrow angle relative to screen = qiblaDirection - heading
  const arrowRotation = qiblaDirection !== null ? (qiblaDirection - activeHeading + 360) % 360 : 0;

  if (!coords) {
    return (
      <div className="prayers-page-container">
        <div className="prayers-header">
          <div className="welcome-title">
            <h1>مواقيت الصلاة والقبلة</h1>
            <p>حدد موقعك لعرض مواعيد الأذان واتجاه القبلة بدقة</p>
          </div>
        </div>

        <div className="prayers-setup-card">
          <div className="setup-icon-wrapper">
            <Compass size={48} className="pulse-icon" />
          </div>
          <h2>تفعيل مواقيت الصلاة والقبلة</h2>
          <p>
            يحتاج التطبيق للوصول إلى موقعك الجغرافي لحساب مواقيت الأذن اليومية واتجاه القبلة الخاص بك بدقة متناهية.
          </p>
          <button onClick={requestLocation} className="setup-locate-btn" disabled={loading}>
            {loading ? 'جاري تحديد موقعك...' : 'تحديث وتحديد الموقع الآن'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="prayers-page-container">
      {/* Geolocation Loading Header */}
      <div className="prayers-header">
        <div className="welcome-title">
          <h1>مواقيت الصلاة والقبلة</h1>
          <p className="location-badge">
            <MapPin size={14} />
            <span>{locationName}</span>
          </p>
        </div>
        <div className="header-actions">
          <button onClick={requestLocation} className="option-btn active" disabled={loading}>
            {loading ? 'جاري التحديث...' : 'تحديث الموقع'}
          </button>
        </div>
      </div>

      <div className="prayers-content-grid">
        
        {/* Adhan Timings Card */}
        <div className="adhan-card-section">
          {/* Next Prayer Countdown Widget */}
          {nextPrayer && (
            <div className="next-prayer-widget">
              <div className="next-prayer-details">
                <span className="next-prayer-label">الصلاة القادمة: {nextPrayer.name}</span>
                <span className="next-prayer-countdown">{timeRemaining}</span>
              </div>
              <div className="next-prayer-preferences">
                <button onClick={requestNotificationPermission} className="circle-btn" title="تفعيل الإشعارات">
                  {notificationPermission === 'granted' ? <Bell size={18} className="glow-icon" /> : <BellOff size={18} />}
                </button>
                <button onClick={toggleSound} className="circle-btn" title="كتم/تفعيل صوت الأذان">
                  {soundEnabled ? <Volume2 size={18} className="glow-icon" /> : <VolumeX size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* Timings List */}
          {timings ? (
            <div className="timings-grid">
              {[
                { name: 'الفجر', key: 'Fajr', icon: Clock },
                { name: 'الشروق', key: 'Sunrise', icon: Clock },
                { name: 'الظهر', key: 'Dhuhr', icon: Clock },
                { name: 'العصر', key: 'Asr', icon: Clock },
                { name: 'المغرب', key: 'Maghrib', icon: Clock },
                { name: 'العشاء', key: 'Isha', icon: Clock }
              ].map((p) => {
                const isNext = nextPrayer && nextPrayer.name === p.name;
                return (
                  <div key={p.key} className={`timing-row ${isNext ? 'next-active' : ''}`}>
                    <div className="timing-meta">
                      <p.icon size={16} />
                      <span>{p.name}</span>
                    </div>
                    <span className="timing-val">{timings[p.key]}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <Clock size={40} />
              <h3>جاري تحميل مواقيت الصلاة...</h3>
            </div>
          )}
        </div>

        {/* Qibla Direction Compass Card */}
        <div className="qibla-card-section">
          <div className="qibla-info-header">
            <h3>تحديد القبلة</h3>
            {qiblaDirection !== null ? (
              <p className="qibla-angle-text">زاوية القبلة: {qiblaDirection}° من الشمال</p>
            ) : (
              <p className="qibla-angle-text">جاري حساب الزاوية...</p>
            )}
          </div>

          <div 
            className="compass-outer-wrapper"
            onMouseDown={handleCompassStart}
            onMouseMove={handleCompassMove}
            onMouseUp={handleCompassEnd}
            onMouseLeave={handleCompassEnd}
            onTouchStart={handleCompassStart}
            onTouchMove={handleCompassMove}
            onTouchEnd={handleCompassEnd}
            style={{ cursor: isMobileCompass ? 'default' : 'grab' }}
          >
            {/* The Compass Dial */}
            <div 
              className="compass-dial"
              style={{ transform: `rotate(${-activeHeading}deg)` }}
            >
              <span className="compass-direction north">N</span>
              <span className="compass-direction east">E</span>
              <span className="compass-direction south">S</span>
              <span className="compass-direction west">W</span>
              <div className="compass-ticks"></div>
            </div>

            {/* Qibla Pointer pointing to Kaaba */}
            {qiblaDirection !== null && (
              <div 
                className="qibla-pointer"
                style={{ transform: `rotate(${arrowRotation}deg)` }}
              >
                <div className="pointer-arrow"></div>
                <div className="kaaba-icon-container">
                  <svg viewBox="0 0 64 64" width="28" height="28" className="kaaba-svg">
                    <rect x="16" y="16" width="32" height="32" rx="4" fill="#111111" stroke="#f1c40f" strokeWidth="2"/>
                    <rect x="16" y="24" width="32" height="6" fill="#f1c40f" opacity="0.9"/>
                    <rect x="28" y="32" width="8" height="10" fill="#f1c40f" opacity="0.3" rx="1"/>
                  </svg>
                </div>
              </div>
            )}
            
            {/* Inner Glass Center */}
            <div className="compass-center-cap">
              <Compass size={28} className="center-compass-icon" />
            </div>
          </div>
          
          {!isMobileCompass && qiblaDirection !== null && (
            <p className="qibla-guide-hint">
              اسحب البوصلة لتدويرها ومحاكاة الاتجاه الفعلي للقبلة.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
