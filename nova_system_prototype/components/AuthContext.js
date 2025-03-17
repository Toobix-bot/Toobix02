import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('novaToken');
    if (token) {
      loadUserData(token);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserData = async (token) => {
    try {
      setLoading(true);
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get user data
      const { data } = await axios.get('/api/auth/profile');
      setUser(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load user data:', err);
      setError('Session expired. Please login again.');
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/auth/login', { email, password });
      
      // Save token to local storage
      localStorage.setItem('novaToken', data.token);
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setUser(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/auth/register', { 
        username, 
        email, 
        password 
      });
      
      // Save token to local storage
      localStorage.setItem('novaToken', data.token);
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setUser(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token from local storage
    localStorage.removeItem('novaToken');
    
    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
    
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const { data } = await axios.put('/api/auth/profile', userData);
      
      // Update token if returned
      if (data.token) {
        localStorage.setItem('novaToken', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }
      
      setUser(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Profile update failed:', err);
      setError(err.response?.data?.message || 'Profile update failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
