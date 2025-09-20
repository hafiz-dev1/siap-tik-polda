'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface ConstellationBackgroundProps {
  className?: string;
}

export default function ConstellationBackground({ className = '' }: ConstellationBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize stars
    const initStars = () => {
      const starCount = Math.floor((canvas.width * canvas.height) / 15000);
      starsRef.current = [];

      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    initStars();

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 2
      );
      
      // Check if dark mode is active
      const isDarkMode = document.documentElement.classList.contains('dark');
      
      if (isDarkMode) {
        gradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)'); // slate-900
        gradient.addColorStop(0.5, 'rgba(30, 41, 59, 0.9)'); // slate-800
        gradient.addColorStop(1, 'rgba(51, 65, 85, 0.85)'); // slate-700
      } else {
        gradient.addColorStop(0, 'rgba(241, 245, 249, 0.95)'); // slate-100
        gradient.addColorStop(0.5, 'rgba(248, 250, 252, 0.9)'); // slate-50
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.85)'); // white
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.001;

      // Update and draw stars
      starsRef.current.forEach((star, index) => {
        // Update position
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around edges
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        // Twinkling effect
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
        const currentOpacity = star.opacity * (0.3 + 0.7 * (twinkle + 1) / 2);

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        
        if (isDarkMode) {
          ctx.fillStyle = `rgba(147, 197, 253, ${currentOpacity})`; // blue-300
        } else {
          ctx.fillStyle = `rgba(79, 70, 229, ${currentOpacity})`; // indigo-600
        }
        
        ctx.fill();

        // Add glow effect for larger stars
        if (star.radius > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
          
          if (isDarkMode) {
            ctx.fillStyle = `rgba(147, 197, 253, ${currentOpacity * 0.1})`;
          } else {
            ctx.fillStyle = `rgba(79, 70, 229, ${currentOpacity * 0.1})`;
          }
          
          ctx.fill();
        }
      });

      // Draw connections between nearby stars
      const maxDistance = 120;
      const maxConnections = 3;

      starsRef.current.forEach((star, i) => {
        let connectionCount = 0;
        
        for (let j = i + 1; j < starsRef.current.length && connectionCount < maxConnections; j++) {
          const other = starsRef.current[j];
          const dx = star.x - other.x;
          const dy = star.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.3;
            
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(other.x, other.y);
            
            if (isDarkMode) {
              ctx.strokeStyle = `rgba(147, 197, 253, ${opacity})`; // blue-300
            } else {
              ctx.strokeStyle = `rgba(79, 70, 229, ${opacity})`; // indigo-600
            }
            
            ctx.lineWidth = 0.5;
            ctx.stroke();
            connectionCount++;
          }
        }
      });

      // Mouse interaction - highlight nearby stars
      const mouseDistance = 150;
      starsRef.current.forEach((star) => {
        const dx = star.x - mouseRef.current.x;
        const dy = star.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseDistance) {
          const intensity = (1 - distance / mouseDistance) * 0.5;
          
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
          
          if (isDarkMode) {
            ctx.fillStyle = `rgba(147, 197, 253, ${intensity})`;
          } else {
            ctx.fillStyle = `rgba(79, 70, 229, ${intensity})`;
          }
          
          ctx.fill();
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
}
