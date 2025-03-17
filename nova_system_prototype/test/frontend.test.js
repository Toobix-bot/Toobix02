import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../pages/login';
import Register from '../pages/register';
import Dashboard from '../pages/dashboard';
import { AuthProvider } from '../components/AuthContext';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {}
  })
}));

// Mock axios
jest.mock('axios', () => ({
  defaults: {
    headers: {
      common: {}
    }
  },
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: { token: 'test-token', username: 'testuser' } }))
}));

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Authentication Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Login form renders correctly', () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
    
    expect(screen.getByText(/NOVA System/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email-Adresse/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Passwort/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Anmelden/i })).toBeInTheDocument();
  });

  test('Register form renders correctly', () => {
    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    );
    
    expect(screen.getByText(/NOVA System/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Benutzername/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email-Adresse/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Passwort/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Passwort bestätigen/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrieren/i })).toBeInTheDocument();
  });

  test('Login form handles submission', async () => {
    const axios = require('axios');
    
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
    
    fireEvent.change(screen.getByPlaceholderText(/Email-Adresse/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText(/Passwort/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Anmelden/i }));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('novaToken', 'test-token');
    });
  });
});

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Mock authenticated user
    const axios = require('axios');
    axios.get.mockImplementation((url) => {
      if (url === '/api/auth/profile') {
        return Promise.resolve({
          data: {
            _id: '123',
            username: 'testuser',
            email: 'test@example.com',
            stats: {
              level: 5,
              totalXP: 450,
              streakDays: 7
            }
          }
        });
      } else if (url === '/api/quests?status=active') {
        return Promise.resolve({
          data: [
            {
              _id: 'q1',
              title: 'Test Quest 1',
              type: 'daily',
              progress: 50
            }
          ]
        });
      } else if (url === '/api/skills') {
        return Promise.resolve({
          data: [
            {
              _id: 's1',
              name: 'Test Skill',
              level: 3,
              currentXP: 75,
              requiredXP: 100
            }
          ]
        });
      }
      return Promise.resolve({ data: [] });
    });
    
    // Set mock token
    localStorageMock.getItem.mockReturnValue('test-token');
  });

  test('Dashboard renders user information correctly', async () => {
    render(
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/NOVA Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/testuser/i)).toBeInTheDocument();
      expect(screen.getByText(/Level 5/i)).toBeInTheDocument();
      expect(screen.getByText(/450 XP/i)).toBeInTheDocument();
      expect(screen.getByText(/Streak: 7 Tage/i)).toBeInTheDocument();
    });
  });

  test('Dashboard displays active quests', async () => {
    render(
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Aktive Quests/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Quest 1/i)).toBeInTheDocument();
      expect(screen.getByText(/50% abgeschlossen/i)).toBeInTheDocument();
    });
  });

  test('Dashboard displays skills', async () => {
    render(
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Deine Skills/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Skill/i)).toBeInTheDocument();
      expect(screen.getByText(/Level 3/i)).toBeInTheDocument();
    });
  });
});
