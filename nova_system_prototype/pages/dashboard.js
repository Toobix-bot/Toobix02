import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [activeQuests, setActiveQuests] = useState([]);
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchDashboardData();
    }
  }, [user, loading]);
  
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch active quests
      const questsResponse = await axios.get('/api/quests?status=active');
      setActiveQuests(questsResponse.data);
      
      // Fetch skills
      const skillsResponse = await axios.get('/api/skills');
      setSkills(skillsResponse.data);
      
      // Set user stats
      setStats(user.stats);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (loading || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Lade NOVA-System...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">NOVA Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{user.username}</span>
            </div>
            <button 
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User stats */}
          <div className="card col-span-1">
            <h2 className="text-xl font-semibold mb-4">Dein Fortschritt</h2>
            {stats && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Level {stats.level}</span>
                    <span className="text-sm font-medium">{stats.totalXP} XP</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-nova-primary h-2.5 rounded-full" 
                      style={{ width: `${(stats.totalXP % 100) / 100 * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Streak: {stats.streakDays} Tage</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Active quests */}
          <div className="card col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Aktive Quests</h2>
              <Link href="/quests" className="text-sm text-nova-primary">
                Alle anzeigen
              </Link>
            </div>
            {activeQuests.length > 0 ? (
              <ul className="space-y-3">
                {activeQuests.slice(0, 3).map(quest => (
                  <li key={quest._id} className="border-l-4 border-nova-accent pl-3 py-1">
                    <div className="font-medium">{quest.title}</div>
                    <div className="text-sm text-gray-600 flex justify-between">
                      <span>{quest.type === 'daily' ? 'Täglich' : quest.type === 'weekly' ? 'Wöchentlich' : 'Langfristig'}</span>
                      <span>{quest.progress}% abgeschlossen</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Keine aktiven Quests</p>
            )}
          </div>
          
          {/* Skills */}
          <div className="card col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Deine Skills</h2>
              <Link href="/skills" className="text-sm text-nova-primary">
                Alle anzeigen
              </Link>
            </div>
            {skills.length > 0 ? (
              <ul className="space-y-3">
                {skills.slice(0, 3).map(skill => (
                  <li key={skill._id} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-sm">Level {skill.level}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-nova-secondary h-2 rounded-full" 
                        style={{ width: `${(skill.currentXP / skill.requiredXP) * 100}%` }}
                      ></div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Keine Skills vorhanden</p>
            )}
          </div>
        </div>
        
        {/* NOVA City */}
        <div className="mt-8">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">NOVA-Stadt</h2>
              <Link href="/city" className="text-sm text-nova-primary">
                Stadt erkunden
              </Link>
            </div>
            <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
              <p className="text-gray-600">Stadtvisualisierung wird geladen...</p>
            </div>
          </div>
        </div>
        
        {/* Quick actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/quests/new" className="card bg-nova-primary text-white text-center hover:bg-opacity-90">
            <div className="text-xl mb-2">+ Quest erstellen</div>
            <p className="text-sm">Neue Herausforderung hinzufügen</p>
          </Link>
          
          <Link href="/reflections/new" className="card bg-nova-secondary text-white text-center hover:bg-opacity-90">
            <div className="text-xl mb-2">+ Reflexion</div>
            <p className="text-sm">Tägliche Reflexion durchführen</p>
          </Link>
          
          <Link href="/skills/new" className="card bg-nova-accent text-white text-center hover:bg-opacity-90">
            <div className="text-xl mb-2">+ Skill</div>
            <p className="text-sm">Neuen Skill hinzufügen</p>
          </Link>
          
          <Link href="/profile" className="card bg-nova-dark text-white text-center hover:bg-opacity-90">
            <div className="text-xl mb-2">Profil</div>
            <p className="text-sm">Profil und Einstellungen bearbeiten</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
