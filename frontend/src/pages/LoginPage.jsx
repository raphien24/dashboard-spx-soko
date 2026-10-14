import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 px-4">
      {/* Starfield background for dark mode */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Could add starfield here if needed */}
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
              SPX SOKO
            </h1>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              Productivity Dashboard
            </p>
          </div>

          {/* Description */}
          <div className="mb-6 text-center">
            <p className="text-gray-700 dark:text-slate-300 text-sm">
              Sign in with your Google Workspace account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                  Login Failed
                </p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="flex justify-center mb-6">
            <div id="googleSignInButton"></div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600"></div>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
                Signing you in...
              </p>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <strong>Note:</strong> Only authorized users can access this dashboard.
                Contact your administrator if you need access.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500 dark:text-slate-500">
            © 2026 SPX SOKO • Secure Login
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
