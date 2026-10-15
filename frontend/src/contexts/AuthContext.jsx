import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [whitelist, setWhitelist] = useState([]);

  // Load whitelist from Supabase
  useEffect(() => {
    loadWhitelist();
  }, []);

  const loadWhitelist = async () => {
    try {
      const { data, error } = await supabase
        .from('whitelist')
        .select('email')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading whitelist:', error);
        // Fallback to default list if Supabase fails
        const defaultList = ['rafi.alvian@spxexpress.com', 'admin@spxsoko.online'];
        setWhitelist(defaultList);
      } else if (data && data.length > 0) {
        const emails = data.map(row => row.email);
        setWhitelist(emails);
      } else {
        // If table is empty, initialize with default emails
        await initializeDefaultWhitelist();
      }
    } catch (err) {
      console.error('Failed to load whitelist:', err);
      // Fallback to default
      const defaultList = ['rafi.alvian@spxexpress.com', 'admin@spxsoko.online'];
      setWhitelist(defaultList);
    }
  };

  const initializeDefaultWhitelist = async () => {
    const defaultList = ['rafi.alvian@spxexpress.com', 'admin@spxsoko.online'];
    
    try {
      const { error } = await supabase
        .from('whitelist')
        .insert(defaultList.map(email => ({ email })));

      if (error) {
        console.error('Error initializing whitelist:', error);
      } else {
        setWhitelist(defaultList);
      }
    } catch (err) {
      console.error('Failed to initialize whitelist:', err);
      setWhitelist(defaultList);
    }
  };

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

      // Load fresh whitelist from Supabase
      await loadWhitelist();

      // Get current whitelist
      let currentWhitelist = whitelist;
      if (currentWhitelist.length === 0) {
        // Force reload if empty
        const { data } = await supabase
          .from('whitelist')
          .select('email');
        
        if (data && data.length > 0) {
          currentWhitelist = data.map(row => row.email);
        } else {
          // Initialize defaults if still empty
          const defaultList = ['rafi.alvian@spxexpress.com', 'admin@spxsoko.online'];
          await initializeDefaultWhitelist();
          currentWhitelist = defaultList;
        }
      }

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

  const updateWhitelist = async (newWhitelist) => {
    try {
      // Delete all existing records
      await supabase.from('whitelist').delete().neq('email', '');

      // Insert new records
      const { error } = await supabase
        .from('whitelist')
        .insert(newWhitelist.map(email => ({ email })));

      if (error) {
        console.error('Error updating whitelist:', error);
        throw error;
      }

      setWhitelist(newWhitelist);
      return { success: true };
    } catch (error) {
      console.error('Failed to update whitelist:', error);
      return { success: false, error: error.message };
    }
  };

  const addToWhitelist = async (email) => {
    try {
      const { error } = await supabase
        .from('whitelist')
        .insert([{ email: email.toLowerCase() }]);

      if (error) {
        console.error('Error adding to whitelist:', error);
        throw error;
      }

      // Reload whitelist
      await loadWhitelist();
      return { success: true };
    } catch (error) {
      console.error('Failed to add to whitelist:', error);
      return { success: false, error: error.message };
    }
  };

  const removeFromWhitelist = async (email) => {
    try {
      const { error } = await supabase
        .from('whitelist')
        .delete()
        .eq('email', email);

      if (error) {
        console.error('Error removing from whitelist:', error);
        throw error;
      }

      // Reload whitelist
      await loadWhitelist();
      return { success: true };
    } catch (error) {
      console.error('Failed to remove from whitelist:', error);
      return { success: false, error: error.message };
    }
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
        addToWhitelist,
        removeFromWhitelist,
        isEmailWhitelisted,
        loadWhitelist,
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
