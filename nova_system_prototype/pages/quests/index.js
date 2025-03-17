import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

export default function Quests() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [quests, setQuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchQuests();
    }
  }, [user, loading, filter]);
  
  const fetchQuests = async () => {
    try {
      setIsLoading(true);
      let url = '/api/quests';
      
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }
      
      const response = await axios.get(url);
      setQuests(response.data);
    } catch (error) {
      console.error('Failed to fetch quests:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getTypeLabel = (type) => {
    switch (type) {
      case 'daily':
        return 'Täglich';
      case 'weekly':
        return 'Wöchentlich';
      case 'long-term':
        return 'Langfristig';
      default:
        return type;
    }
  };
  
  if (loading || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Lade Quests...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Deine Quests</h1>
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
              onClick={() => setFilter('active')}
              className={`pb-4 px-1 ${
                filter === 'active'
                  ? 'border-b-2 border-nova-primary text-nova-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Aktiv
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`pb-4 px-1 ${
                filter === 'completed'
                  ? 'border-b-2 border-nova-primary text-nova-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Abgeschlossen
            </button>
          </nav>
        </div>
        
        {/* Create new quest button */}
        <div className="mb-6 flex justify-end">
          <Link href="/quests/new" className="btn btn-primary">
            + Neue Quest
          </Link>
        </div>
        
        {/* Quests list */}
        <div className="space-y-4">
          {quests.length > 0 ? (
            quests.map(quest => (
              <div key={quest._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{quest.title}</h3>
                    <div className="flex space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(quest.status)}`}>
                        {quest.status === 'active' ? 'Aktiv' : quest.status === 'completed' ? 'Abgeschlossen' : 'Fehlgeschlagen'}
                      </span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {getTypeLabel(quest.type)}
                      </span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {quest.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {quest.xpReward} XP
                  </div>
                </div>
                
                <p className="text-gray-600 my-4">{quest.description}</p>
                
                {quest.status === 'active' && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Fortschritt</span>
                      <span>{quest.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-nova-primary h-2.5 rounded-full" 
                        style={{ width: `${quest.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <Link 
                    href={`/quests/${quest._id}`}
                    className="text-sm text-nova-primary hover:underline"
                  >
                    Details anzeigen
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 mb-4">Keine Quests gefunden</p>
              <Link href="/quests/new" className="btn btn-primary">
                Erste Quest erstellen
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
