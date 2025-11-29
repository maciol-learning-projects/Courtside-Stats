/**
 * Data Seeding Script
 * Populates the database with sample NBA players, teams, and games
 * @module scripts/seedData
 */

import { connectDatabase } from '../config/database';
import Player from '../models/Player.model';
import Team from '../models/Team.model';
import Game from '../models/Game.model';
import mongoose from 'mongoose';

/**
 * @desc    Sample NBA teams data
 */
const sampleTeams = [
  {
    teamId: 1,
    name: 'Lakers',
    city: 'Los Angeles',
    abbreviation: 'LAL',
    conference: 'West',
    division: 'Pacific',
    colors: {
      primary: '#552583',
      secondary: '#FDB927'
    },
    established: 1947,
    arena: 'Crypto.com Arena',
    coach: 'Darvin Ham',
    wins: 42,
    losses: 30,
    championships: 17
  },
  {
    teamId: 2,
    name: 'Warriors',
    city: 'Golden State',
    abbreviation: 'GSW',
    conference: 'West',
    division: 'Pacific',
    colors: {
      primary: '#1D428A',
      secondary: '#FFC72C'
    },
    established: 1946,
    arena: 'Chase Center',
    coach: 'Steve Kerr',
    wins: 39,
    losses: 34,
    championships: 7
  },
  {
    teamId: 3,
    name: 'Celtics',
    city: 'Boston',
    abbreviation: 'BOS',
    conference: 'East',
    division: 'Atlantic',
    colors: {
      primary: '#007A33',
      secondary: '#BA9653'
    },
    established: 1946,
    arena: 'TD Garden',
    coach: 'Joe Mazzulla',
    wins: 57,
    losses: 15,
    championships: 17
  },
  {
    teamId: 4,
    name: 'Bulls',
    city: 'Chicago',
    abbreviation: 'CHI',
    conference: 'East',
    division: 'Central',
    colors: {
      primary: '#CE1141',
      secondary: '#000000'
    },
    established: 1966,
    arena: 'United Center',
    coach: 'Billy Donovan',
    wins: 34,
    losses: 38,
    championships: 6
  }
];

/**
 * @desc    Sample NBA players data
 */
