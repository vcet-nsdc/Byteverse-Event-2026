"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";

// Fast RFC4122 v4 compliant UUID generator
const generateUUID = () => {
  const lut = Array(256).fill(0).map((_, i) => (i < 16 ? "0" : "") + i.toString(16));
  const d0 = (Math.random() * 0xffffffff) | 0;
  const d1 = (Math.random() * 0xffffffff) | 0;
  const d2 = (Math.random() * 0xffffffff) | 0;
  const d3 = (Math.random() * 0xffffffff) | 0;
  return (
    lut[d0 & 0xff] + lut[(d0 >> 8) & 0xff] + lut[(d0 >> 16) & 0xff] + lut[(d0 >> 24) & 0xff] + "-" +
    lut[d1 & 0xff] + lut[(d1 >> 8) & 0xff] + "-" + lut[((d1 >> 16) & 0x0f) | 0x40] + lut[(d1 >> 24) & 0xff] + "-" +
    lut[(d2 & 0x3f) | 0x80] + lut[(d2 >> 8) & 0xff] + "-" + lut[(d2 >> 16) & 0xff] + lut[(d2 >> 24) & 0xff] +
    lut[d3 & 0xff] + lut[(d3 >> 8) & 0xff] + lut[(d3 >> 16) & 0xff] + lut[(d3 >> 24) & 0xff]
  );
};

export interface StarfieldProps {
  starColor?: string;
  bgColor?: string;
  mouseAdjust?: boolean;
  tiltAdjust?: boolean;
  easing?: number;
  clickToWarp?: boolean;
  hyperspace?: boolean;
  warpFactor?: number;
  opacity?: number;
  speed?: number;
  quantity?: number;
  className?: string;
  style?: React.CSSProperties;
}

