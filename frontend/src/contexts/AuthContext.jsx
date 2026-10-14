import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [whitelist, setWhitelist] = useState([]);

  // Load whitelist from localStorage
  useEffect(() => {
    const savedWhitelist = localStorage.getItem('spx_whitelist');
    if (savedWhitelist) {
      try {
        setWhitelist(JSON.parse(savedWhitelist));
      } catch (e) {
        console.error('Failed to parse whitelist:', e);
        // Default whitelist if parsing fails
        const defaultList = ['rafi.alvian@spxexpress.com', 'admin@spxsoko.online'];
        setWhitelist(defaultList);
        localStorage.setItem('spx_whitelist', JSON.stringify(defaultList));
      }
    } else {
      // Set default whitelist
      const defaultList = ['rafi.alvian@spxexpress.com', 'admin@spxsoko.online'];
      setWhitelist(defaultList);
      localStorage.setItem('spx_whitelist', JSON.stringify(defaultList));
    }
  }, []);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('spx_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (e) {
        console.error('Failed to parse user data:', e);
        localStorage.removeItem('spx_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (googleUser) => {
    try {
      const email = googleUser.email;
      const name = googleUser.name;
      const picture = googleUser.picture;

      // Get current whitelist (check localStorage directly to ensure it's initialized)
      let currentWhitelist = whitelist;
      if (currentWhitelist.length === 0) {
        const savedWhitelist = localStorage.getItem('spx_whitelist');
        if (savedWhitelist) {
          currentWhitelist = JSON.parse(savedWhitelist);
        } else {
          // Initialize default whitelist if not exists
          currentWhitelist = ['rafi.alvian@spxexpress.com', 'admin@spxsoko.online'];
          localStorage.setItem('spx_whitelist', JSON.stringify(currentWhitelist));
          setWhitelist(currentWhitelist);
        }
      }

      // Debug logging
      console.log('=== LOGIN DEBUG ===');
      console.log('Email attempting login:', email);
      console.log('Current whitelist:', currentWhitelist);
      console.log('Is whitelisted?', currentWhitelist.includes(email));
      console.log('==================');

      // Check if email is in whitelist
      if (!currentWhitelist.includes(email)) {
        throw new Error('Email not authorized. Please contact administrator.');
      }

      const userData = {
        email,
        name,
        picture,
        loginTime: new Date().toISOString(),
      };

      setUser(userData);
      localStorage.setItem('spx_user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('spx_user');
    // Also sign out from Google
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const updateWhitelist = (newWhitelist) => {
    setWhitelist(newWhitelist);
    localStorage.setItem('spx_whitelist', JSON.stringify(newWhitelist));
  };

  const isEmailWhitelisted = (email) => {
    return whitelist.includes(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        whitelist,
        login,
        logout,
        updateWhitelist,
        isEmailWhitelisted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
