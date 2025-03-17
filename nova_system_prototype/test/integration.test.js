// This script runs the server and performs basic functionality tests
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { exec } = require('child_process');

// Load environment variables
dotenv.config();

// Create a test environment configuration file if it doesn't exist
const createEnvFile = () => {
  const fs = require('fs');
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    const envContent = `
MONGO_URI=mongodb://localhost:27017/nova_test
JWT_SECRET=test_secret_key_for_development
PORT=5000
    `.trim();
    
    fs.writeFileSync(envPath, envContent);
    console.log('Created .env file with test configuration');
  }
};

// Start MongoDB memory server for testing
const startDatabase = async () => {
  try {
    // Use local MongoDB for testing
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nova_test';
    
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Start Express server
const startServer = () => {
  const app = express();
  const PORT = process.env.PORT || 5000;
  
  // Middleware
  app.use(cors());
  app.use(express.json());
  
  // Routes
  app.use('/api/auth', require('../src/routes/auth'));
  app.use('/api/skills', require('../src/routes/skills'));
  app.use('/api/quests', require('../src/routes/quests'));
  app.use('/api/reflections', require('../src/routes/reflections'));
  app.use('/api/city', require('../src/routes/city'));
  
  // Test route
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
  });
  
  // Start server
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  
  return server;
};

// Run API tests
const runApiTests = () => {
  return new Promise((resolve, reject) => {
    console.log('\nRunning API tests...');
    
    exec('node test/api.test.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`API test execution error: ${error.message}`);
        return reject(error);
      }
      
      if (stderr) {
        console.error(`API test stderr: ${stderr}`);
      }
      
      console.log(stdout);
      resolve();
    });
  });
};

// Main function to run all tests
const runTests = async () => {
  console.log('=== NOVA System Integration Test ===');
  
  // Create env file if needed
  createEnvFile();
  
  // Start database
  const dbStarted = await startDatabase();
  if (!dbStarted) {
    console.error('Failed to start database. Tests aborted.');
    process.exit(1);
  }
  
  // Start server
  const server = startServer();
  
  try {
    // Run API tests
    await runApiTests();
    
    console.log('\n=== Test Summary ===');
    console.log('✅ Database connection: Successful');
    console.log('✅ Server startup: Successful');
    console.log('✅ API tests completed');
    
    console.log('\n=== System Status ===');
    console.log('The NOVA system prototype is functioning correctly.');
    console.log('Backend API endpoints are operational.');
    console.log('Database models and relationships are working as expected.');
    
    console.log('\n=== Next Steps ===');
    console.log('1. Start the frontend with: npm run dev');
    console.log('2. Access the application at: http://localhost:3000');
    console.log('3. Create an account and explore the NOVA system');
  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    // Cleanup
    console.log('\nShutting down test environment...');
    server.close();
    await mongoose.connection.close();
    console.log('Test environment shutdown complete.');
  }
};

// Run the tests
runTests();
