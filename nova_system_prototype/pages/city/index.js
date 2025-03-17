import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

export default function City() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [cityData, setCityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedNPC, setSelectedNPC] = useState(null);
  
  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchCityData();
    }
  }, [user, loading]);
  
  const fetchCityData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/city');
      setCityData(response.data);
    } catch (error) {
      console.error('Failed to fetch city data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBuildingClick = (building) => {
    setSelectedBuilding(building);
    setSelectedNPC(null);
  };
  
  const handleNPCClick = (npc) => {
    setSelectedNPC(npc);
    setSelectedBuilding(null);
  };
  
  const closeDetails = () => {
    setSelectedBuilding(null);
    setSelectedNPC(null);
  };
  
  if (loading || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Lade NOVA-Stadt...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">NOVA-Stadt</h1>
          <Link href="/dashboard" className="text-sm text-nova-primary">
            Zurück zum Dashboard
          </Link>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* City info */}
          <div className="card lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Stadtinformationen</h2>
            {cityData && (
              <div className="space-y-4">
                <div>
                  <p className="text-gray-700">Stadtlevel: <span className="font-semibold">{cityData.level}</span></p>
                  <p className="text-gray-700">Gebäude: <span className="font-semibold">{cityData.buildings.length}</span></p>
                  <p className="text-gray-700">NPCs: <span className="font-semibold">{cityData.npcs.length}</span></p>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Über deine Stadt</h3>
                  <p className="text-sm text-gray-600">
                    Deine NOVA-Stadt wächst mit deinem persönlichen Fortschritt. Jedes Gebäude repräsentiert einen Bereich deiner Entwicklung, und die NPCs bieten dir Quests und Unterstützung auf deinem Weg.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* City visualization */}
          <div className="lg:col-span-2 card relative">
            <h2 className="text-xl font-semibold mb-4">Stadtansicht</h2>
            
            {/* City map */}
            <div className="bg-blue-50 rounded-lg h-96 relative overflow-hidden border-2 border-blue-100">
              {/* City background */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-100 to-green-100"></div>
              
              {/* Buildings */}
              {cityData && cityData.buildings.map((building, index) => (
                <div 
                  key={building._id || index}
                  className="absolute cursor-pointer transform hover:scale-110 transition-transform"
                  style={{ 
                    left: `${building.position?.x || (index * 15 + 10)}%`, 
                    top: `${building.position?.y || (index * 10 + 30)}%`,
                    zIndex: selectedBuilding === building ? 20 : 10
                  }}
                  onClick={() => handleBuildingClick(building)}
                >
                  <div className={`w-16 h-16 flex items-center justify-center rounded-lg shadow-lg ${
                    building.type === 'headquarters' ? 'bg-purple-500' :
                    building.type === 'temple' ? 'bg-blue-500' :
                    building.type === 'academy' ? 'bg-green-500' :
                    'bg-gray-500'
                  }`}>
                    <span className="text-white text-xs font-bold text-center px-1">
                      {building.name.split(' ')[0]}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* NPCs */}
              {cityData && cityData.npcs.map((npc, index) => (
                <div 
                  key={npc._id || index}
                  className="absolute cursor-pointer transform hover:scale-110 transition-transform"
                  style={{ 
                    left: `${npc.position?.x || (index * 20 + 25)}%`, 
                    top: `${npc.position?.y || (index * 15 + 50)}%`,
                    zIndex: selectedNPC === npc ? 20 : 10
                  }}
                  onClick={() => handleNPCClick(npc)}
                >
                  <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-white shadow-lg flex items-center justify-center">
                    <span className="text-white text-xs">NPC</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                <span className="text-sm">Hauptgebäude</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span className="text-sm">Tempel</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-sm">Akademie</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></div>
                <span className="text-sm">NPCs</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Building or NPC details */}
        {(selectedBuilding || selectedNPC) && (
          <div className="mt-6 card">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold">
                {selectedBuilding ? selectedBuilding.name : selectedNPC.name}
              </h2>
              <button 
                onClick={closeDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {selectedBuilding && (
              <div className="mt-4">
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Typ:</span> {selectedBuilding.type}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Level:</span> {selectedBuilding.level}
                </p>
                <p className="text-gray-700 mb-4">
                  <span className="font-medium">Beschreibung:</span> {selectedBuilding.description || 'Keine Beschreibung verfügbar.'}
                </p>
                
                {selectedBuilding.linkedSkill && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      Dieses Gebäude ist mit einem Skill verknüpft. Verbessere deinen Skill, um das Gebäude aufzuwerten!
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {selectedNPC && (
              <div className="mt-4">
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Rolle:</span> {selectedNPC.role}
                </p>
                
                {selectedNPC.dialogues && selectedNPC.dialogues.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Dialog:</h3>
                    <div className="p-4 bg-gray-50 rounded-md">
                      <p className="italic text-gray-700">{selectedNPC.dialogues[0].text}</p>
                      
                      {selectedNPC.dialogues[0].responses && (
                        <div className="mt-3 space-y-2">
                          {selectedNPC.dialogues[0].responses.map((response, index) => (
                            <button 
                              key={index}
                              className="block w-full text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50"
                            >
                              {response}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedNPC.quests && selectedNPC.quests.length > 0 ? (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Verfügbare Quests:</h3>
                    <p className="text-sm text-gray-600">Dieser NPC hat Quests für dich.</p>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                    <p className="text-sm text-yellow-800">
                      Dieser NPC hat derzeit keine Quests für dich.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Buildings and NPCs lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Buildings list */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Gebäude</h2>
            {cityData && cityData.buildings.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {cityData.buildings.map((building, index) => (
                  <li 
                    key={building._id || index}
                    className="py-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleBuildingClick(building)}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-md mr-3 flex-shrink-0 ${
                        building.type === 'headquarters' ? 'bg-purple-500' :
                        building.type === 'temple' ? 'bg-blue-500' :
                        building.type === 'academy' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{building.name}</p>
                        <p className="text-sm text-gray-500">Level {building.level}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Keine Gebäude vorhanden</p>
            )}
          </div>
          
          {/* NPCs list */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">NPCs</h2>
            {cityData && cityData.npcs.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {cityData.npcs.map((npc, index) => (
                  <li 
                    key={npc._id || index}
                    className="py-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleNPCClick(npc)}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-yellow-400 mr-3 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium">{npc.name}</p>
                        <p className="text-sm text-gray-500">{npc.role}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Keine NPCs vorhanden</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
