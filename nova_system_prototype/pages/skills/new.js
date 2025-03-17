import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

export default function NewSkill() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Mentale Stärke',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const categories = [
    'Mentale Stärke',
    'Lernen & Wissen',
    'Physische Energie',
    'Soziale Skills',
    'Kreativität',
    'Disziplin',
    'Wohlstand'
  ];
  
  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post('/api/skills', formData);
      router.push('/skills');
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Erstellen des Skills');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Lade...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Neuen Skill erstellen</h1>
          <Link href="/skills" className="text-sm text-nova-primary">
            Zurück zu Skills
          </Link>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Skill-Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="z.B. Meditation, Programmieren, Fitness"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Kategorie
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="input"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="input"
                placeholder="Beschreibe diesen Skill und wie du ihn entwickeln möchtest..."
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/skills')}
                className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 mr-2"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Wird erstellt...' : 'Skill erstellen'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
