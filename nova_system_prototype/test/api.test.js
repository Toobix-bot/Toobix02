// Test script for NOVA system API endpoints
const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Base URL for API requests
const API_BASE_URL = 'http://localhost:5000';

// Test user credentials
const TEST_USER = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test123!'
};

// Store auth token
let authToken = '';

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// Helper function to log test results
const logTest = (name, success, error = null) => {
  if (success) {
    console.log(`✅ PASS: ${name}`);
    testResults.passed++;
  } else {
    console.log(`❌ FAIL: ${name}`);
    if (error) {
      console.log(`   Error: ${error}`);
    }
    testResults.failed++;
  }
  testResults.total++;
};

// Helper function to make authenticated requests
const authRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${authToken}` }
    };
    
    if (method === 'get') {
      return await axios.get(`${API_BASE_URL}${endpoint}`, config);
    } else if (method === 'post') {
      return await axios.post(`${API_BASE_URL}${endpoint}`, data, config);
    } else if (method === 'put') {
      return await axios.put(`${API_BASE_URL}${endpoint}`, data, config);
    } else if (method === 'delete') {
      return await axios.delete(`${API_BASE_URL}${endpoint}`, config);
    }
  } catch (error) {
    throw error;
  }
};

// Test authentication endpoints
const testAuth = async () => {
  console.log('\n--- Testing Authentication ---');
  
  try {
    // Test registration
    const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, TEST_USER);
    logTest('User Registration', registerResponse.status === 201 && registerResponse.data.token);
    
    // Store token
    authToken = registerResponse.data.token;
  } catch (error) {
    // If user already exists, test login instead
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password
      });
      logTest('User Login', loginResponse.status === 200 && loginResponse.data.token);
      
      // Store token
      authToken = loginResponse.data.token;
    } catch (loginError) {
      logTest('Authentication', false, loginError.message);
    }
  }
  
  // Test get profile
  try {
    const profileResponse = await authRequest('get', '/api/auth/profile');
    logTest('Get User Profile', profileResponse.status === 200 && profileResponse.data.username === TEST_USER.username);
  } catch (error) {
    logTest('Get User Profile', false, error.message);
  }
};

// Test skills endpoints
const testSkills = async () => {
  console.log('\n--- Testing Skills ---');
  
  let createdSkillId = '';
  
  // Test create skill
  try {
    const newSkill = {
      name: 'Test Skill',
      category: 'Mentale Stärke',
      description: 'A test skill for API testing'
    };
    
    const createResponse = await authRequest('post', '/api/skills', newSkill);
    createdSkillId = createResponse.data._id;
    
    logTest('Create Skill', 
      createResponse.status === 201 && 
      createResponse.data.name === newSkill.name
    );
  } catch (error) {
    logTest('Create Skill', false, error.message);
  }
  
  // Test get all skills
  try {
    const getResponse = await authRequest('get', '/api/skills');
    logTest('Get All Skills', 
      getResponse.status === 200 && 
      Array.isArray(getResponse.data)
    );
  } catch (error) {
    logTest('Get All Skills', false, error.message);
  }
  
  // Test get skill by ID
  if (createdSkillId) {
    try {
      const getByIdResponse = await authRequest('get', `/api/skills/${createdSkillId}`);
      logTest('Get Skill by ID', 
        getByIdResponse.status === 200 && 
        getByIdResponse.data._id === createdSkillId
      );
    } catch (error) {
      logTest('Get Skill by ID', false, error.message);
    }
    
    // Test update skill
    try {
      const updateData = {
        description: 'Updated test skill description'
      };
      
      const updateResponse = await authRequest('put', `/api/skills/${createdSkillId}`, updateData);
      logTest('Update Skill', 
        updateResponse.status === 200 && 
        updateResponse.data.description === updateData.description
      );
    } catch (error) {
      logTest('Update Skill', false, error.message);
    }
  }
};

// Test quests endpoints
const testQuests = async () => {
  console.log('\n--- Testing Quests ---');
  
  let createdQuestId = '';
  
  // Test create quest
  try {
    const newQuest = {
      title: 'Test Quest',
      description: 'A test quest for API testing',
      type: 'daily',
      category: 'Persönliche Entwicklung',
      difficulty: 3,
      xpReward: 50,
      steps: [
        { description: 'Step 1', completed: false },
        { description: 'Step 2', completed: false }
      ]
    };
    
    const createResponse = await authRequest('post', '/api/quests', newQuest);
    createdQuestId = createResponse.data._id;
    
    logTest('Create Quest', 
      createResponse.status === 201 && 
      createResponse.data.title === newQuest.title
    );
  } catch (error) {
    logTest('Create Quest', false, error.message);
  }
  
  // Test get all quests
  try {
    const getResponse = await authRequest('get', '/api/quests');
    logTest('Get All Quests', 
      getResponse.status === 200 && 
      Array.isArray(getResponse.data)
    );
  } catch (error) {
    logTest('Get All Quests', false, error.message);
  }
  
  // Test get quest by ID
  if (createdQuestId) {
    try {
      const getByIdResponse = await authRequest('get', `/api/quests/${createdQuestId}`);
      logTest('Get Quest by ID', 
        getByIdResponse.status === 200 && 
        getByIdResponse.data._id === createdQuestId
      );
    } catch (error) {
      logTest('Get Quest by ID', false, error.message);
    }
    
    // Test update quest progress
    try {
      const updateData = {
        progress: 50
      };
      
      const updateResponse = await authRequest('put', `/api/quests/${createdQuestId}/progress`, updateData);
      logTest('Update Quest Progress', 
        updateResponse.status === 200 && 
        updateResponse.data.progress === updateData.progress
      );
    } catch (error) {
      logTest('Update Quest Progress', false, error.message);
    }
  }
};

// Test reflections endpoints
const testReflections = async () => {
  console.log('\n--- Testing Reflections ---');
  
  let createdReflectionId = '';
  
  // Test create reflection
  try {
    const newReflection = {
      type: 'daily',
      content: 'This is a test reflection',
      mood: 'Gut',
      energyLevel: 7,
      achievements: ['Test achievement'],
      challenges: ['Test challenge'],
      insights: ['Test insight'],
      goals: [{ description: 'Test goal', completed: false }]
    };
    
    const createResponse = await authRequest('post', '/api/reflections', newReflection);
    createdReflectionId = createResponse.data._id;
    
    logTest('Create Reflection', 
      createResponse.status === 201 && 
      createResponse.data.type === newReflection.type
    );
  } catch (error) {
    logTest('Create Reflection', false, error.message);
  }
  
  // Test get all reflections
  try {
    const getResponse = await authRequest('get', '/api/reflections');
    logTest('Get All Reflections', 
      getResponse.status === 200 && 
      Array.isArray(getResponse.data)
    );
  } catch (error) {
    logTest('Get All Reflections', false, error.message);
  }
  
  // Test get reflection questions
  try {
    const questionsResponse = await authRequest('get', '/api/reflections/questions?type=daily');
    logTest('Get Reflection Questions', 
      questionsResponse.status === 200 && 
      Array.isArray(questionsResponse.data.questions)
    );
  } catch (error) {
    logTest('Get Reflection Questions', false, error.message);
  }
};

// Test city endpoints
const testCity = async () => {
  console.log('\n--- Testing City ---');
  
  // Test get city data
  try {
    const getCityResponse = await authRequest('get', '/api/city');
    logTest('Get City Data', 
      getCityResponse.status === 200 && 
      getCityResponse.data.level !== undefined
    );
  } catch (error) {
    logTest('Get City Data', false, error.message);
  }
  
  // Test get city buildings
  try {
    const getBuildingsResponse = await authRequest('get', '/api/city/buildings');
    logTest('Get City Buildings', 
      getBuildingsResponse.status === 200 && 
      Array.isArray(getBuildingsResponse.data)
    );
  } catch (error) {
    logTest('Get City Buildings', false, error.message);
  }
  
  // Test get city NPCs
  try {
    const getNPCsResponse = await authRequest('get', '/api/city/npcs');
    logTest('Get City NPCs', 
      getNPCsResponse.status === 200 && 
      Array.isArray(getNPCsResponse.data)
    );
  } catch (error) {
    logTest('Get City NPCs', false, error.message);
  }
};

// Run all tests
const runTests = async () => {
  console.log('=== NOVA System API Tests ===');
  
  try {
    await testAuth();
    await testSkills();
    await testQuests();
    await testReflections();
    await testCity();
    
    // Print test summary
    console.log('\n=== Test Summary ===');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  } catch (error) {
    console.error('Test execution failed:', error);
  }
};

// Start tests
runTests();
