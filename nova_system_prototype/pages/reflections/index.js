import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

export default function Reflections() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reflections, setReflections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchReflections();
    }
  }, [user, loading, filter]);
  
  const fetchReflections = async () => {
    try {
      setIsLoading(true);
      let url = '/api/reflections';
      
      if (filter !== 'all') {
        url += `?type=${filter}`;
      }
      
      const response = await axios.get(url);
      setReflections(response.data);
    } catch (error) {
      console.error('Failed to fetch reflections:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('de-DE', options);
  };
  
  const getTypeLabel = (type) => {
    switch (type) {
      case 'daily':
        return 'Tägliche Reflexion';
      case 'weekly':
        return 'Wöchentliche Reflexion';
      case 'monthly':
        return 'Monatliche Reflexion';
      case 'yearly':
        return 'Jahresrückblick';
      default:
        return type;
    }
  };
  
  const getMoodEmoji = (mood) => {
    switch (mood.toLowerCase()) {
      case 'sehr gut':
      case 'ausgezeichnet':
        return '😄';
      case 'gut':
        return '🙂';
      case 'neutral':
      case 'okay':
        return '😐';
      case 'schlecht':
        return '😕';
      case 'sehr schlecht':
        return '😞';
      default:
        return '🙂';
    }
  };
  
  if (loading || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Lade Reflexionen...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Deine Reflexionen</h1>
          <Link href="/dashboard" className="text-sm text-nova-primary">
            Zurück zum Dashboard
          </Link>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setFilter('all')}
              className={`pb-4 px-1 ${
                filter === 'all'
                  ? 'border-b-2 border-nova-primary text-nova-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => setFilter('daily')}
              className={`pb-4 px-1 ${
                filter === 'daily'
                  ? 'border-b-2 border-nova-primary text-nova-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Täglich
            </button>
            <button
              onClick={() => setFilter('weekly')}
              className={`pb-4 px-1 ${
                filter === 'weekly'
                  ? 'border-b-2 border-nova-primary text-nova-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Wöchentlich
            </button>
            <button
              onClick={() => setFilter('monthly')}
              className={`pb-4 px-1 ${
                filter === 'monthly'
                  ? 'border-b-2 border-nova-primary text-nova-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Monatlich
            </button>
          </nav>
        </div>
        
        {/* Create new reflection button */}
        <div className="mb-6 flex justify-end">
          <Link href="/reflections/new" className="btn btn-primary">
            + Neue Reflexion
          </Link>
        </div>
        
        {/* Reflections list */}
        <div className="space-y-4">
          {reflections.length > 0 ? (
            reflections.map(reflection => (
              <div key={reflection._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{getMoodEmoji(reflection.mood)}</span>
                      <h3 className="text-lg font-semibold">{getTypeLabel(reflection.type)}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(reflection.date)}</p>
                  </div>
                  <div className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    Energie: {reflection.energyLevel}/10
                  </div>
                </div>
                
                <div className="my-4">
                  <p className="text-gray-600 line-clamp-3">{reflection.content}</p>
                </div>
                
                {reflection.achievements && reflection.achievements.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700">Erfolge:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                      {reflection.achievements.slice(0, 2).map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                      {reflection.achievements.length > 2 && (
                        <li>...</li>
                      )}
                    </ul>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <Link 
                    href={`/reflections/${reflection._id}`}
                    className="text-sm text-nova-primary hover:underline"
                  >
                    Vollständig lesen
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 mb-4">Keine Reflexionen gefunden</p>
              <Link href="/reflections/new" className="btn btn-primary">
                Erste Reflexion erstellen
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
