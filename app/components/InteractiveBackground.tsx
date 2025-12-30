"use client";

import { useEffect, useRef } from "react";

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseRadius: number;
      color: string;
      opacity: number;
    }> = [];

    // Create particles with theme colors
    const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < particleCount; i++) {
      // Use blue tones matching the theme
      const blueValue = Math.random() * 50 + 100; // 100-150 range for light blue
      const opacity = Math.random() * 0.3 + 0.2; // Subtle opacity
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2.5 + 1.5,
        baseRadius: Math.random() * 2.5 + 1.5,
        color: `rgba(59, 130, 246, ${opacity})`, // Blue-500 with varying opacity
        opacity: opacity
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background matching theme
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f0f9ff');
      gradient.addColorStop(1, '#ffffff');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Mouse interaction
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200;

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          const angle = Math.atan2(dy, dx);
          particle.vx -= Math.cos(angle) * force * 0.02;
          particle.vy -= Math.sin(angle) * force * 0.02;
          particle.radius = particle.baseRadius + force * 2;
        } else {
          particle.radius = particle.baseRadius;
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges with damping
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.8;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.8;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        // Velocity damping
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Draw particle with subtle glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 2.5
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(0.5, `rgba(59, 130, 246, ${particle.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw connections
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxConnectionDistance = 180;

          if (distance < maxConnectionDistance) {
            const opacity = (1 - distance / maxConnectionDistance) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`; // Blue connections
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
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
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

