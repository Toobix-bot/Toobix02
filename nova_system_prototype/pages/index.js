import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../components/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to dashboard if logged in, otherwise to login page
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">NOVA System</h1>
          <p className="text-xl text-gray-600">Dein persönliches Entwicklungssystem</p>
        </div>
        
        <div className="mt-8">
          <div className="inline-block text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-nova-primary animate-pulse">
            Lade...
          </div>
        </div>
      </div>
    </div>
  );
}
