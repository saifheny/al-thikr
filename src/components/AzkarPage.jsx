import React, { useState, useEffect } from 'react';
import { Loader, ChevronLeft, ChevronRight, Hash } from 'lucide-react';

export default function AzkarPage() {
  const [azkarData, setAzkarData] = useState({});
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // For the active zikr reader
  const [activeZikrIndex, setActiveZikrIndex] = useState(0);
  const [counters, setCounters] = useState({});

  useEffect(() => {
    async function loadAzkar() {
      try {
        const res = await fetch('https://raw.githubusercontent.com/nawafalqari/azkar-api/56df51279ab6eb86dc2f6202c7de26c8948331c1/azkar.json');
        const data = await res.json();
        
        // Remove empty or irrelevant categories
        const validCategories = Object.keys(data).filter(k => data[k] && data[k].length > 0 && k !== '????? ??????');
        setCategories(validCategories);
        setAzkarData(data);
      } catch (err) {
        console.error("Failed to load azkar", err);
      } finally {
        setLoading(false);
      }
    }
    loadAzkar();
  }, []);

  const openCategory = (cat) => {
    setActiveCategory(cat);
    setActiveZikrIndex(0);
    setCounters({});
  };

  const handleNextZikr = () => {
    const list = azkarData[activeCategory];
    if (activeZikrIndex < list.length - 1) setActiveZikrIndex(prev => prev + 1);
  };

  const handlePrevZikr = () => {
    if (activeZikrIndex > 0) setActiveZikrIndex(prev => prev - 1);
  };

  const handleCount = () => {
    const currentZikr = azkarData[activeCategory][activeZikrIndex];
    const targetCount = parseInt(currentZikr.count || '1');
    const currentVal = counters[activeZikrIndex] || 0;
    
    if (currentVal < targetCount) {
      setCounters(prev => ({...prev, [activeZikrIndex]: currentVal + 1}));
    }
  };

  if (loading) {
    return (
      <div className="empty-state">
        <Loader className="spin" size={32} style={{ color: 'var(--sage)', marginBottom: 15 }} />
        <p>جاري تحميل الأذكار...</p>
      </div>
    );
  }

  if (!activeCategory) {
    return (
      <div className="azkar-container">
        <div className="hadith-header">
          <div className="title-wrapper">
            <h2>حصن المسلم</h2>
            <span className="subtitle">أذكار وأدعية مأثورة</span>
          </div>
        </div>
        <div className="azkar-grid">
          {categories.map((cat, i) => (
            <div key={i} className="azkar-card" onClick={() => openCategory(cat)}>
              <h3>{cat}</h3>
              <p>{azkarData[cat].length} ذكر</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const zikrList = azkarData[activeCategory];
  const currentZikr = zikrList[activeZikrIndex];
  const targetCount = parseInt(currentZikr.count || '1');
  const currentCount = counters[activeZikrIndex] || 0;
  const isCompleted = currentCount >= targetCount;

  return (
    <div className="azkar-container">
      <div className="back-btn-wrapper" style={{ marginBottom: '1rem' }}>
        <button className="ctrl-btn" onClick={() => setActiveCategory(null)} style={{ width: 'auto', padding: '8px 16px', borderRadius: '20px' }}>
          <ChevronRight size={18} /> العودة للأقسام
        </button>
      </div>

      <div className="hadith-header">
        <div className="title-wrapper">
          <h2>{activeCategory}</h2>
        </div>
      </div>
      
      <div className="hadith-book-view" style={{ minHeight: 'auto' }}>
        <div className="hadith-text-content" style={{ display: 'block' }}>
          <p className="hadith-arabic-text" style={{ fontSize: '1.6rem' }}>{currentZikr.content}</p>
          {currentZikr.description && (
            <p className="zikr-description">{currentZikr.description}</p>
          )}
        </div>

        <div className="zikr-counter-wrapper">
          <button 
            className={`zikr-counter-btn ${isCompleted ? 'completed' : ''}`}
            onClick={handleCount}
            disabled={isCompleted}
          >
            <div className="counter-circle">
              <span className="count-num">{targetCount - currentCount}</span>
            </div>
            <span className="counter-label">{isCompleted ? 'اكتمل' : 'اضغط للتسبيح'}</span>
          </button>
        </div>

        <div className="hadith-controls">
          <button className="nav-btn" onClick={handleNextZikr} disabled={activeZikrIndex === zikrList.length - 1}>
            <ChevronRight size={24} />
          </button>
          
          <span className="page-indicator">
            {activeZikrIndex + 1} / {zikrList.length}
          </span>
          
          <button className="nav-btn" onClick={handlePrevZikr} disabled={activeZikrIndex === 0}>
            <ChevronLeft size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
