import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, ChevronLeft, Loader } from 'lucide-react';

export default function HadithPage() {
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
      <div className="empty-state">
        <Loader className="spin" size={32} style={{ color: 'var(--sage)', marginBottom: 15 }} />
        <p>جاري تحميل الأحاديث...</p>
      </div>
    );
  }

  if (hadiths.length === 0) {
    return (
      <div className="empty-state">
        <BookOpen size={48} strokeWidth={1.5} />
        <p>عذراً، لم نتمكن من تحميل الأحاديث حالياً.</p>
      </div>
    );
  }

  const currentHadith = hadiths[currentIndex];

  return (
    <div className="hadith-container">
      <div className="hadith-header">
        <div className="title-wrapper">
          <h2>الأربعون النووية</h2>
          <span className="subtitle">للإمام يحيى بن شرف النووي</span>
        </div>
      </div>
      
      <div className="hadith-book-view">
        <div className="hadith-number-badge">الحديث {currentHadith.hadithnumber}</div>
        
        <div className="hadith-text-content">
          <p className="hadith-arabic-text">{currentHadith.text}</p>
        </div>

        <div className="hadith-controls">
          <button className="nav-btn" onClick={handleNext} disabled={currentIndex === hadiths.length - 1} title="الحديث التالي">
            <ChevronRight size={24} />
          </button>
          
          <span className="page-indicator">
            {currentIndex + 1} / {hadiths.length}
          </span>
          
          <button className="nav-btn" onClick={handlePrev} disabled={currentIndex === 0} title="الحديث السابق">
            <ChevronLeft size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
