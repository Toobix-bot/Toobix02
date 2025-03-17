import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

export default function NewQuest() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [skills, setSkills] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'daily',
    category: 'Persönliche Entwicklung',
    difficulty: 3,
    dueDate: '',
    xpReward: 50,
    skillRewards: [],
    steps: []
  });
  const [currentStep, setCurrentStep] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
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
      const response = await axios.get('/api/skills');
      setSkills(response.data);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSkillRewardChange = (skillId, amount) => {
    // Check if skill already exists in rewards
    const existingIndex = formData.skillRewards.findIndex(
      reward => reward.skillId === skillId
    );
    
    if (existingIndex >= 0) {
      // Update existing skill reward
      const updatedRewards = [...formData.skillRewards];
      if (amount > 0) {
        updatedRewards[existingIndex].xpAmount = amount;
      } else {
        // Remove if amount is 0
        updatedRewards.splice(existingIndex, 1);
      }
      
      setFormData(prev => ({
        ...prev,
        skillRewards: updatedRewards
      }));
    } else if (amount > 0) {
      // Add new skill reward
      setFormData(prev => ({
        ...prev,
        skillRewards: [...prev.skillRewards, { skillId, xpAmount: amount }]
      }));
    }
  };
  
  const addStep = () => {
    if (!currentStep.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { description: currentStep, completed: false }]
    }));
    
    setCurrentStep('');
  };
  
  const removeStep = (index) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post('/api/quests', formData);
      router.push('/quests');
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Erstellen der Quest');
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
          <h1 className="text-2xl font-bold text-gray-900">Neue Quest erstellen</h1>
          <Link href="/quests" className="text-sm text-nova-primary">
            Zurück zu Quests
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
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Quest-Titel
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="input"
                placeholder="z.B. 30 Minuten meditieren"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="input"
                placeholder="Beschreibe diese Quest und ihre Ziele..."
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Quest-Typ
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="daily">Täglich</option>
                  <option value="weekly">Wöchentlich</option>
                  <option value="long-term">Langfristig</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorie
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="z.B. Fitness, Lernen, Meditation"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                  Schwierigkeitsgrad (1-5)
                </label>
                <input
                  type="range"
                  id="difficulty"
                  name="difficulty"
                  min="1"
                  max="5"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Leicht</span>
                  <span>Mittel</span>
                  <span>Schwer</span>
                </div>
              </div>
              
              <div>
                <label htmlFor="xpReward" className="block text-sm font-medium text-gray-700 mb-1">
                  XP-Belohnung
                </label>
                <input
                  type="number"
                  id="xpReward"
                  name="xpReward"
                  value={formData.xpReward}
                  onChange={handleChange}
                  required
                  min="1"
                  className="input"
                />
              </div>
            </div>
            
            {formData.type !== 'daily' && (
              <div className="mb-4">
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Fälligkeitsdatum
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill-Belohnungen
              </label>
              <div className="space-y-2">
                {skills.length > 0 ? (
                  skills.map(skill => (
                    <div key={skill._id} className="flex items-center">
                      <span className="w-1/2">{skill.name}</span>
                      <input
                        type="number"
                        min="0"
                        className="input ml-2"
                        placeholder="XP"
                        value={
                          formData.skillRewards.find(r => r.skillId === skill._id)?.xpAmount || ''
                        }
                        onChange={(e) => handleSkillRewardChange(skill._id, parseInt(e.target.value) || 0)}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Keine Skills verfügbar. Erstelle zuerst Skills.</p>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quest-Schritte
              </label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={currentStep}
                  onChange={(e) => setCurrentStep(e.target.value)}
                  className="input flex-grow"
                  placeholder="Schritt hinzufügen..."
                />
                <button
                  type="button"
                  onClick={addStep}
                  className="ml-2 px-4 py-2 bg-nova-secondary text-white rounded-md"
                >
                  +
                </button>
              </div>
              
              <ul className="space-y-2">
                {formData.steps.map((step, index) => (
                  <li key={index} className="flex items-center bg-gray-50 p-2 rounded-md">
                    <span className="flex-grow">{step.description}</span>
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/quests')}
                className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 mr-2"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Wird erstellt...' : 'Quest erstellen'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
