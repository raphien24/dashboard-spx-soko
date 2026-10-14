import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  TrendingUp,
  ClipboardCheck,
  AlertTriangle,
  Zap,
  Package,
  ShieldCheck,
  Truck,
  Activity,
  GitMerge,
  Settings,
  X,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

const LandingPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef(null);

  // Get first name from user
  const firstName = user?.name?.split(' ')[0] || 'User';

  // Menu items from sidebar (main menus only)
  const planets = [
    {
      id: 'productivity',
      label: 'Productivity',
      icon: TrendingUp,
      color: 'from-green-400 to-emerald-600',
      solidColor: '#10b981',
      size: 'large',
      description: 'Monitor weekly and monthly productivity metrics',
      angle: 0,
      orbitRadius: 180,
      orbitTilt: 0.3, // Ellipse tilt for 3D effect
      defaultPage: 'productivity-dashboard',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: ClipboardCheck,
      color: 'from-blue-400 to-cyan-600',
      solidColor: '#3b82f6',
      size: 'medium',
      description: 'Track attendance and presence management',
      angle: 60,
      orbitRadius: 180,
      orbitTilt: 0.3,
      external: true,
      url: 'https://absensi.spxsoko.online/admin',
    },
    {
      id: 'punishment',
      label: 'Punishment',
      icon: AlertTriangle,
      color: 'from-red-400 to-orange-600',
      solidColor: '#ef4444',
      size: 'medium',
      description: 'Manage SP and punishment records',
      angle: 120,
      orbitRadius: 180,
      orbitTilt: 0.3,
      defaultPage: 'sp-generator',
    },
    {
      id: 'expedite',
      label: 'Expedite',
      icon: Zap,
      color: 'from-yellow-400 to-orange-500',
      solidColor: '#facc15',
      size: 'small',
      description: 'Fast track urgent packages',
      angle: 180,
      orbitRadius: 180,
      orbitTilt: 0.3,
      defaultPage: 'expedite',
    },
    {
      id: 'backlog-lm',
      label: 'Backlog LM',
      icon: Package,
      color: 'from-purple-400 to-pink-600',
      solidColor: '#a855f7',
      size: 'small',
      description: 'Monitor last mile backlog',
      angle: 240,
      orbitRadius: 180,
      orbitTilt: 0.3,
      defaultPage: 'backlog-lm',
    },
    {
      id: 'hse',
      label: 'HSE',
      icon: ShieldCheck,
      color: 'from-indigo-400 to-blue-600',
      solidColor: '#6366f1',
      size: 'medium',
      description: 'Health, Safety & Environment monitoring',
      angle: 300,
      orbitRadius: 180,
      orbitTilt: 0.3,
      defaultPage: 'hse-daily',
    },
    {
      id: 'buyer-rr',
      label: 'Buyer RR',
      icon: Truck,
      color: 'from-teal-400 to-cyan-600',
      solidColor: '#14b8a6',
      size: 'small',
      description: 'Buyer return tracking',
      angle: 30,
      orbitRadius: 280,
      orbitTilt: 0.35,
      defaultPage: 'buyer-rr',
    },
    {
      id: 'monitor-sdho',
      label: 'Monitor SDHO',
      icon: Activity,
      color: 'from-pink-400 to-rose-600',
      solidColor: '#ec4899',
      size: 'small',
      description: 'SDHO monitoring dashboard',
      angle: 90,
      orbitRadius: 280,
      orbitTilt: 0.35,
      defaultPage: 'monitor-sdho',
    },
    {
      id: 'control-stuck-fm',
      label: 'Stuck FM',
      icon: GitMerge,
      color: 'from-amber-400 to-orange-600',
      solidColor: '#f59e0b',
      size: 'small',
      description: 'Control stuck first mile packages',
      angle: 150,
      orbitRadius: 280,
      orbitTilt: 0.35,
      defaultPage: 'control-stuck-fm',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      color: 'from-gray-400 to-slate-600',
      solidColor: '#94a3b8',
      size: 'small',
      description: 'Application settings and preferences',
      angle: 210,
      orbitRadius: 280,
      orbitTilt: 0.35,
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

  // Rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Animated starfield background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Star {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speed = Math.random() * 0.3 + 0.05;
        this.opacity = Math.random();
      }

      update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
          this.y = 0;
          this.x = Math.random() * canvas.width;
        }
        this.opacity = Math.sin(Date.now() * 0.001 + this.x) * 0.5 + 0.5;
      }

      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const stars = Array.from({ length: 200 }, () => new Star());

    let animationFrameId;
    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
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
    <div className="min-h-screen overflow-hidden bg-slate-950 relative">
      {/* Animated Space Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(to bottom, #0f172a, #1e1b4b, #312e81)' }}
      />

      {/* Floating nebula effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl"
          style={{
            top: '20%',
            left: '10%',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            transition: 'transform 0.5s ease-out',
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"
          style={{
            bottom: '20%',
            right: '10%',
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
            transition: 'transform 0.5s ease-out',
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
        <div className="relative w-full max-w-5xl" style={{ height: '600px', perspective: '1200px' }}>
          <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
            
            {/* Orbit rings with 3D perspective */}
            <svg className="absolute inset-0 w-full h-full" style={{ transform: 'rotateX(60deg)' }}>
              {/* Inner orbit */}
              <ellipse
                cx="50%"
                cy="50%"
                rx="180"
                ry="54"
                fill="none"
                stroke="rgba(139, 92, 246, 0.2)"
                strokeWidth="2"
                strokeDasharray="8 4"
              />
              {/* Outer orbit */}
              <ellipse
                cx="50%"
                cy="50%"
                rx="280"
                ry="84"
                fill="none"
                stroke="rgba(99, 102, 241, 0.2)"
                strokeWidth="2"
                strokeDasharray="8 4"
              />
            </svg>

            {/* Sun (Center Logo) with 3D sphere effect */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 50 }}>
              <div 
                className="relative rounded-full shadow-2xl shadow-orange-500/50 flex items-center justify-center"
                style={{
                  width: '140px',
                  height: '140px',
                  background: 'radial-gradient(circle at 30% 30%, #fef3c7, #fbbf24, #f59e0b, #dc2626)',
                  animation: 'sunPulse 4s ease-in-out infinite',
                }}
              >
                {/* Inner glow */}
                <div 
                  className="absolute inset-4 rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, rgba(254, 243, 199, 0.9), transparent)',
                  }}
                />
                <span className="text-4xl font-bold text-white drop-shadow-2xl z-10" style={{ textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
                  SPX
                </span>
                
                {/* Sun corona */}
                <div className="absolute inset-0 rounded-full animate-ping" style={{ 
                  background: 'radial-gradient(circle, rgba(251, 191, 36, 0.4), transparent 70%)',
                  animationDuration: '3s'
                }} />
              </div>
            </div>

            {/* Planets with 3D sphere rendering */}
            {planets.map((planet) => {
              const Icon = planet.icon;
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
                    width: `${size.width}px`,
                    height: `${size.height}px`,
                    transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${pos.scale})`,
                    opacity: pos.opacity,
                    zIndex: Math.round(50 + pos.z),
                  }}
                >
                  {/* 3D Sphere with realistic shading */}
                  <div 
                    className="relative w-full h-full rounded-full transition-all duration-300 group-hover:scale-125"
                    style={{
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
                      className="absolute rounded-full"
                      style={{
                        top: '15%',
                        left: '20%',
                        width: '30%',
                        height: '30%',
                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6), transparent)',
                        filter: 'blur(4px)',
                      }}
                    />
                    
                    {/* Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon 
                        className="text-white drop-shadow-2xl group-hover:scale-110 transition-transform"
                        style={{ 
                          width: `${size.width * 0.4}px`, 
                          height: `${size.height * 0.4}px`,
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
                        }}
                      />
                    </div>

                    {/* Atmosphere glow */}
                    <div 
                      className="absolute inset-0 rounded-full group-hover:opacity-100 transition-opacity"
                      style={{
                        background: `radial-gradient(circle, transparent 60%, ${planet.solidColor}44 80%, transparent 100%)`,
                        filter: 'blur(8px)',
                        opacity: 0.6,
                      }}
                    />
                  </div>
                  
                  {/* Planet label */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-sm font-semibold text-white drop-shadow-lg bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                      {planet.label}
                    </span>
                  </div>

                  {/* Orbit trail indicator */}
                  <div 
                    className="absolute inset-0 rounded-full border-2 opacity-0 group-hover:opacity-50 transition-opacity"
                    style={{
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
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-slate-400 text-sm md:text-base">
            Klik pada planet untuk melihat detail menu
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
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${selectedPlanet.color} flex items-center justify-center shadow-2xl`}>
                {(() => {
                  const Icon = selectedPlanet.icon;
                  return <Icon className="w-12 h-12 text-white" />;
                })()}
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
