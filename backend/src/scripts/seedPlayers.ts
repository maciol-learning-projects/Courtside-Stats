import { connectDatabase } from '../config/database';
import Player from '../models/Player.model';
import { nbaApiService } from '../services/nbaApiService';
import mongoose from 'mongoose';

/**
 * Smart seeding - checks cache first, uses API if needed
 */
const seedNBAPlayers = async (forceRefresh: boolean = false): Promise<void> => {
  try {
    console.log('🌱 Starting smart player seeding...');
    await connectDatabase();

    // Check if we need to refresh
    const needsRefresh = forceRefresh || await nbaApiService.needsRefresh();
    
    if (needsRefresh) {
      console.log('🔄 Cache stale or forced refresh, fetching from API...');
      await nbaApiService.refreshAllPlayers();
    } else {
      console.log('💾 Cache is fresh, no API call needed');
      // Just ensure we have some data
      const playerCount = await Player.countDocuments();
      if (playerCount === 0) {
        console.log('📝 No players found, seeding with development data');
        await nbaApiService.getPlayers(0, 25, false); // This will use dev data
      }
    }

    const finalCount = await Player.countDocuments();
    console.log(`✅ Database ready with ${finalCount} players`);
    
    // Show sample
    const samplePlayers = await Player.find().limit(3);
    console.log('📊 Sample players:');
    samplePlayers.forEach(player => {
      console.log(`   - ${player.firstName} ${player.lastName} (${player.team})`);
      console.log(`     Source: ${player.dataSource}, Updated: ${player.lastUpdated.toISOString().split('T')[0]}`);
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
};

// CLI support
const main = async (): Promise<void> => {
  const forceRefresh = process.argv.includes('--refresh');
  await seedNBAPlayers(forceRefresh);
};

if (require.main === module) {
  main();
}

export { seedNBAPlayers };