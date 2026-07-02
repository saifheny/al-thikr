import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

export default function HadithPage({ onBack, readHadiths = [], onMarkRead }) {
  const [hadiths, setHadiths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadHadith() {
      try {
        const res = await fetch('https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/ara-nawawi.json');
        const data = await res.json();
        setHadiths(data.hadiths);
      } catch (err) {
        console.error("Failed to load hadith", err);
      } finally {
        setLoading(false);
      }
    }
    loadHadith();
  }, []);

  const handleNext = () => {
    if (currentIndex < hadiths.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  if (loading) {
    return (
      <div className="hadith-page">
        <div className="hadith-topbar">
          <button className="hadith-back-btn" onClick={onBack}>
            <ArrowRight size={20} />
            <span>Ø±Ø¬ÙˆØ¹</span>
          </button>
        </div>
        <div className="empty-state">
          <Loader2 className="spin" size={32} style={{ color: 'var(--sage)', marginBottom: 15 }} />
          <p>Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø£Ø­Ø§Ø¯ÙŠØ«...</p>
        </div>
      </div>
    );
  }

  if (hadiths.length === 0) {
    return (
      <div className="hadith-page">
        <div className="hadith-topbar">
          <button className="hadith-back-btn" onClick={onBack}>
            <ArrowRight size={20} />
            <span>Ø±Ø¬ÙˆØ¹</span>
          </button>
        </div>
        <div className="empty-state">
          <p>Ù„Ù… Ù†ØªÙ…ÙƒÙ† Ù…Ù† ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø£Ø­Ø§Ø¯ÙŠØ« Ø­Ø§Ù„ÙŠØ§Ù‹.</p>
        </div>
      </div>
    );
  }

  const currentHadith = hadiths[currentIndex];

  useEffect(() => {
    if (currentHadith && onMarkRead) {
      onMarkRead(currentHadith.hadithnumber);
    }
  }, [currentHadith, onMarkRead]);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === hadiths.length - 1;

  return (
    <div className="hadith-page">
      <div className="hadith-topbar">
        <button className="hadith-back-btn" onClick={onBack}>
          <ArrowRight size={20} />
          <span>Ø±Ø¬ÙˆØ¹</span>
        </button>
        <div className="hadith-topbar-title">
          <span>Ø§Ù„Ø£Ø±Ø¨Ø¹ÙˆÙ† Ø§Ù„Ù†ÙˆÙˆÙŠØ©</span>
        </div>
        <span className="hadith-counter">{currentIndex + 1} / {hadiths.length}</span>
      </div>

      <div className="hadith-body">
        <div className="hadith-badge">Ø§Ù„Ø­Ø¯ÙŠØ« {currentHadith.hadithnumber}</div>
        <p className="hadith-text">{currentHadith.text}</p>
      </div>

      <div className="hadith-nav-bar">
        <button className="hadith-nav-btn prev" onClick={handlePrev} disabled={isFirst}>
          <ChevronRight size={22} />
          <span>Ø§Ù„Ø³Ø§Ø¨Ù‚</span>
        </button>
        <button className="hadith-nav-btn next" onClick={handleNext} disabled={isLast}>
          <span>Ø§Ù„Ø­Ø¯ÙŠØ« Ø§Ù„ØªØ§Ù„ÙŠ</span>
          <ChevronLeft size={22} />
        </button>
      </div>
    </div>
  );
}

