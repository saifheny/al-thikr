import React, { useState, useEffect } from 'react';
import { BookOpen, Radio, Clock, Award, X, ChevronLeft, ChevronRight } from 'lucide-react';

const TOUR_STEPS = [
  {
    icon: BookOpen,
    title: 'القرآن الكريم والمشغل',
    description: 'استمع لأكثر من 100 قارئ، وتابع القراءة مع التلاوة في نفس الوقت مع التفسير الميسر.',
  },
  {
    icon: BookOpen,
    title: 'الأربعون النووية',
    description: 'استمتع بقراءة أحاديث الإمام النووي بتصميم مريح وعصري، مع تتبع الأحاديث التي قرأتها.',
  },
  {
    icon: Radio,
    title: 'إذاعة القرآن الكريم',
    description: 'استمع للبث المباشر لإذاعة القرآن الكريم من القاهرة على مدار الساعة من قسم السور.',
  },
  {
    icon: Clock,
    title: 'مواقيت الصلاة والقبلة',
    description: 'تعرف على مواقيت الصلاة بدقة بناءً على موقعك، مع تحديد اتجاه القبلة أينما كنت.',
  },
  {
    icon: Award,
    title: 'تتبع إنجازاتك',
    description: 'احصل على أوسمة وشارات كلما تقدمت في حفظ السور وقراءة الأحاديث النبوية.',
  }
];

export default function OnboardingTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="tafsir-overlay">
      <div className="tour-modal">
        <button className="tour-close-btn" onClick={onComplete}>
          <X size={20} />
        </button>

        <div className="tour-content">
          <div className="tour-icon-wrap">
            <Icon size={40} color="var(--sage)" />
          </div>
          <h2 style={{ fontFamily: 'Tajawal, sans-serif' }}>{step.title}</h2>
          <p style={{ fontFamily: 'Tajawal, sans-serif' }}>{step.description}</p>
        </div>

        <div className="tour-dots">
          {TOUR_STEPS.map((_, i) => (
            <div key={i} className={`tour-dot ${i === currentStep ? 'active' : ''}`} />
          ))}
        </div>

        <div className="tour-actions">
          <button className="tour-btn secondary" onClick={handlePrev} disabled={currentStep === 0}>
            السابق
          </button>
          <button className="tour-btn primary" onClick={handleNext}>
            {currentStep === TOUR_STEPS.length - 1 ? 'ابدأ الآن' : 'التالي'}
          </button>
        </div>
      </div>
    </div>
  );
}
