import { useEffect, useRef } from "react";

export default function CircularEqualizer({ stream }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    if (!stream) return;

    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;

    analyserRef.current = analyser;
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

    source.connect(analyser);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // HiDPI fix
    const dpr = window.devicePixelRatio || 1;
    const size = 400;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = 120;

    const render = () => {
      requestAnimationFrame(render);

      analyser.getByteFrequencyData(dataArrayRef.current);

      ctx.clearRect(0, 0, size, size);

      ctx.shadowBlur = 20;
      ctx.shadowColor = "rgba(0, 255, 255, 0.25)";

      const bars = dataArrayRef.current.length;

      for (let i = 0; i < bars; i++) {
        const value = dataArrayRef.current[i];
        const angle = (i / bars) * Math.PI * 2;
        const barLength = value * 0.5;

        const x1 = cx + Math.cos(angle) * radius;
        const y1 = cy + Math.sin(angle) * radius;
        const x2 = cx + Math.cos(angle) * (radius + barLength);
        const y2 = cy + Math.sin(angle) * (radius + barLength);

        ctx.strokeStyle = `hsl(${(i / bars) * 360}, 100%, 55%)`;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    };

    render();

    // CLEANUP (important)
    return () => {
      audioCtx.close();
    };
  }, [stream]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        background: "#000",
        borderRadius: "50%",
      }}
    />
  );
}
