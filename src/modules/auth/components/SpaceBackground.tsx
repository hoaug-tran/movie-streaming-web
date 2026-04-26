"use client";

import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";

interface WarpStar {
  x: number;
  y: number;
  z: number;
  pz: number;
  size: number;
  hue: number;
  alpha: number;
}

interface BackgroundStar {
  x: number;
  y: number;
  r: number;
  hue: number;
  alpha: number;
  twinkleOffset: number;
  twinkleSpeed: number;
}

interface Nebula {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rotation: number;
  hue: number;
  alpha: number;
  blur: number;
}

interface Planet {
  x: number;
  y: number;
  radius: number;
  hue: number;
  alpha: number;
  ring: boolean;
}

export const SpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let time = 0;
    let speed = 7.5;

    let warpStars: WarpStar[] = [];
    let backgroundStars: BackgroundStar[] = [];
    let nebulas: Nebula[] = [];
    let planets: Planet[] = [];

    const random = (min: number, max: number) => Math.random() * (max - min) + min;
    const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

    const palette = [190, 205, 220, 260, 280, 320, 35, 45];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initScene();
    };

    const createWarpStar = (): WarpStar => ({
      x: random(-width, width),
      y: random(-height, height),
      z: random(1, width * 1.4),
      pz: random(1, width * 1.4),
      size: random(0.6, 2.2),
      hue: pick(palette),
      alpha: random(0.65, 1),
    });

    const createBackgroundStar = (): BackgroundStar => ({
      x: random(0, width),
      y: random(0, height),
      r: random(0.5, 1.8),
      hue: pick(palette),
      alpha: random(0.2, 0.85),
      twinkleOffset: random(0, Math.PI * 2),
      twinkleSpeed: random(0.0015, 0.005),
    });

    const createNebula = (): Nebula => ({
      x: random(width * 0.05, width * 0.95),
      y: random(height * 0.05, height * 0.95),
      rx: random(width * 0.12, width * 0.24),
      ry: random(height * 0.08, height * 0.18),
      rotation: random(0, Math.PI * 2),
      hue: pick([190, 220, 260, 290, 320, 25]),
      alpha: random(0.04, 0.1),
      blur: random(40, 90),
    });

    const createPlanet = (main: boolean): Planet => ({
      x: main ? random(width * 0.08, width * 0.22) : random(width * 0.74, width * 0.9),
      y: main ? random(height * 0.12, height * 0.3) : random(height * 0.68, height * 0.86),
      radius: main ? random(34, 70) : random(16, 34),
      hue: pick([200, 230, 265, 285, 20]),
      alpha: main ? 0.9 : 0.8,
      ring: Math.random() > 0.45,
    });

    const initScene = () => {
      const warpCount = Math.floor((width * height) / 2200);
      const backgroundCount = Math.floor((width * height) / 12000);

      warpStars = Array.from({ length: warpCount }, createWarpStar);
      backgroundStars = Array.from({ length: backgroundCount }, createBackgroundStar);
      nebulas = Array.from({ length: 6 }, createNebula);
      planets = [createPlanet(true), createPlanet(false)];
    };

    const resetWarpStar = (star: WarpStar) => {
      star.x = random(-width, width);
      star.y = random(-height, height);
      star.z = width * 1.4;
      star.pz = star.z;
      star.size = random(0.6, 2.2);
      star.hue = pick(palette);
      star.alpha = random(0.65, 1);
    };

    const drawBackground = () => {
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, "#02030a");
      bg.addColorStop(0.35, "#040713");
      bg.addColorStop(0.72, "#03050f");
      bg.addColorStop(1, "#010206");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.48,
        Math.min(width, height) * 0.05,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(0.62, "rgba(0,0,0,0.22)");
      vignette.addColorStop(1, "rgba(0,0,0,0.72)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };

    const drawNebulas = () => {
      ctx.save();

      for (let i = 0; i < nebulas.length; i++) {
        const nebula = nebulas[i];

        ctx.save();
        ctx.translate(nebula.x, nebula.y);
        ctx.rotate(nebula.rotation + Math.sin(time * 0.00006 + i) * 0.02);
        ctx.filter = `blur(${nebula.blur}px)`;

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, nebula.rx);
        gradient.addColorStop(0, `hsla(${nebula.hue}, 90%, 62%, ${nebula.alpha})`);
        gradient.addColorStop(0.35, `hsla(${nebula.hue + 18}, 85%, 52%, ${nebula.alpha * 0.65})`);
        gradient.addColorStop(0.72, `hsla(${nebula.hue + 42}, 70%, 32%, ${nebula.alpha * 0.2})`);
        gradient.addColorStop(1, `hsla(${nebula.hue + 60}, 50%, 12%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, nebula.rx, nebula.ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
      ctx.filter = "none";
    };

    const drawBackgroundStars = () => {
      for (const star of backgroundStars) {
        const pulse = 0.82 + 0.18 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.alpha * pulse;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = `hsl(${star.hue}, 85%, 78%)`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();

        if (star.r > 1.2 && pulse > 0.94) {
          ctx.globalAlpha = alpha * 0.18;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
    };

    const drawPlanets = () => {
      planets.forEach((planet, index) => {
        const glow = ctx.createRadialGradient(
          planet.x - planet.radius * 0.3,
          planet.y - planet.radius * 0.35,
          planet.radius * 0.08,
          planet.x,
          planet.y,
          planet.radius * 1.8
        );
        glow.addColorStop(0, `hsla(${planet.hue}, 95%, 78%, ${planet.alpha})`);
        glow.addColorStop(0.4, `hsla(${planet.hue + 10}, 85%, 46%, ${planet.alpha})`);
        glow.addColorStop(1, `hsla(${planet.hue + 28}, 70%, 12%, 0)`);

        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius * 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const surface = ctx.createRadialGradient(
          planet.x - planet.radius * 0.35,
          planet.y - planet.radius * 0.45,
          planet.radius * 0.1,
          planet.x,
          planet.y,
          planet.radius
        );
        surface.addColorStop(0, `hsla(${planet.hue}, 95%, 80%, ${planet.alpha})`);
        surface.addColorStop(0.35, `hsla(${planet.hue + 10}, 80%, 56%, ${planet.alpha})`);
        surface.addColorStop(0.72, `hsla(${planet.hue + 22}, 70%, 28%, ${planet.alpha})`);
        surface.addColorStop(1, `hsla(${planet.hue + 40}, 60%, 12%, ${planet.alpha})`);

        ctx.save();
        ctx.fillStyle = surface;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
        ctx.fill();

        if (planet.ring) {
          ctx.translate(planet.x, planet.y);
          ctx.rotate(index === 0 ? -0.32 : 0.48);
          ctx.strokeStyle = `hsla(${planet.hue + 24}, 85%, 82%, 0.28)`;
          ctx.lineWidth = Math.max(1, planet.radius * 0.08);
          ctx.beginPath();
          ctx.ellipse(0, 0, planet.radius * 1.55, planet.radius * 0.34, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      });
    };

    const drawWarpStars = () => {
      const cx = width / 2;
      const cy = height / 2;

      for (const star of warpStars) {
        star.pz = star.z;
        star.z -= speed;

        if (star.z <= 1) {
          resetWarpStar(star);
        }

        const sx = (star.x / star.z) * width + cx;
        const sy = (star.y / star.z) * height + cy;

        const px = (star.x / star.pz) * width + cx;
        const py = (star.y / star.pz) * height + cy;

        if (sx < -100 || sx > width + 100 || sy < -100 || sy > height + 100) {
          resetWarpStar(star);
          continue;
        }

        const depth = 1 - star.z / (width * 1.4);
        const lineAlpha = Math.max(0.18, depth * star.alpha);
        const radius = Math.max(0.4, star.size * depth * 2.2);

        const gradient = ctx.createLinearGradient(px, py, sx, sy);
        gradient.addColorStop(0, `hsla(${star.hue}, 90%, 70%, 0)`);
        gradient.addColorStop(1, `hsla(${star.hue}, 95%, 78%, ${lineAlpha})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = Math.max(0.35, depth * 2.2);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        ctx.globalAlpha = Math.min(1, lineAlpha + 0.12);
        ctx.fillStyle = `hsl(${star.hue}, 95%, 82%)`;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();

        if (depth > 0.75) {
          ctx.globalAlpha = lineAlpha * 0.18;
          ctx.beginPath();
          ctx.arc(sx, sy, radius * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
    };

    const drawCenterGlow = () => {
      const glow = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.min(width, height) * 0.22
      );
      glow.addColorStop(0, "rgba(180, 220, 255, 0.04)");
      glow.addColorStop(0.5, "rgba(160, 120, 255, 0.03)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    };

    const animate = () => {
      time += 16;

      drawBackground();
      drawNebulas();
      drawBackgroundStars();
      drawPlanets();
      drawWarpStars();
      drawCenterGlow();

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      resize();
    };

    resize();

    drawBackground();
    drawNebulas();
    drawBackgroundStars();
    drawPlanets();
    drawWarpStars();
    drawCenterGlow();

    requestAnimationFrame(animate);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <Box
      component="canvas"
      ref={canvasRef}
      sx={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
};
