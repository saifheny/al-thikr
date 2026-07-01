import React from 'react';
import { Heart, Pin } from 'lucide-react';
import { ReciterAvatar } from './AvatarSvg';

export default function RecitersPage({ reciters, pinnedReciters, onTogglePin, onSelectReciter }) {
  const pinned = reciters.filter(r => pinnedReciters.includes(r.id));
  const unpinned = reciters.filter(r => !pinnedReciters.includes(r.id));
  const ordered = [...pinned, ...unpinned];

  return (
    <div className="reciters-page">
      <div className="reciters-page-header">
        <h1>اختر القارئ</h1>
        <p>اختر الشيخ المفضل لبدء رحلتك مع كتاب الله الكريم</p>
      </div>

      <div className="reciters-full-grid">
        {ordered.map((reciter) => {
          const isPinned = pinnedReciters.includes(reciter.id);
          return (
            <div
              key={reciter.id}
              className={`reciter-full-card ${isPinned ? 'pinned' : ''}`}
              onClick={() => onSelectReciter(reciter)}
            >
              <div className="reciter-full-card-inner">
                <ReciterAvatar reciter={reciter} size={52} />
                <div className="reciter-full-info">
                  <h4>{reciter.name}</h4>
                  <span className="reciter-full-style">{reciter.englishName}</span>
                  <span className="reciter-full-badge">{reciter.style}</span>
                </div>
              </div>
              <button
                className={`pin-btn ${isPinned ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); onTogglePin(reciter.id); }}
                title={isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
              >
                {isPinned ? <Heart size={15} fill="currentColor" /> : <Heart size={15} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
