// Import Mongoose - this is our MongoDB library for Node.js
import mongoose, { Schema, Document } from 'mongoose';

// Define an Interface for TypeScript - this ensures type safety
export interface IPlayer extends Document {
  playerId: number;
  firstName: string;
  lastName: string;
  position: string;  // e.g., "PG", "SG", "SF", "PF", "C"
  team: string;      // e.g., "Los Angeles Lakers"
  height: string;    // e.g., "6'9""
  weight: number;    // in pounds
  birthDate: Date;
  college: string;
  salary?: number;   // The ? means this field is optional
  stats: {           // Nested object for career averages
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    gamesPlayed: number;
  };
}

// Create the actual Database Schema - this defines how data is stored
const PlayerSchema: Schema = new Schema({
  playerId: { 
    type: Number, 
    required: true,     // Must have this field
    unique: true        // No two players can have same ID
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  position: { type: String, required: true },
  team: { type: String, required: true },
  height: { type: String },           // Optional field
  weight: { type: Number },           // Optional field
  birthDate: { type: Date },
  college: { type: String },
  salary: { type: Number },
  stats: {
    points: { type: Number, default: 0 },      // default value if not provided
    rebounds: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    steals: { type: Number, default: 0 },
    blocks: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 }
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

// Create and export the Model - this is what we'll use to query the database
export default mongoose.model<IPlayer>('Player', PlayerSchema);