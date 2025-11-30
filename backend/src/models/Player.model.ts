import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  playerId: number;
  firstName: string;
  lastName: string;
  position: string;
  team: string;
  height: string;
  weight: number;
  birthDate: Date;
  college: string;
  salary?: number;
  stats: {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    gamesPlayed: number;
  };
  // Caching metadata
  lastUpdated: Date;
  dataSource: 'sportsdata' | 'manual' | 'cache';
  season: number; // Which season this data is for
}

const PlayerSchema: Schema = new Schema({
  playerId: { 
    type: Number, 
    required: true,
    unique: true,
    index: true
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  position: { type: String, required: true },
  team: { type: String, required: true },
  height: { type: String },
  weight: { type: Number },
  birthDate: { type: Date },
  college: { type: String },
  salary: { type: Number },
  stats: {
    points: { type: Number, default: 0 },
    rebounds: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    steals: { type: Number, default: 0 },
    blocks: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 }
  },
  // Caching fields
  lastUpdated: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  dataSource: { 
    type: String, 
    enum: ['sportsdata', 'manual', 'cache'],
    default: 'manual'
  },
  season: {
    type: Number,
    default: 2024 // Current season
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
PlayerSchema.index({ playerId: 1, season: 1 });
PlayerSchema.index({ lastUpdated: 1 });

export default mongoose.model<IPlayer>('Player', PlayerSchema);