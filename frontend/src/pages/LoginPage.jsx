import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, AlertCircle, Rocket, TrendingUp, Users, BarChart3, Zap } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  // Mouse tracking for interactive effects
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

  // Animated space background with stars
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
        this.speed = Math.random() * 0.5 + 0.1;
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

    const stars = Array.from({ length: 150 }, () => new Star());

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

  useEffect(() => {
    // Load Google Identity Services
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the button
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          {
            theme: 'outline',
            size: 'large',
            width: 350,
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          }
        );

        // Also show the One Tap prompt
        window.google.accounts.id.prompt();
      }
    };

    loadGoogleScript();
  }, []);

  const handleCredentialResponse = async (response) => {
    setIsLoading(true);
    setError('');

    try {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      // Check if it's a Google Workspace email
      const email = payload.email;
      const emailDomain = email.split('@')[1];
      
      // Optional: Restrict to specific domain if needed
      // if (emailDomain !== 'spxsoko.online') {
      //   throw new Error('Please use your SPX SOKO workspace email');
      // }

      const userData = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified,
      };

      const result = await login(userData);

      if (!result.success) {
        setError(result.error || 'Login failed. Your email is not authorized.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
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

      {/* Floating planets/orbs with mouse parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          style={{
            top: '10%',
            left: '5%',
            transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        <div
          className="absolute w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
          style={{
            bottom: '15%',
            right: '10%',
            transform: `translate(${mousePosition.x * -0.03}px, ${mousePosition.y * -0.03}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        <div
          className="absolute w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 lg:px-8">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - App Description */}
          <div className="hidden lg:block space-y-8 text-white">
            {/* Main Title with gradient */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20">
                <Rocket className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-300">Welcome to SPX SOKO</span>
              </div>
              
              <h1 className="text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                  Courier Productivity
                </span>
                <br />
                <span className="text-white">Dashboard</span>
              </h1>
              
              <p className="text-xl text-slate-300 leading-relaxed max-w-xl">
                Monitor, analyze, and optimize your courier team's performance in real-time with powerful insights and actionable metrics.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-4 max-w-2xl">
              <div
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                style={{
                  transform: `translateY(${mousePosition.y * 0.01}px)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                <TrendingUp className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-2">Real-time Metrics</h3>
                <p className="text-sm text-slate-400">Track KPIs and performance instantly</p>
              </div>

              <div
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                style={{
                  transform: `translateY(${mousePosition.y * -0.01}px)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                <Users className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-2">Team Overview</h3>
                <p className="text-sm text-slate-400">Monitor all couriers at a glance</p>
              </div>

              <div
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                style={{
                  transform: `translateY(${mousePosition.y * 0.015}px)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                <BarChart3 className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-2">Analytics</h3>
                <p className="text-sm text-slate-400">Deep insights into operations</p>
              </div>

              <div
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                style={{
                  transform: `translateY(${mousePosition.y * -0.015}px)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                <Zap className="w-8 h-8 text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-2">Fast & Reliable</h3>
                <p className="text-sm text-slate-400">Lightning-fast data updates</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-4xl font-bold text-white">250+</div>
                <div className="text-sm text-slate-400">Active Couriers</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white">95%</div>
                <div className="text-sm text-slate-400">On-time Delivery</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white">24/7</div>
                <div className="text-sm text-slate-400">Real-time Tracking</div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="flex items-center justify-center lg:justify-end">
            <div
              className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-10"
              style={{
                transform: `perspective(1000px) rotateY(${(mousePosition.x - 50) * 0.02}deg) rotateX(${(mousePosition.y - 50) * -0.02}deg)`,
                transition: 'transform 0.3s ease-out',
              }}
            >
              {/* Logo & Title */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mb-4 shadow-lg shadow-indigo-500/50 animate-pulse">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Welcome Back
                </h2>
                <p className="text-slate-300 text-sm">
                  Sign in to access your dashboard
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3 backdrop-blur-xl animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-200 font-medium">
                      Login Failed
                    </p>
                    <p className="text-xs text-red-300 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Google Sign In Button */}
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div
                    id="googleSignInButton"
                    className="w-full flex justify-center"
                  ></div>
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500/30 border-t-indigo-500"></div>
                    <p className="text-sm text-slate-300 mt-3">
                      Authenticating...
                    </p>
                  </div>
                )}

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900/50 px-2 text-slate-400">Secure Login</span>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 backdrop-blur-xl">
                  <p className="text-xs text-blue-200 leading-relaxed">
                    <strong className="text-blue-100">Note:</strong> Only authorized users can access this dashboard.
                    Contact your administrator if you need access.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile - App Description */}
      <div className="lg:hidden relative z-10 px-4 pb-12 text-white text-center">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
          SPX SOKO Dashboard
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Monitor and optimize your courier team's performance with real-time insights
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <p className="text-xs text-slate-500">
          © 2026 SPX SOKO • Secure Authentication
        </p>
      </div>

      {/* Custom CSS for shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
