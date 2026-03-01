"use client";
import { useEffect, useState } from "react";

export default function FloatingEffects() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const elements = Array.from({ length: 25 }); // 25 tane nesne uçuşacak

  return (
    <div 
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9998, overflow: 'hidden' }}
    >
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(110vh) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-10vh) translateX(100px) rotate(360deg); opacity: 0; }
        }
        .sakura-leaf {
          position: absolute;
          bottom: -10%;
          animation: floatUp linear infinite;
        }
      `}</style>

      {elements.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = 12 + Math.random() * 20; // 12-32 saniye arası süzülüş
        const isSakura = Math.random() > 0.4;

        return (
          <div
            key={i}
            className="sakura-leaf"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          >
            {isSakura ? (
              // 🌸 Pembe Kiraz Çiçeği Yaprağı
              <div 
                style={{ width: '14px', height: '18px', backgroundColor: 'rgba(244,114,182,0.6)', borderRadius: '50% 0 50% 0', filter: 'blur(0.5px)', boxShadow: '0 0 10px rgba(244,114,182,0.5)' }} 
              />
            ) : (
              // ✨ Büyülü Işıltı (Yıldız Tozu)
              <div 
                style={{ width: '6px', height: '6px', backgroundColor: 'rgba(216,180,254,0.8)', borderRadius: '50%', filter: 'blur(1px)', boxShadow: '0 0 8px #fff' }} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
}