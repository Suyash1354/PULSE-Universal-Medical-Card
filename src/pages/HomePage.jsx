import { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import "./HomePage.css";

const LETTERS = "MediCard".split("");

// ── Hospital SVG icons (colorful, each with a unique fill) ──
const ICONS = [
  // Stethoscope
  { color: "#e74c3c", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="52" height="52"><circle cx="44" cy="50" r="6" fill="#e74c3c"/><path d="M12 8 a10 10 0 0 1 20 0 v16 a12 12 0 0 0 24 0v-4" stroke="#e74c3c" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="44" cy="20" r="4" fill="#e74c3c"/></svg>` },
  // Pill
  { color: "#3498db", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="52" height="52"><rect x="8" y="24" width="48" height="16" rx="8" fill="#3498db"/><rect x="8" y="24" width="24" height="16" rx="8" fill="#2980b9"/><line x1="32" y1="24" x2="32" y2="40" stroke="white" stroke-width="2"/></svg>` },
  // Heart
  { color: "#e91e8c", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="52" height="52"><path d="M32 54 C32 54 8 38 8 22 a12 12 0 0 1 24-4 12 12 0 0 1 24 4 C56 38 32 54 32 54z" fill="#e91e8c"/></svg>` },
  // Syringe
  { color: "#27ae60", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="52" height="52"><rect x="20" y="20" width="28" height="12" rx="4" fill="#27ae60"/><rect x="44" y="23" width="12" height="6" rx="2" fill="#1e8449"/><line x1="20" y1="26" x2="8" y2="26" stroke="#27ae60" stroke-width="4" stroke-linecap="round"/><line x1="12" y1="22" x2="12" y2="30" stroke="#1e8449" stroke-width="2"/><line x1="28" y1="20" x2="28" y2="32" stroke="white" stroke-width="2" opacity="0.5"/><line x1="36" y1="20" x2="36" y2="32" stroke="white" stroke-width="2" opacity="0.5"/></svg>` },
  // Red Cross
  { color: "#e74c3c", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="52" height="52"><rect x="24" y="8" width="16" height="48" rx="4" fill="#e74c3c"/><rect x="8" y="24" width="48" height="16" rx="4" fill="#e74c3c"/></svg>` },
  // Clipboard
  { color: "#9b59b6", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="52" height="52"><rect x="12" y="16" width="40" height="44" rx="4" fill="#9b59b6"/><rect x="24" y="8" width="16" height="12" rx="4" fill="#8e44ad"/><line x1="20" y1="30" x2="44" y2="30" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="20" y1="38" x2="44" y2="38" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="20" y1="46" x2="34" y2="46" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>` },
  // Thermometer
  { color: "#f39c12", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="52" height="52"><rect x="28" y="8" width="8" height="36" rx="4" fill="#f39c12"/><circle cx="32" cy="48" r="10" fill="#e67e22"/><rect x="29" y="20" width="6" height="20" fill="#e67e22" opacity="0.6"/></svg>` },
  // DNA
  { color: "#1abc9c", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="52" height="52"><path d="M20 8 Q32 20 44 8" stroke="#1abc9c" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M20 20 Q32 32 44 20" stroke="#1abc9c" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M20 32 Q32 44 44 32" stroke="#1abc9c" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M20 44 Q32 56 44 44" stroke="#1abc9c" stroke-width="3" fill="none" stroke-linecap="round"/><line x1="20" y1="8" x2="20" y2="56" stroke="#16a085" stroke-width="2.5"/><line x1="44" y1="8" x2="44" y2="56" stroke="#16a085" stroke-width="2.5"/></svg>` },
  // Bandage
  { color: "#e67e22", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="52" height="52"><rect x="10" y="22" width="44" height="20" rx="10" fill="#e67e22"/><rect x="22" y="22" width="20" height="20" fill="#d35400"/><line x1="30" y1="28" x2="34" y2="28" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="32" y1="26" x2="32" y2="38" stroke="white" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="32" r="3" fill="white" opacity="0.4"/><circle cx="48" cy="32" r="3" fill="white" opacity="0.4"/></svg>` },
  // Ambulance
  { color: "#c0392b", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="56" height="56"><rect x="4" y="20" width="44" height="26" rx="4" fill="#c0392b"/><rect x="44" y="28" width="16" height="18" rx="3" fill="#e74c3c"/><circle cx="14" cy="50" r="6" fill="#333"/><circle cx="14" cy="50" r="3" fill="#aaa"/><circle cx="42" cy="50" r="6" fill="#333"/><circle cx="42" cy="50" r="3" fill="#aaa"/><rect x="16" y="26" width="16" height="12" rx="2" fill="white" opacity="0.2"/><line x1="22" y1="28" x2="22" y2="36" stroke="white" stroke-width="2"/><line x1="18" y1="32" x2="26" y2="32" stroke="white" stroke-width="2"/></svg>` },
];

let lastSpawnTime = 0;

export default function HomePage() {
  const navRef      = useRef(null);
  const lettersRef  = useRef([]);
  const subRef      = useRef(null);
  const btnsRef     = useRef(null);
  const caretRef    = useRef(null);
  const rootRef     = useRef(null);

  // ── Spawn icon on mousemove ──
  const handleMouseMove = useCallback((e) => {
    const now = Date.now();
    if (now - lastSpawnTime < 320) return; // throttle
    lastSpawnTime = now;

    const icon = ICONS[Math.floor(Math.random() * ICONS.length)];
    const size = 44 + Math.random() * 28; // 44–72px
    const rotation = -20 + Math.random() * 40; // -20 to +20 deg

    const el = document.createElement("div");
    el.className = "hover-icon";
    el.innerHTML = icon.svg;
    el.style.cssText = `
      left: ${e.clientX - size / 2}px;
      top:  ${e.clientY - size / 2}px;
      width: ${size}px;
      height: ${size}px;
      transform: rotate(${rotation}deg) scale(0);
      opacity: 0;
      filter: drop-shadow(0 4px 12px ${icon.color}55);
    `;

    rootRef.current.appendChild(el);

    // Pop in → hold → fade out
    gsap.timeline({ onComplete: () => el.remove() })
      .to(el, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)" })
      .to(el, { opacity: 0, scale: 0.7, y: -18, duration: 0.4, ease: "power2.in" }, "+=0.4  ");
  }, []);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(navRef.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power2.out" }
    )
    .fromTo(btnsRef.current.children,
      { scale: 0.6, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, stagger: 0.18, ease: "back.out(1.7)" },
      "+=0.2"
    )
    .fromTo(lettersRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, stagger: 0.08, ease: "power1.out" },
      "+=0.3"
    )
    .fromTo(subRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.1, ease: "power2.out" },
      "+=0.2"
    )
    .fromTo(caretRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4 },
      "-=0.4"
    );

    gsap.to(caretRef.current, {
      y: 7, repeat: -1, yoyo: true, duration: 1,
      ease: "power1.inOut", delay: 3.2,
    });
  }, []);

  return (
    <div className="home-root" ref={rootRef} onMouseMove={handleMouseMove}>
      <div className="dot-grid" aria-hidden="true" />

      {/* ── Navbar ── */}
      <nav className="navbar" ref={navRef}>
        <span className="brand-name">Pulse</span>
        <button className="nav-cta">Get Started</button>
      </nav>

      {/* ── Hero ── */}
      <main className="hero">
        <h1 className="hero-title">
          {LETTERS.map((char, i) => (
            <span key={i} className="letter" ref={el => lettersRef.current[i] = el}>
              {char}
            </span>
          ))}
        </h1>

        <p className="hero-sub" ref={subRef}>
          The Universal Medical Card which can change the<br />
          <strong>Indian Healthcare System.</strong>
        </p>

        <div className="role-buttons" ref={btnsRef}>
          <button className="role-btn">Doctor</button>
          <button className="role-btn">Patient</button>
          <button className="role-btn">Pharmacist</button>
        </div>

        <div className="scroll-caret" ref={caretRef} aria-hidden="true">
          <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
            <path d="M1 1L11 12L21 1" stroke="#888" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </main>
    </div>
  );
}