const Starfield: React.FC<StarfieldProps> = ({
  starColor = "rgba(255,255,255,1)",
  bgColor = "transparent",
  mouseAdjust = false,
  tiltAdjust = false,
  easing = 1,
  clickToWarp = false,
  hyperspace = false,
  warpFactor = 10,
  opacity = 0.1,
  speed = 0.5,
  quantity = 420,
  className,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [localHyperspace, setLocalHyperspace] = useState(false);

  const mouse = useRef({ x: 0, y: 0 });
  const cursor = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const sd = useRef<{
    w: number;
    h: number;
    ctx: CanvasRenderingContext2D | null;
    x: number;
    y: number;
    z: number;
    starRatio: number;
    stars: number[][]; // [x, y, z, px, py, prevPx, prevPy, active]
  }>({
    w: 0,
    h: 0,
    ctx: null,
    x: 0,
    y: 0,
    z: 0,
    starRatio: 0,
    stars: [],
  });

  const isHyperspace = hyperspace || localHyperspace;
  const currentSpeed = isHyperspace ? speed * warpFactor : speed;
  const ratio = quantity / 2;

  // Viewport measurement with strict center stabilization
  const measureViewport = useCallback(() => {
    const el = canvasRef.current?.parentElement;
    const w = el?.clientWidth || window.innerWidth || 800;
    const h = el?.clientHeight || window.innerHeight || 600;

    sd.current.w = w;
    sd.current.h = h;
    sd.current.x = Math.round(w / 2);
    sd.current.y = Math.round(h / 2);
    sd.current.z = Math.max(100, Math.round((w + h) / 2));
    sd.current.starRatio = 1 / sd.current.z;

    // Center cursor and cancel lateral drift if mouseAdjust is disabled or during resize
    if (!mouseAdjust || cursor.current.x === 0 || cursor.current.y === 0) {
      cursor.current.x = sd.current.x;
      cursor.current.y = sd.current.y;
      mouse.current.x = 0;
      mouse.current.y = 0;
    }
  }, [mouseAdjust]);

  const setupCanvas = useCallback(() => {
    measureViewport();
    const canvas = canvasRef.current;
    if (canvas) {
      sd.current.ctx = canvas.getContext("2d");
      canvas.width = sd.current.w;
      canvas.height = sd.current.h;
    }
  }, [measureViewport]);

  const spawnStar = (w: number, h: number, zMax: number, initialZ?: number): number[] => {
    const rx = (Math.random() * 2 - 1) * w;
    const ry = (Math.random() * 2 - 1) * h;
    const rz = initialZ !== undefined ? initialZ : Math.random() * zMax + 1;
    return [rx, ry, rz, 0, 0, 0, 0, 0]; // 0 for active initially (suppress initial streak)
  };

  const bigBang = useCallback(() => {
    const { w, h, z } = sd.current;
    if (w <= 0 || h <= 0) return;

    const stars: number[][] = [];
    for (let i = 0; i < quantity; i++) {
      // Distribute evenly along z axis
      const initialZ = Math.random() * z + 1;
      stars.push(spawnStar(w, h, z, initialZ));
    }
    sd.current.stars = stars;
  }, [quantity]);

  const handleResize = useCallback(() => {
    const oldW = sd.current.w;
    const oldH = sd.current.h;
    measureViewport();

    const canvas = canvasRef.current;
    if (canvas && sd.current.ctx) {
      canvas.width = sd.current.w;
      canvas.height = sd.current.h;
    }

    // Always re-center cursor and mouse offsets on resize/zoom to prevent lateral runaway drift
    cursor.current.x = sd.current.x;
    cursor.current.y = sd.current.y;
    mouse.current.x = 0;
    mouse.current.y = 0;

    const rw = oldW > 0 ? sd.current.w / oldW : 1;
    const rh = oldH > 0 ? sd.current.h / oldH : 1;

    // Rescale existing stars cleanly and suppress streaks across viewport change
    const stars = sd.current.stars;
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      star[0] *= rw;
      star[1] *= rh;
      const zSafe = Math.max(1, star[2]);
      const px = sd.current.x + (star[0] / zSafe) * ratio;
      const py = sd.current.y + (star[1] / zSafe) * ratio;
      star[3] = px;
      star[4] = py;
      star[5] = px; // Reset streak tail
      star[6] = py;
      star[7] = 0;  // Suppress streak on resize frame
    }
  }, [measureViewport, ratio]);

  const update = useCallback(
    (dtFactor: number) => {
      const { w, h, z, x: cx, y: cy, stars } = sd.current;
      if (stars.length === 0) return;

      // Only calculate lateral drift if mouseAdjust is explicitly enabled
      if (mouseAdjust) {
        const targetMx = (cursor.current.x - cx) / Math.max(1, easing);
        const targetMy = (cursor.current.y - cy) / Math.max(1, easing);
        mouse.current.x += (targetMx - mouse.current.x) * 0.1;
        mouse.current.y += (targetMy - mouse.current.y) * 0.1;
      } else {
        mouse.current.x = 0;
        mouse.current.y = 0;
      }

      const lateralX = mouseAdjust ? Math.max(-6, Math.min(6, mouse.current.x >> 4)) : 0;
      const lateralY = mouseAdjust ? Math.max(-6, Math.min(6, mouse.current.y >> 4)) : 0;
      const moveZ = currentSpeed * dtFactor;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Save previous screen coords for streak
        star[5] = star[3];
        star[6] = star[4];

        // Apply lateral shifts only if mouseAdjust is active
        if (mouseAdjust) {
          star[0] += lateralX * dtFactor;
          star[1] += lateralY * dtFactor;

          // Wrap around bounds
          if (star[0] > w) star[0] -= w * 2;
          if (star[0] < -w) star[0] += w * 2;
          if (star[1] > h) star[1] -= h * 2;
          if (star[1] < -h) star[1] += h * 2;
        }

        // Move forward along z
        star[2] -= moveZ;

        // When star passes camera plane (z <= 0), recycle to the far background
        if (star[2] <= 0) {
          star[2] += z;
          // Re-randomize x and y to maintain uniform density across cosmic space
          star[0] = (Math.random() * 2 - 1) * w;
          star[1] = (Math.random() * 2 - 1) * h;
          star[7] = 0; // Disable streak on wrap-around frame
        } else {
          star[7] = 1; // Enable streak
        }

        const zSafe = Math.max(1, star[2]);
        star[3] = cx + (star[0] / zSafe) * ratio;
        star[4] = cy + (star[1] / zSafe) * ratio;
      }
    },
    [mouseAdjust, easing, currentSpeed, ratio]
  );

  const draw = useCallback(() => {
    const ctx = sd.current.ctx;
    if (!ctx) return;

    const { w, h, z, stars } = sd.current;

    // Clear canvas
    if (!bgColor || bgColor === "transparent" || bgColor === "rgba(0,0,0,0)") {
      ctx.clearRect(0, 0, w, h);
    } else {
      ctx.fillStyle = isHyperspace ? `rgba(0,0,0,${opacity})` : bgColor;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.strokeStyle = starColor;
    ctx.fillStyle = starColor;

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      const px = star[3];
      const py = star[4];
      const prevX = star[5];
      const prevY = star[6];
      const hasStreak = star[7] === 1;

      // Only draw if within visible viewport
      if (px >= -20 && px <= w + 20 && py >= -20 && py <= h + 20) {
        const depthRatio = Math.max(0.08, 1 - star[2] / z);
        const pointRadius = Math.max(0.8, depthRatio * 1.8);

        // Motion streak (only if not a wrap-around or resize frame)
        if (hasStreak && (prevX !== 0 || prevY !== 0)) {
          const dx = px - prevX;
          const dy = py - prevY;
          // Guard against erratic streaks across screen
          if (dx * dx + dy * dy < 4000) {
            ctx.lineWidth = Math.max(0.7, depthRatio * 2.2);
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(px, py);
            ctx.stroke();
          }
        }

        // Particle core dot
        ctx.beginPath();
        ctx.arc(px, py, pointRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [bgColor, isHyperspace, opacity, starColor]);

  const stop = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const animate = useCallback(
    (timestamp: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }
      const elapsed = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Delta time normalized to 60fps (16.67ms per frame)
      // Clamped to [0.1, 2.5] to prevent giant jumps when switching tabs
      const dtFactor = Math.min(2.5, Math.max(0.1, elapsed / 16.67));

      update(dtFactor);
      draw();

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [update, draw]
  );

  const init = useCallback(() => {
    stop(); // Strict protection against duplicate RAF loops!
    setupCanvas();
    bigBang();
    lastTimeRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [stop, setupCanvas, bigBang, animate]);

  // Event handlers
  const mouseHandler = useCallback(
    (event: MouseEvent) => {
      if (!mouseAdjust) return;
      const el = canvasRef.current?.parentElement;
      if (el) {
        cursor.current.x = event.pageX || event.clientX + el.scrollLeft - el.clientLeft;
        cursor.current.y = event.pageY || event.clientY + el.scrollTop - el.clientTop;
      }
    },
    [mouseAdjust]
  );

  const tiltHandler = useCallback(
    (event: DeviceOrientationEvent) => {
      if (!tiltAdjust) return;
      if (event.beta !== null && event.gamma !== null) {
        cursor.current.x = sd.current.x + event.gamma * 5;
        cursor.current.y = sd.current.y + event.beta * 5;
      }
    },
    [tiltAdjust]
  );

  const clickHandler = useCallback(
    (event: MouseEvent) => {
      if (!clickToWarp) return;
      if (event.type === "mousedown") {
        setLocalHyperspace(true);
      } else if (event.type === "mouseup") {
        setLocalHyperspace(false);
      }
    },
    [clickToWarp]
  );

  useEffect(() => {
    const el = canvasRef.current?.parentElement;

    if (mouseAdjust && el) {
      el.addEventListener("mousemove", mouseHandler);
    }
    if (tiltAdjust) {
      window.addEventListener("deviceorientation", tiltHandler);
    }
    if (clickToWarp && el) {
      el.addEventListener("mousedown", clickHandler);
      el.addEventListener("mouseup", clickHandler);
    }

    window.addEventListener("resize", handleResize);

    init();

    return () => {
      stop();
      window.removeEventListener("resize", handleResize);
      if (mouseAdjust && el) {
        el.removeEventListener("mousemove", mouseHandler);
      }
      if (tiltAdjust) {
        window.removeEventListener("deviceorientation", tiltHandler);
      }
      if (clickToWarp && el) {
        el.removeEventListener("mousedown", clickHandler);
        el.removeEventListener("mouseup", clickHandler);
      }
    };
  }, [
    mouseAdjust,
    tiltAdjust,
    clickToWarp,
    starColor,
    bgColor,
    handleResize,
    init,
    stop,
    mouseHandler,
    tiltHandler,
    clickHandler,
  ]);

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        ...style,
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
};

Starfield.propTypes = {
  starColor: PropTypes.string,
  bgColor: PropTypes.string,
  mouseAdjust: PropTypes.bool,
  tiltAdjust: PropTypes.bool,
  easing: PropTypes.number,
  clickToWarp: PropTypes.bool,
  hyperspace: PropTypes.bool,
  warpFactor: PropTypes.number,
  opacity: PropTypes.number,
  speed: PropTypes.number,
  quantity: PropTypes.number,
};

export { Starfield };
export default Starfield;
