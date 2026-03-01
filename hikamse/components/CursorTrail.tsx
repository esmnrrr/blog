"use client";
import { useEffect } from "react";

export default function CursorTrail() {
  useEffect(() => {
    const dots: HTMLElement[] = [];
    const colors = ["#f472b6", "#c084fc", "#e879f9", "#38bdf8", "#fb7185"];
    
    for (let i = 0; i < 15; i++) {
      const dot = document.createElement("div");
      
      // Tailwind yerine kesin CSS kuralları koyduk (Sayfayı asla bozamazlar)
      dot.style.position = "fixed";
      dot.style.pointerEvents = "none";
      dot.style.zIndex = "9999";
      dot.style.width = "12px";
      dot.style.height = "12px";
      dot.style.borderRadius = "50%";
      dot.style.backgroundColor = colors[i % colors.length];
      dot.style.boxShadow = `0 0 10px ${colors[i % colors.length]}, 0 0 20px ${colors[i % colors.length]}`;
      dot.style.transition = "transform 0.15s ease-out, opacity 0.3s ease-out";
      dot.style.opacity = "0";
      dot.style.left = "0px";
      dot.style.top = "0px";
      dot.style.filter = "blur(1px)"; // Büyülü ışıltı efekti
      
      document.body.appendChild(dot);
      dots.push(dot);
    }

    let timeoutId: any;

    const onMouseMove = (e: MouseEvent) => {
      dots.forEach((dot, index) => {
        setTimeout(() => {
          // Farenin tam ucuna oturması için -6px kaydırdık
          dot.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px) scale(${1 - index * 0.06})`;
          dot.style.opacity = `${1 - index * 0.05}`;
        }, index * 15);
      });

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        dots.forEach(dot => dot.style.opacity = "0");
      }, 300);
    };

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      dots.forEach(dot => dot.remove());
    };
  }, []);

  return null;
}