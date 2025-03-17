import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

export default function NewReflection() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({
    type: 'daily',
    content: '',
    mood: 'Gut',
    energyLevel: 7,
    questions: [],
    achievements: [],
    challenges: [],
    insights: [],
    goals: []
  });
  const [currentItem, setCurrentItem] = useState({
    achievement: '',
    challenge: '',
    insight: '',
    goalDescription: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchQuestions(formData.type);
    }
  }, [user, loading]);
  
  useEffect(() => {
    fetchQuestions(formData.type);
  }, [formData.type]);
  
  const fetchQuestions = async (type) => {
    try {
      const response = await axios.get(`/api/reflections/questions?type=${type}`);
      setQuestions(response.data.questions);
      
      // Initialize questions in form data
      const initialQuestions = response.data.questions.map(question => ({
        question,
        answer: ''
      }));
      
      setFormData(prev => ({
        ...prev,
        questions: initialQuestions
      }));
    } catch (error) {
      console.error('Failed to fetch reflection questions:', error);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleQuestionChange = (index, answer) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index].answer = answer;
    
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
  
  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const addItem = (type) => {
    const itemKey = type === 'goals' ? 'goalDescription' : type.slice(0, -1);
    if (!currentItem[itemKey].trim()) return;
    
    if (type === 'goals') {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], { description: currentItem[itemKey], completed: false }]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], currentItem[itemKey]]
      }));
    }
    
    setCurrentItem(prev => ({
      ...prev,
      [itemKey]: ''
    }));
  };
  
  const removeItem = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post('/api/reflections', formData);
      router.push('/reflections');
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Erstellen der Reflexion');
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
          <h1 className="text-2xl font-bold text-gray-900">Neue Reflexion</h1>
          <Link href="/reflections" className="text-sm text-nova-primary">
            Zurück zu Reflexionen
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
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Reflexionstyp
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="daily">Tägliche Reflexion</option>
                <option value="weekly">Wöchentliche Reflexion</option>
                <option value="monthly">Monatliche Reflexion</option>
                <option value="yearly">Jahresrückblick</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-1">
                  Stimmung
                </label>
                <select
                  id="mood"
                  name="mood"
                  value={formData.mood}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="Sehr gut">Sehr gut</option>
                  <option value="Gut">Gut</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Schlecht">Schlecht</option>
                  <option value="Sehr schlecht">Sehr schlecht</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="energyLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Energie-Level (1-10)
                </label>
                <input
                  type="range"
                  id="energyLevel"
                  name="energyLevel"
                  min="1"
                  max="10"
                  value={formData.energyLevel}
                  onChange={handleChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Niedrig</span>
                  <span>Mittel</span>
                  <span>Hoch</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Hauptreflexion
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="6"
                required
                className="input"
                placeholder="Teile deine Gedanken, Gefühle und Reflexionen..."
              ></textarea>
            </div>
            
            {/* Reflection Questions */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Reflexionsfragen</h3>
              <div className="space-y-4">
                {formData.questions.map((q, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {q.question}
                    </label>
                    <textarea
                      value={q.answer}
                      onChange={(e) => handleQuestionChange(index, e.target.value)}
                      rows="2"
                      className="input"
                    ></textarea>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Achievements */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Erfolge</h3>
              <div className="flex mb-2">
                <input
                  type="text"
                  name="achievement"
                  value={currentItem.achievement}
                  onChange={handleItemChange}
                  className="input flex-grow"
                  placeholder="Erfolg hinzufügen..."
                />
                <button
                  type="button"
                  onClick={() => addItem('achievements')}
                  className="ml-2 px-4 py-2 bg-nova-secondary text-white rounded-md"
                >
                  +
                </button>
              </div>
              
              <ul className="space-y-2">
                {formData.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-center bg-gray-50 p-2 rounded-md">
                    <span className="flex-grow">{achievement}</span>
                    <button
                      type="button"
                      onClick={() => removeItem('achievements', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Challenges */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Herausforderungen</h3>
              <div className="flex mb-2">
                <input
                  type="text"
                  name="challenge"
                  value={currentItem.challenge}
                  onChange={handleItemChange}
                  className="input flex-grow"
                  placeholder="Herausforderung hinzufügen..."
                />
                <button
                  type="button"
                  onClick={() => addItem('challenges')}
                  className="ml-2 px-4 py-2 bg-nova-secondary text-white rounded-md"
                >
                  +
                </button>
              </div>
              
              <ul className="space-y-2">
                {formData.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-center bg-gray-50 p-2 rounded-md">
                    <span className="flex-grow">{challenge}</span>
                    <button
                      type="button"
                      onClick={() => removeItem('challenges', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Insights */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Erkenntnisse</h3>
              <div className="flex mb-2">
                <input
                  type="text"
                  name="insight"
                  value={currentItem.insight}
                  onChange={handleItemChange}
                  className="input flex-grow"
                  placeholder="Erkenntnis hinzufügen..."
                />
                <button
                  type="button"
                  onClick={() => addItem('insights')}
                  className="ml-2 px-4 py-2 bg-nova-secondary text-white rounded-md"
                >
                  +
                </button>
              </div>
              
              <ul className="space-y-2">
                {formData.insights.map((insight, index) => (
                  <li key={index} className="flex items-center bg-gray-50 p-2 rounded-md">
                    <span className="flex-grow">{insight}</span>
                    <button
                      type="button"
                      onClick={() => removeItem('insights', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Goals */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Ziele</h3>
              <div className="flex mb-2">
                <input
                  type="text"
                  name="goalDescription"
                  value={currentItem.goalDescription}
                  onChange={handleItemChange}
                  className="input flex-grow"
                  placeholder="Ziel hinzufügen..."
                />
                <button
                  type="button"
                  onClick={() => addItem('goals')}
                  className="ml-2 px-4 py-2 bg-nova-secondary text-white rounded-md"
                >
                  +
                </button>
              </div>
              
              <ul className="space-y-2">
                {formData.goals.map((goal, index) => (
                  <li key={index} className="flex items-center bg-gray-50 p-2 rounded-md">
                    <span className="flex-grow">{goal.description}</span>
                    <button
                      type="button"
                      onClick={() => removeItem('goals', index)}
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
                onClick={() => router.push('/reflections')}
                className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 mr-2"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Wird gespeichert...' : 'Reflexion speichern'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
