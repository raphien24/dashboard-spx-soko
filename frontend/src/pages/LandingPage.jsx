import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  X,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

const LandingPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [rotationSpeed, setRotationSpeed] = useState(0.15);
  const canvasRef = useRef(null);

  // Get first name from user
  const firstName = user?.name?.split(' ')[0] || 'User';

  // Menu items from sidebar (main menus only) - Mapped to real solar system planets
  const planets = [
    {
      id: 'productivity',
      label: 'Productivity',
      planetEmoji: '🌍', // Earth - hijau seperti produktivitas
      color: 'from-green-400 to-emerald-600',
      solidColor: '#10b981',
      size: 'large',
      description: 'Monitor weekly and monthly productivity metrics',
      angle: 0,
      orbitRadius: 200,
      orbitTilt: 0.25,
      defaultPage: 'productivity-dashboard',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      planetEmoji: '🪐', // Saturn - dengan cincin (structure)
      color: 'from-blue-400 to-cyan-600',
      solidColor: '#3b82f6',
      size: 'medium',
      description: 'Track attendance and presence management',
      angle: 60,
      orbitRadius: 200,
      orbitTilt: 0.25,
      external: true,
      url: 'https://absensi.spxsoko.online/admin',
    },
    {
      id: 'punishment',
      label: 'Punishment',
      planetEmoji: '🔴', // Mars - merah seperti warning
      color: 'from-red-400 to-orange-600',
      solidColor: '#ef4444',
      size: 'medium',
      description: 'Manage SP and punishment records',
      angle: 120,
      orbitRadius: 200,
      orbitTilt: 0.25,
      defaultPage: 'sp-generator',
    },
    {
      id: 'expedite',
      label: 'Expedite',
      planetEmoji: '☄️', // Comet - cepat
      color: 'from-yellow-400 to-orange-500',
      solidColor: '#facc15',
      size: 'small',
      description: 'Fast track urgent packages',
      angle: 180,
      orbitRadius: 200,
      orbitTilt: 0.25,
      defaultPage: 'expedite',
    },
    {
      id: 'backlog-lm',
      label: 'Backlog LM',
      planetEmoji: '🪨', // Asteroid - backlog items
      color: 'from-purple-400 to-pink-600',
      solidColor: '#a855f7',
      size: 'small',
      description: 'Monitor last mile backlog',
      angle: 240,
      orbitRadius: 200,
      orbitTilt: 0.25,
      defaultPage: 'backlog-lm',
    },
    {
      id: 'hse',
      label: 'HSE',
      planetEmoji: '🛡️', // Shield planet - safety
      color: 'from-indigo-400 to-blue-600',
      solidColor: '#6366f1',
      size: 'medium',
      description: 'Health, Safety & Environment monitoring',
      angle: 300,
      orbitRadius: 200,
      orbitTilt: 0.25,
      defaultPage: 'hse-daily',
    },
    {
      id: 'buyer-rr',
      label: 'Buyer RR',
      planetEmoji: '🌕', // Moon - return tracking
      color: 'from-teal-400 to-cyan-600',
      solidColor: '#14b8a6',
      size: 'small',
      description: 'Buyer return tracking',
      angle: 30,
      orbitRadius: 300,
      orbitTilt: 0.3,
      defaultPage: 'buyer-rr',
    },
    {
      id: 'monitor-sdho',
      label: 'Monitor SDHO',
      planetEmoji: '🔵', // Neptune - biru monitoring
      color: 'from-pink-400 to-rose-600',
      solidColor: '#ec4899',
      size: 'small',
      description: 'SDHO monitoring dashboard',
      angle: 90,
      orbitRadius: 300,
      orbitTilt: 0.3,
      defaultPage: 'monitor-sdho',
    },
    {
      id: 'control-stuck-fm',
      label: 'Stuck FM',
      planetEmoji: '🟠', // Jupiter - besar, control
      color: 'from-amber-400 to-orange-600',
      solidColor: '#f59e0b',
      size: 'small',
      description: 'Control stuck first mile packages',
      angle: 150,
      orbitRadius: 300,
      orbitTilt: 0.3,
      defaultPage: 'control-stuck-fm',
    },
    {
      id: 'settings',
      label: 'Settings',
      planetEmoji: '⚙️', // Gear - settings
      color: 'from-gray-400 to-slate-600',
      solidColor: '#94a3b8',
      size: 'small',
      description: 'Application settings and preferences',
      angle: 210,
      orbitRadius: 300,
      orbitTilt: 0.3,
      defaultPage: 'whitelist-settings',
    },
  ];

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Mouse wheel to control rotation speed
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      setRotation((prev) => {
        const delta = e.deltaY > 0 ? 5 : -5; // Scroll down = forward, scroll up = backward
        return (prev + delta) % 360;
      });
    };

    const container = document.getElementById('solar-system-container');
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  // Auto rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + rotationSpeed) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [rotationSpeed]);

  // Animated nebula and cosmic effects (no falling stars)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Static stars (not falling)
    class Star {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5;
        this.brightness = Math.random();
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
      }

      update() {
        // Twinkle effect only
        this.brightness += this.twinkleSpeed;
        if (this.brightness > 1 || this.brightness < 0) {
          this.twinkleSpeed = -this.twinkleSpeed;
        }
      }

      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const stars = Array.from({ length: 300 }, () => new Star());

    let animationFrameId;
    const animate = () => {
      // Don't clear canvas completely - create nebula trail effect
      ctx.fillStyle = 'rgba(10, 10, 30, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.update();
        star.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handlePlanetClick = (planet) => {
    setSelectedPlanet(planet);
  };

  const handleNavigateTo = (planet) => {
    if (planet.external && planet.url) {
      window.open(planet.url, '_blank', 'noopener,noreferrer');
    } else if (planet.defaultPage && onNavigate) {
      onNavigate(planet.defaultPage);
    }
    setSelectedPlanet(null);
  };

  const getPlanetSize = (size) => {
    switch (size) {
      case 'large': return { width: 100, height: 100 };
      case 'medium': return { width: 80, height: 80 };
      case 'small': return { width: 60, height: 60 };
      default: return { width: 80, height: 80 };
    }
  };

  // Calculate 3D position with perspective
  const calculate3DPosition = (angle, radius, tilt) => {
    const rad = (angle + rotation) * (Math.PI / 180);
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius * tilt; // Apply tilt for elliptical orbit
    const z = Math.sin(rad) * radius * (1 - tilt); // Depth for 3D effect
    
    // Scale based on Z position (closer = bigger)
    const scale = 1 + (z / radius) * 0.3;
    const opacity = 0.6 + (z / radius) * 0.4;
    
    return { x, y, scale, opacity, z };
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Real Space Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2013&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Animated Canvas Layer (stars twinkling only) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ 
          mixBlendMode: 'screen',
          opacity: 0.6
        }}
      />

      {/* Animated nebula clouds */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Purple nebula */}
        <div
          className="absolute w-[1000px] h-[1000px] rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4), transparent 70%)',
            top: '10%',
            left: '5%',
            transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)`,
            transition: 'transform 0.8s ease-out',
            animation: 'nebulaPulse 15s ease-in-out infinite',
          }}
        />
        {/* Blue nebula */}
        <div
          className="absolute w-[800px] h-[800px] rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4), transparent 70%)',
            bottom: '10%',
            right: '10%',
            transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`,
            transition: 'transform 0.8s ease-out',
            animation: 'nebulaPulse 18s ease-in-out infinite 5s',
          }}
        />
        {/* Pink nebula */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4), transparent 70%)',
            top: '40%',
            right: '20%',
            transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`,
            transition: 'transform 0.8s ease-out',
            animation: 'nebulaPulse 20s ease-in-out infinite 10s',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Welcome Message */}
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Selamat Datang di Dashboard
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            SPX SOKO
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 mt-4">
            {firstName} 👋
          </p>
          <p className="text-sm md:text-base text-slate-400 mt-2">
            Pilih menu untuk memulai
          </p>
        </div>

        {/* Solar System with 3D Perspective */}
        <div 
          id="solar-system-container"
          className="relative w-full max-w-5xl cursor-grab active:cursor-grabbing" 
          style={{ height: '600px', perspective: '1200px' }}
        >
          <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
            
            {/* Orbit rings with 3D perspective - More vertical angle */}
            <svg className="absolute inset-0 w-full h-full" style={{ transform: 'rotateX(75deg)' }}>
              {/* Inner orbit */}
              <ellipse
                cx="50%"
                cy="50%"
                rx="200"
                ry="50"
                fill="none"
                stroke="rgba(139, 92, 246, 0.3)"
                strokeWidth="2"
                strokeDasharray="8 4"
              />
              {/* Outer orbit */}
              <ellipse
                cx="50%"
                cy="50%"
                rx="300"
                ry="75"
                fill="none"
                stroke="rgba(99, 102, 241, 0.3)"
                strokeWidth="2"
                strokeDasharray="8 4"
              />
            </svg>

            {/* Sun (Center Logo) with 3D sphere effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 100 }}>
              <div 
                className="relative rounded-full shadow-2xl shadow-orange-500/50 flex items-center justify-center pointer-events-none"
                style={{
                  width: '140px',
                  height: '140px',
                  background: 'radial-gradient(circle at 30% 30%, #fef3c7, #fbbf24, #f59e0b, #dc2626)',
                  animation: 'sunPulse 4s ease-in-out infinite',
                }}
              >
                {/* Inner glow */}
                <div 
                  className="absolute inset-4 rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, rgba(254, 243, 199, 0.9), transparent)',
                  }}
                />
                <span className="text-4xl font-bold text-white drop-shadow-2xl z-10 pointer-events-none" style={{ textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
                  SPX
                </span>
                
                {/* Sun corona */}
                <div className="absolute inset-0 rounded-full animate-ping pointer-events-none" style={{ 
                  background: 'radial-gradient(circle, rgba(251, 191, 36, 0.4), transparent 70%)',
                  animationDuration: '3s'
                }} />
              </div>
            </div>

            {/* Planets with 3D sphere rendering */}
            {planets.map((planet) => {
              const pos = calculate3DPosition(planet.angle, planet.orbitRadius, planet.orbitTilt);
              const size = getPlanetSize(planet.size);

              return (
                <button
                  key={planet.id}
                  onClick={() => handlePlanetClick(planet)}
                  className="absolute cursor-pointer group transition-all duration-300"
                  style={{
                    left: '50%',
                    top: '50%',
                    // Make hitbox larger for easier clicking
                    width: `${size.width * 1.5}px`,
                    height: `${size.height * 1.5}px`,
                    transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${pos.scale})`,
                    opacity: pos.opacity,
                    zIndex: Math.round(50 + pos.z),
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {/* Invisible larger hitbox */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* 3D Sphere with realistic shading - centered in hitbox */}
                    <div 
                      className="relative rounded-full transition-all duration-300 group-hover:scale-110"
                      style={{
                        width: `${size.width}px`,
                        height: `${size.height}px`,
                        background: `radial-gradient(circle at 35% 35%, ${planet.solidColor}dd, ${planet.solidColor}88, ${planet.solidColor}44)`,
                        boxShadow: `
                          inset -8px -8px 20px rgba(0, 0, 0, 0.4),
                          inset 4px 4px 12px rgba(255, 255, 255, 0.3),
                          0 8px 32px ${planet.solidColor}88,
                          0 0 60px ${planet.solidColor}44
                        `,
                      }}
                    >
                      {/* Specular highlight */}
                      <div 
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          top: '15%',
                          left: '20%',
                          width: '30%',
                          height: '30%',
                          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6), transparent)',
                          filter: 'blur(4px)',
                        }}
                      />
                      
                      {/* Planet Emoji */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span 
                          className="group-hover:scale-110 transition-transform"
                          style={{ 
                            fontSize: `${size.width * 0.5}px`,
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
                          }}
                        >
                          {planet.planetEmoji}
                        </span>
                      </div>

                      {/* Atmosphere glow */}
                      <div 
                        className="absolute inset-0 rounded-full group-hover:opacity-100 transition-opacity pointer-events-none"
                        style={{
                          background: `radial-gradient(circle, transparent 60%, ${planet.solidColor}44 80%, transparent 100%)`,
                          filter: 'blur(8px)',
                          opacity: 0.6,
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Planet label - ALWAYS VISIBLE */}
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap transition-all pointer-events-none"
                    style={{
                      bottom: `${-size.height * 0.3}px`, // Position based on planet size
                    }}
                  >
                    <span className="text-xs font-semibold text-white drop-shadow-lg bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20 group-hover:bg-black/70 group-hover:scale-110">
                      {planet.label}
                    </span>
                  </div>

                  {/* Orbit trail indicator - Only on hover */}
                  <div 
                    className="absolute rounded-full border-2 opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none"
                    style={{
                      inset: '25%', // Centered within the hitbox
                      borderColor: planet.solidColor,
                      transform: 'scale(1.3)',
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Instruction Text */}
        <div className="mt-12 md:mt-16 text-center space-y-2">
          <p className="text-slate-400 text-sm md:text-base">
            Klik pada planet untuk melihat detail menu
          </p>
          <p className="text-slate-500 text-xs md:text-sm">
            💡 Scroll mouse untuk mengontrol rotasi planet
          </p>
        </div>
      </div>

      {/* Planet Detail Modal */}
      {selectedPlanet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-w-md w-full p-8 relative animate-scaleIn">
            {/* Close button */}
            <button
              onClick={() => setSelectedPlanet(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Planet icon */}
            <div className="flex justify-center mb-6">
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${selectedPlanet.color} flex items-center justify-center shadow-2xl relative`}
                style={{
                  boxShadow: `
                    inset -8px -8px 20px rgba(0, 0, 0, 0.3),
                    inset 4px 4px 12px rgba(255, 255, 255, 0.3),
                    0 8px 32px ${selectedPlanet.solidColor}88
                  `,
                }}
              >
                <span className="text-6xl">{selectedPlanet.planetEmoji}</span>
              </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-bold text-white">
                {selectedPlanet.label}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {selectedPlanet.description}
              </p>

              {/* Action button */}
              <button
                onClick={() => handleNavigateTo(selectedPlanet)}
                className={`
                  w-full mt-6 px-6 py-3 rounded-xl
                  bg-gradient-to-r ${selectedPlanet.color}
                  text-white font-semibold
                  hover:shadow-2xl hover:scale-105
                  transition-all duration-300
                  flex items-center justify-center gap-2
                `}
              >
                {selectedPlanet.external ? (
                  <>
                    <span>Buka Link</span>
                    <ExternalLink className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <span>Lihat Selengkapnya</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes sunPulse {
          0%, 100% { 
            transform: scale(1);
            filter: brightness(1);
          }
          50% { 
            transform: scale(1.05);
            filter: brightness(1.1);
          }
        }
        @keyframes nebulaPulse {
          0%, 100% {
            opacity: 0.15;
            transform: scale(1);
          }
          50% {
            opacity: 0.25;
            transform: scale(1.1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
