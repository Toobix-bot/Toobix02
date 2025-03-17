import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

export default function Skills() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([
    'Mentale Stärke',
    'Lernen & Wissen',
    'Physische Energie',
    'Soziale Skills',
    'Kreativität',
    'Disziplin',
    'Wohlstand'
  ]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchSkills();
    }
  }, [user, loading]);
  
  const fetchSkills = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/skills');
      setSkills(response.data);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredSkills = selectedCategory === 'all' 
    ? skills 
    : skills.filter(skill => skill.category === selectedCategory);
  
  if (loading || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Lade Skills...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Deine Skills</h1>
          <Link href="/dashboard" className="text-sm text-nova-primary">
            Zurück zum Dashboard
          </Link>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === 'all' 
                  ? 'bg-nova-primary text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Alle
            </button>
            {categories.map(category => (
              <button 
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category 
                    ? 'bg-nova-primary text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Skills grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.length > 0 ? (
            filteredSkills.map(skill => (
              <div key={skill._id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{skill.name}</h3>
                    <span className="badge badge-primary">{skill.category}</span>
                  </div>
                  <div className="text-2xl font-bold">Lvl {skill.level}</div>
                </div>
                
                <p className="text-gray-600 mb-4">{skill.description || 'Keine Beschreibung vorhanden'}</p>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>XP: {skill.currentXP}/{skill.requiredXP}</span>
                    <span>{Math.floor((skill.currentXP / skill.requiredXP) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-nova-secondary h-2.5 rounded-full" 
                      style={{ width: `${(skill.currentXP / skill.requiredXP) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Link 
                    href={`/skills/${skill._id}`}
                    className="text-sm text-nova-primary hover:underline"
                  >
                    Details anzeigen
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 mb-4">Keine Skills in dieser Kategorie gefunden</p>
              <Link href="/skills/new" className="btn btn-primary">
                Neuen Skill hinzufügen
              </Link>
            </div>
          )}
          
          {/* Add new skill card */}
          <Link href="/skills/new" className="card bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:text-nova-primary hover:border-nova-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-lg font-medium">Neuen Skill hinzufügen</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
