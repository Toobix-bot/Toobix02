import { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            NOVA System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Melde dich an, um deine persönliche Entwicklungsreise fortzusetzen
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email-Adresse</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input rounded-t-md"
                placeholder="Email-Adresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Passwort</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input rounded-b-md"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          {errorMessage && (
            <div className="text-red-500 text-sm text-center">
              {errorMessage}
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </div>
          
          <div className="text-sm text-center">
            <Link href="/register" className="text-nova-primary hover:text-nova-primary">
              Noch kein Konto? Registrieren
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
