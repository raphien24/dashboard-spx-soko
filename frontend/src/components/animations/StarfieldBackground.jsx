import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Starfield Background Component (GPT-6 Astra Style)
 * Animated stars that move on scroll - only visible in dark mode
 */
const StarfieldBackground = () => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const scrollYRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };

    // Generate stars
    const generateStars = () => {
      const stars = [];
      const numStars = 150;

      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.3,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
          parallaxSpeed: Math.random() * 0.3 + 0.1,
        });
      }

      starsRef.current = stars;
    };

    // Draw stars
    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => {
        // Twinkle effect
        star.twinklePhase += star.twinkleSpeed;
        const opacity = star.opacity + Math.sin(star.twinklePhase) * 0.3;

        // Parallax effect based on scroll
        const parallaxY = star.y - scrollYRef.current * star.parallaxSpeed;

        // Only draw if in viewport
        if (parallaxY > -10 && parallaxY < window.innerHeight + 10) {
          ctx.beginPath();
          ctx.arc(star.x, parallaxY, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(147, 197, 253, ${opacity})`; // blue-300 color
          ctx.fill();

          // Add a subtle glow for larger stars
          if (star.radius > 1.2) {
            ctx.beginPath();
            ctx.arc(star.x, parallaxY, star.radius + 1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(147, 197, 253, ${opacity * 0.2})`;
            ctx.fill();
          }
        }
      });

      animationFrameId = requestAnimationFrame(drawStars);
    };

    // Handle scroll
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };

    // Initialize
    resizeCanvas();
    generateStars();
    drawStars();

    // Event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => {
      resizeCanvas();
      generateStars();
    });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none dark:opacity-100 opacity-0 transition-opacity duration-500"
      style={{ zIndex: 0 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    />
  );
};

export default StarfieldBackground;