const samplePlayers = [
  // Lakers Players
  {
    playerId: 1,
    firstName: 'LeBron',
    lastName: 'James',
    position: 'SF',
    team: 'Los Angeles Lakers',
    height: "6'9\"",
    weight: 250,
    birthDate: new Date('1984-12-30'),
    college: 'St. Vincent-St. Mary HS (Ohio)',
    salary: 44474988,
    stats: {
      points: 25.3,
      rebounds: 7.3,
      assists: 8.3,
      steals: 1.3,
      blocks: 0.5,
      gamesPlayed: 1421
    }
  },
  {
    playerId: 2,
    firstName: 'Anthony',
    lastName: 'Davis',
    position: 'PF',
    team: 'Los Angeles Lakers',
    height: "6'10\"",
    weight: 253,
    birthDate: new Date('1993-03-11'),
    college: 'Kentucky',
    salary: 40600080,
    stats: {
      points: 24.7,
      rebounds: 12.6,
      assists: 3.5,
      steals: 1.2,
      blocks: 2.3,
      gamesPlayed: 660
    }
  },
  // Warriors Players
  {
    playerId: 3,
    firstName: 'Stephen',
    lastName: 'Curry',
    position: 'PG',
    team: 'Golden State Warriors',
    height: "6'2\"",
    weight: 185,
    birthDate: new Date('1988-03-14'),
    college: 'Davidson',
    salary: 51915615,
    stats: {
      points: 27.5,
      rebounds: 4.4,
      assists: 5.2,
      steals: 1.3,
      blocks: 0.2,
      gamesPlayed: 882
    }
  },
  {
    playerId: 4,
    firstName: 'Klay',
    lastName: 'Thompson',
    position: 'SG',
    team: 'Golden State Warriors',
    height: "6'6\"",
    weight: 220,
    birthDate: new Date('1990-02-08'),
    college: 'Washington State',
    salary: 43219440,
    stats: {
      points: 18.1,
      rebounds: 3.5,
      assists: 2.3,
      steals: 0.7,
      blocks: 0.4,
      gamesPlayed: 716
    }
  },
  // Celtics Players
  {
    playerId: 5,
    firstName: 'Jayson',
    lastName: 'Tatum',
    position: 'SF',
    team: 'Boston Celtics',
    height: "6'8\"",
    weight: 210,
    birthDate: new Date('1998-03-03'),
    college: 'Duke',
    salary: 32600060,
    stats: {
      points: 27.2,
      rebounds: 8.3,
      assists: 4.9,
      steals: 1.0,
      blocks: 0.5,
      gamesPlayed: 466
    }
  },
  {
    playerId: 6,
    firstName: 'Jaylen',
    lastName: 'Brown',
    position: 'SG',
    team: 'Boston Celtics',
    height: "6'6\"",
    weight: 223,
    birthDate: new Date('1996-10-24'),
    college: 'California',
    salary: 31830357,
    stats: {
      points: 23.4,
      rebounds: 5.6,
      assists: 3.6,
      steals: 1.1,
      blocks: 0.4,
      gamesPlayed: 508
    }
  },
  // Bulls Players
  {
    playerId: 7,
    firstName: 'DeMar',
    lastName: 'DeRozan',
    position: 'SF',
    team: 'Chicago Bulls',
    height: "6'6\"",
    weight: 220,
    birthDate: new Date('1989-08-07'),
    college: 'USC',
    salary: 28600000,
    stats: {
      points: 24.2,
      rebounds: 4.3,
      assists: 5.3,
      steals: 1.1,
      blocks: 0.3,
      gamesPlayed: 1042
    }
  },
  {
    playerId: 8,
    firstName: 'Zach',
    lastName: 'LaVine',
    position: 'SG',
    team: 'Chicago Bulls',
    height: "6'5\"",
    weight: 200,
    birthDate: new Date('1995-03-10'),
    college: 'UCLA',
    salary: 40000000,
    stats: {
      points: 24.8,
      rebounds: 4.5,
      assists: 4.3,
      steals: 0.9,
      blocks: 0.2,
      gamesPlayed: 548
    }
  }
];

/**
 * @desc    Main function to seed the database
 */
const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await connectDatabase();

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await Player.deleteMany({});
    await Team.deleteMany({});
    await Game.deleteMany({});

    // Insert teams
    console.log('🏀 Inserting teams...');
    const createdTeams = await Team.insertMany(sampleTeams);
    console.log(`✅ Inserted ${createdTeams.length} teams`);

    // Insert players
    console.log('👥 Inserting players...');
    const createdPlayers = await Player.insertMany(samplePlayers);
    console.log(`✅ Inserted ${createdPlayers.length} players`);

    // Create a sample game
    console.log('🎮 Creating sample game...');
    const lakers = createdTeams.find(team => team.abbreviation === 'LAL');
    const warriors = createdTeams.find(team => team.abbreviation === 'GSW');

    if (lakers && warriors) {
      const sampleGame = {
        gameId: 'G2024041501',
        date: new Date('2024-04-15T19:00:00Z'),
        homeTeam: lakers._id,
        awayTeam: warriors._id,
        status: 'scheduled' as const,
        quarter: 1,
        timeRemaining: '12:00',
        scores: {
          home: 0,
          away: 0,
          quarterBreakdown: {
            q1: { home: 0, away: 0 },
            q2: { home: 0, away: 0 },
            q3: { home: 0, away: 0 },
            q4: { home: 0, away: 0 }
          }
        },
        location: 'Crypto.com Arena',
        attendance: 18997,
        highlights: []
      };

      await Game.create(sampleGame);
      console.log('✅ Created sample game: Lakers vs Warriors');
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Teams: ${createdTeams.length}`);
    console.log(`👥 Players: ${createdPlayers.length}`);
    console.log('🚀 Your Courtside Stats app is now ready with sample data!');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase, sampleTeams, samplePlayers };