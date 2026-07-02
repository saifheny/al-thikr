import React from 'react';
import { Award, BookOpen, CheckCircle, Heart, Trophy, Target, Zap, Star } from 'lucide-react';

export default function StatsTracker({ surahs, favorites = [], memorized = [], readHadiths = [], onToggleMemorized, onSelectSurah, setTab }) {
  const memPct = surahs.length ? Math.round((memorized.length / surahs.length) * 100) : 0;
  const favPct = surahs.length ? Math.round((favorites.length / surahs.length) * 100) : 0;
  const hadithPct = Math.round((readHadiths.length / 42) * 100);
  const memSurahs = surahs.filter(s => memorized.includes(s.number));

  const badges = [
    { icon: Heart, label: 'محب القرآن', gradient: 'linear-gradient(135deg,#ff6b9d,#ffc3e0)', unlocked: favorites.length > 0 },
    { icon: Target, label: 'بداية الحفظ', gradient: 'linear-gradient(135deg,#667eea,#a8c8ff)', unlocked: memorized.length > 0 },
    { icon: BookOpen, label: 'طالب حديث', gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)', unlocked: readHadiths.length > 0 },
    { icon: Zap, label: 'مُثابر', gradient: 'linear-gradient(135deg,#f6d365,#fda085)', unlocked: memorized.length >= 10 || readHadiths.length >= 10 },
    { icon: Trophy, label: 'حافظ', gradient: 'linear-gradient(135deg,#a8edea,#fed6e3)', unlocked: memorized.length >= 30 },
    { icon: Star, label: 'عالم بالنووية', gradient: 'linear-gradient(135deg,#ffd700,#ff8c00)', unlocked: readHadiths.length >= 42 },
  ];

  return (
    <div className="stats-page">
      <div className="welcome-title">
        <h1><Trophy size={22} color="#f39c12" style={{ verticalAlign: 'middle', marginLeft: '0.4rem' }} />متابعة الإنجازات</h1>
        <p>تابع تقدمك في التلاوة والحفظ وقراءة الأحاديث</p>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat-chip green">
          <Award size={18} />
          <div>
            <span className="stat-chip-val">{memPct}%</span>
            <span className="stat-chip-lbl">مُحفظ</span>
          </div>
          <div className="stat-chip-bar"><div style={{ width: `${memPct}%`, background: '#1abc9c' }} /></div>
        </div>
        <div className="stat-chip" style={{ background: 'var(--sage-light)', color: 'var(--sage-dark)' }}>
          <BookOpen size={18} />
          <div>
            <span className="stat-chip-val">{readHadiths.length} / 42</span>
            <span className="stat-chip-lbl">أحاديث مقروءة</span>
          </div>
          <div className="stat-chip-bar"><div style={{ width: `${hadithPct}%`, background: 'var(--sage)' }} /></div>
        </div>
        <div className="stat-chip blue">
          <CheckCircle size={18} />
          <div>
            <span className="stat-chip-val">{memorized.length}</span>
            <span className="stat-chip-lbl">محفوظات</span>
          </div>
          <div className="stat-chip-bar"><div style={{ width: `${memPct}%`, background: '#3498db' }} /></div>
        </div>
      </div>

      {/* Badges */}
      <div>
        <h3 className="section-title" style={{ fontFamily: 'Tajawal, sans-serif' }}><Star size={16} /> الأوسمة</h3>
        <div className="badges-row">
          {badges.map((b, i) => (
            <div key={i} className={`badge-chip ${b.unlocked ? 'unlocked' : 'locked'}`}>
              <div className="badge-icon-wrap" style={{ background: b.unlocked ? b.gradient : undefined }}>
                <b.icon size={16} color={b.unlocked ? '#fff' : undefined} />
              </div>
              <span style={{ fontFamily: 'Tajawal, sans-serif', fontWeight: 600 }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Memorized list */}
      <div>
        <h3 className="section-title" style={{ fontFamily: 'Tajawal, sans-serif' }}><CheckCircle size={16} color="var(--accent-sage)" /> السور المحفوظة</h3>
        {memSurahs.length === 0 ? (
          <div className="empty-state" style={{ padding: '1.5rem' }}>
            <BookOpen size={36} strokeWidth={1.5} />
            <p style={{ fontFamily: 'Tajawal, sans-serif' }}>لم تحفظ أي سورة بعد</p>
          </div>
        ) : (
          <div className="memorized-list">
            {memSurahs.map(s => (
              <div key={s.number} className="memorized-item">
                <div className="memorized-info">
                  <span className="surah-number" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>{s.number}</span>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{s.name}</h4>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{s.englishName} • {s.numberOfAyahs} آية</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="action-pill" onClick={() => { onSelectSurah(s.number); setTab('player'); }}>
                    <BookOpen size={13} /> تلاوة
                  </button>
                  <button className="memorized-btn active" onClick={() => onToggleMemorized(s.number)}>
                    <CheckCircle size={18} fill="currentColor" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
