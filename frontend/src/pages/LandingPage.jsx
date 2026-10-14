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
      size: 'large',
      description: 'Monitor weekly and monthly productivity metrics',
      angle: 0,
      distance: 280,
      defaultPage: 'productivity-dashboard',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: ClipboardCheck,
      color: 'from-blue-400 to-cyan-600',
      size: 'medium',
      description: 'Track attendance and presence management',
      angle: 60,
      distance: 280,
      external: true,
      url: 'https://absensi.spxsoko.online/admin',
    },
    {
      id: 'punishment',
      label: 'Punishment',
      icon: AlertTriangle,
      color: 'from-red-400 to-orange-600',
      size: 'medium',
      description: 'Manage SP and punishment records',
      angle: 120,
      distance: 280,
      defaultPage: 'sp-generator',
    },
    {
      id: 'expedite',
      label: 'Expedite',
      icon: Zap,
      color: 'from-yellow-400 to-orange-500',
      size: 'small',
      description: 'Fast track urgent packages',
      angle: 180,
      distance: 280,
      defaultPage: 'expedite',
    },
    {
      id: 'backlog-lm',
      label: 'Backlog LM',
      icon: Package,
      color: 'from-purple-400 to-pink-600',
      size: 'small',
      description: 'Monitor last mile backlog',
      angle: 240,
      distance: 280,
      defaultPage: 'backlog-lm',
    },
    {
      id: 'hse',
      label: 'HSE',
      icon: ShieldCheck,
      color: 'from-indigo-400 to-blue-600',
      size: 'medium',
      description: 'Health, Safety & Environment monitoring',
      angle: 300,
      distance: 280,
      defaultPage: 'hse-daily',
    },
    {
      id: 'buyer-rr',
      label: 'Buyer RR',
      icon: Truck,
      color: 'from-teal-400 to-cyan-600',
      size: 'small',
      description: 'Buyer return tracking',
      angle: 30,
      distance: 380,
      defaultPage: 'buyer-rr',
    },
    {
      id: 'monitor-sdho',
      label: 'Monitor SDHO',
      icon: Activity,
      color: 'from-pink-400 to-rose-600',
      size: 'small',
      description: 'SDHO monitoring dashboard',
      angle: 90,
      distance: 380,
      defaultPage: 'monitor-sdho',
    },
    {
      id: 'control-stuck-fm',
      label: 'Stuck FM',
      icon: GitMerge,
      color: 'from-amber-400 to-orange-600',
      size: 'small',
      description: 'Control stuck first mile packages',
      angle: 150,
      distance: 380,
      defaultPage: 'control-stuck-fm',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      color: 'from-gray-400 to-slate-600',
      size: 'small',
      description: 'Application settings and preferences',
      angle: 210,
      distance: 380,
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

  const getSizeClass = (size) => {
    switch (size) {
      case 'large': return 'w-24 h-24 md:w-32 md:h-32';
      case 'medium': return 'w-20 h-20 md:w-24 md:h-24';
      case 'small': return 'w-16 h-16 md:w-20 md:h-20';
      default: return 'w-20 h-20 md:w-24 md:h-24';
    }
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

        {/* Solar System */}
        <div className="relative w-full max-w-4xl aspect-square flex items-center justify-center">
          {/* Orbit rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[560px] h-[560px] md:w-[760px] md:h-[760px] border border-indigo-500/20 rounded-full" />
            <div className="absolute w-[360px] h-[360px] md:w-[560px] md:h-[560px] border border-purple-500/20 rounded-full" />
          </div>

          {/* Sun (Center Logo) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 shadow-2xl shadow-orange-500/50 animate-pulse flex items-center justify-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-yellow-200 to-orange-300 flex items-center justify-center">
                <span className="text-3xl md:text-5xl font-bold text-orange-900">SPX</span>
              </div>
            </div>
          </div>

          {/* Planets */}
          {planets.map((planet, index) => {
            const Icon = planet.icon;
            const angle = (planet.angle + rotation) * (Math.PI / 180);
            const x = Math.cos(angle) * planet.distance;
            const y = Math.sin(angle) * planet.distance;

            return (
              <button
                key={planet.id}
                onClick={() => handlePlanetClick(planet)}
                className={`
                  absolute ${getSizeClass(planet.size)}
                  bg-gradient-to-br ${planet.color}
                  rounded-full shadow-2xl
                  flex items-center justify-center
                  cursor-pointer
                  transform hover:scale-125 transition-all duration-300
                  group
                  border-4 border-white/20
                `}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                <Icon className="w-8 h-8 md:w-12 md:h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
                
                {/* Planet label */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm md:text-base font-semibold text-white drop-shadow-lg bg-black/50 px-3 py-1 rounded-full">
                    {planet.label}
                  </span>
                </div>

                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${planet.color} blur-xl opacity-50 group-hover:opacity-75 transition-opacity -z-10`} />
              </button>
            );
          })}
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
