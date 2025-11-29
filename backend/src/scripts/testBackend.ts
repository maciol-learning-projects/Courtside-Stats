/**
 * Backend Health Check Script
 * Quickly tests if the backend services are working
 * @module scripts/testBackend
 */

import { connectDatabase } from '../config/database';
import mongoose from 'mongoose';
import Player from '../models/Player.model';
import Team from '../models/Team.model';

/**
 * @desc    Run a quick health check on the backend services
 */
const testBackend = async (): Promise<void> => {
  console.log('🧪 Starting Backend Health Check...\n');

  try {
    // Test 1: Database Connection
    console.log('1. Testing Database Connection...');
    await connectDatabase();
    console.log('   ✅ Database connection successful\n');

    // Test 2: Check Actual Data
    console.log('2. Checking Database Data...');
    const playerCount = await Player.countDocuments();
    const teamCount = await Team.countDocuments();
    
    console.log(`   📊 Players in database: ${playerCount}`);
    console.log(`   🏀 Teams in database: ${teamCount}`);
    
    if (playerCount > 0) {
      const samplePlayers = await Player.find().limit(3);
      console.log('   👥 Sample players:');
      samplePlayers.forEach(player => {
        console.log(`      - ${player.firstName} ${player.lastName} (${player.team})`);
      });
    }
    
    console.log('   ✅ Data check completed\n');

    // Test 3: Check if Models Compile
    console.log('3. Testing Data Models...');
    const { default: Game } = await import('../models/Game.model');
    const gameCount = await Game.countDocuments();
    console.log(`   🎮 Games in database: ${gameCount}`);
    console.log('   ✅ All data models compiled successfully\n');

    console.log('🎉 BACKEND HEALTH CHECK PASSED!');
    console.log('🚀 Ready for Phase 2: Frontend Development\n');

  } catch (error) {
    console.error('❌ Backend Health Check Failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
  }
};

// Run the test if this file is executed directly
if (require.main === module) {
  testBackend();
}

export { testBackend };