"use client";

import { useEffect, useRef, useState } from "react";

export interface FaceState {
  speaking: boolean;
  listening: boolean;
  lastNodAt?: number;
  nodTick?: number;
}

export function InterviewerFace({ state }: { state: FaceState }) {
  const [blink, setBlink] = useState(false);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [nod, setNod] = useState(false);
  const [browRaised, setBrowRaised] = useState(false);
  const [smile, setSmile] = useState(false);
  const [mouthFrame, setMouthFrame] = useState(0);
  const [tilt, setTilt] = useState(0);
  const nodTickRef = useRef(state.nodTick || 0);

  useEffect(() => {
    let cancelled = false;
    const loop = () => {
      if (cancelled) return;
      setBlink(true);
      window.setTimeout(() => setBlink(false), 130);
      window.setTimeout(loop, 2500 + Math.random() * 3500);
    };
    const t = window.setTimeout(loop, 2000);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const move = () => {
      if (cancelled) return;
      setPupilOffset({
        x: (Math.random() - 0.5) * 5,
        y: (Math.random() - 0.5) * 2.5,
      });
      window.setTimeout(move, 1500 + Math.random() * 2500);
    };
    const t = window.setTimeout(move, 1000);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loop = () => {
      if (cancelled) return;
      if (state.listening) {
        const r = Math.random();
        if (r < 0.22) triggerNod();
        else if (r < 0.32) triggerBrowRaise();
        else if (r < 0.39) triggerSmile(900);
        else if (r < 0.44) triggerTilt();
      }
      window.setTimeout(loop, 2800 + Math.random() * 3200);
    };
    const t = window.setTimeout(loop, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [state.listening]);

  useEffect(() => {
    if ((state.nodTick || 0) !== nodTickRef.current) {
      nodTickRef.current = state.nodTick || 0;
      triggerNod();
      if (Math.random() < 0.25) window.setTimeout(() => triggerSmile(800), 350);
      else if (Math.random() < 0.4) window.setTimeout(() => triggerBrowRaise(), 350);
    }
  }, [state.nodTick]);

  useEffect(() => {
    if (!state.speaking) {
      setMouthFrame(0);
      return;
    }
    const id = window.setInterval(() => setMouthFrame((f) => (f + 1) % 2), 140);
    return () => window.clearInterval(id);
  }, [state.speaking]);

  function triggerNod() {
    setNod(false);
    requestAnimationFrame(() => {
      setNod(true);
      window.setTimeout(() => setNod(false), 850);
    });
  }
  function triggerBrowRaise() {
    setBrowRaised(true);
    window.setTimeout(() => setBrowRaised(false), 800);
  }
  function triggerSmile(ms: number) {
    setSmile(true);
    window.setTimeout(() => setSmile(false), ms);
  }
  function triggerTilt() {
    const dir = Math.random() < 0.5 ? -2 : 2;
    setTilt(dir);
    window.setTimeout(() => setTilt(0), 1600);
  }

  const headStyle: React.CSSProperties = {
    transformOrigin: "180px 360px",
    transition: nod ? "transform 0.85s ease" : "transform 0.5s ease",
    transform: nod
      ? "rotate(3deg) translateY(5px)"
      : tilt !== 0
        ? `rotate(${tilt}deg)`
        : "rotate(0deg) translateY(0)",
  };

  const showSmile = smile && !state.speaking;
  const showTalk1 = state.speaking && mouthFrame === 0;
  const showTalk2 = state.speaking && mouthFrame === 1;
  const showNeutral = !showSmile && !showTalk1 && !showTalk2;

  return (
    <div style={{ width: 260, height: 300 }}>
      <svg viewBox="0 0 360 420" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <g
          style={{
            animation: "fp-breathe 4s ease-in-out infinite",
            transformOrigin: "180px 420px",
          }}
        >
          <g style={headStyle}>
            <path d="M60,410 Q180,335 300,410 L300,420 L60,420 Z" fill="#2a3140" />
            <path d="M155,310 Q180,335 205,310 L205,345 Q180,355 155,345 Z" fill="#d4b08c" />
            <ellipse cx="180" cy="175" rx="120" ry="135" fill="#3a2a1c" />
            <ellipse cx="180" cy="210" rx="100" ry="120" fill="#ebc8a4" />
            <path
              d="M88,170 Q100,110 180,95 Q260,110 272,170 Q255,140 220,135 Q200,155 180,155 Q160,155 140,135 Q105,140 88,170 Z"
              fill="#3a2a1c"
            />
            <ellipse cx="82" cy="215" rx="10" ry="18" fill="#d4b08c" />
            <ellipse cx="278" cy="215" rx="10" ry="18" fill="#d4b08c" />
            <path
              d="M118,175 Q140,167 162,175"
              stroke="#2a1e12"
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
              style={{
                transition: "transform 0.3s ease",
                transform: browRaised ? "translateY(-4px)" : "translateY(0)",
              }}
            />
            <path
              d="M198,175 Q220,167 242,175"
              stroke="#2a1e12"
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
              style={{
                transition: "transform 0.3s ease",
                transform: browRaised ? "translateY(-4px)" : "translateY(0)",
              }}
            />
            <ellipse cx="140" cy="200" rx="17" ry="11" fill="#ffffff" />
            <ellipse cx="220" cy="200" rx="17" ry="11" fill="#ffffff" />
            <g style={{ transition: "transform 0.5s ease", transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` }}>
              <circle cx="140" cy="200" r="7.5" fill="#3a2a1c" />
              <circle cx="220" cy="200" r="7.5" fill="#3a2a1c" />
              <circle cx="142" cy="198" r="2" fill="#ffffff" />
              <circle cx="222" cy="198" r="2" fill="#ffffff" />
            </g>
            <ellipse
              cx="140"
              cy="200"
              rx="18"
              ry="12"
              fill="#ebc8a4"
              style={{
                transformOrigin: "140px 188px",
                transition: "transform 0.12s ease",
                transform: blink ? "scaleY(1)" : "scaleY(0)",
              }}
            />
            <ellipse
              cx="220"
              cy="200"
              rx="18"
              ry="12"
              fill="#ebc8a4"
              style={{
                transformOrigin: "220px 188px",
                transition: "transform 0.12s ease",
                transform: blink ? "scaleY(1)" : "scaleY(0)",
              }}
            />
            <path
              d="M180,215 Q172,245 176,260 Q180,264 188,260"
              stroke="#c4a080"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
            />
            {showNeutral && (
              <path
                d="M155,290 Q180,295 205,290"
                stroke="#6b3a3a"
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
              />
            )}
            {showSmile && (
              <path
                d="M148,287 Q180,310 212,287"
                stroke="#6b3a3a"
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
              />
            )}
            {showTalk1 && <ellipse cx="180" cy="292" rx="14" ry="3" fill="#3a1818" />}
            {showTalk2 && <ellipse cx="180" cy="293" rx="12" ry="6" fill="#3a1818" />}
            <ellipse cx="120" cy="245" rx="14" ry="7" fill="#e8a890" opacity={0.35} />
            <ellipse cx="240" cy="245" rx="14" ry="7" fill="#e8a890" opacity={0.35} />
          </g>
        </g>
      </svg>
    </div>
  );
}
