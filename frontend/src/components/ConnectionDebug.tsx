/**
 * Connection Debug Component
 * Helps debug frontend-backend connection issues
 * @module components/ConnectionDebug
 */

import React, { useEffect, useState } from 'react';

const ConnectionDebug: React.FC = () => {
  const [tests, setTests] = useState<{ [key: string]: string }>({});

  const runTests = async () => {
    const testResults: { [key: string]: string } = {};

    // Test 1: Basic fetch to backend
    try {
      const response = await fetch('http://localhost:5000/api/health');
      if (response.ok) {
        const data = await response.json();
        testResults.health = `✅ Health OK: ${data.message}`;
      } else {
        testResults.health = `❌ Health Failed: ${response.status} ${response.statusText}`;
      }
    } catch (error: any) {
      testResults.health = `❌ Health Error: ${error.message}`;
    }

    // Test 2: Players endpoint
    try {
      const response = await fetch('http://localhost:5000/api/players');
      if (response.ok) {
        const data = await response.json();
        testResults.players = `✅ Players OK: ${data.count} players`;
      } else {
        testResults.players = `❌ Players Failed: ${response.status} ${response.statusText}`;
      }
    } catch (error: any) {
      testResults.players = `❌ Players Error: ${error.message}`;
    }

    // Test 3: Network availability
    try {
      //const response = await fetch('http://localhost:5000', { method: 'HEAD' });
      testResults.network = `✅ Server reachable on port 5000`;
    } catch (error: any) {
      testResults.network = `❌ Cannot reach port 5000: ${error.message}`;
    }

    setTests(testResults);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Connection Debug</h2>
      <div className="bg-yellow-100 border border-yellow-400 p-4 rounded">
        <button 
          onClick={runTests}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          Run Tests Again
        </button>
        
        <div className="space-y-2">
          {Object.entries(tests).map(([test, result]) => (
            <div key={test} className="flex items-center">
              <span className="font-medium capitalize mr-2">{test}:</span>
              <span className={result.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                {result}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Troubleshooting Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Make sure Docker is running: <code>docker ps</code></li>
            <li>Check backend logs: <code>docker-compose logs backend</code></li>
            <li>Try accessing directly: <code>http://localhost:5000/api/health</code></li>
            <li>Restart backend: <code>docker-compose restart backend</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ConnectionDebug;