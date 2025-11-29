import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  teamId: number;
  name: string;
  city: string;
  abbreviation: string;  // e.g., "LAL"
  conference: 'East' | 'West';
  division: string;
  colors: {
    primary: string;
    secondary: string;
  };
  established: number;
  arena: string;
  coach: string;
  wins: number;
  losses: number;
  championships: number;
}

const TeamSchema: Schema = new Schema({
  teamId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },           // e.g., "Lakers"
  city: { type: String, required: true },           // e.g., "Los Angeles"
  abbreviation: { type: String, required: true },   // e.g., "LAL"
  conference: { 
    type: String, 
    required: true,
    enum: ['East', 'West']  // Only these values allowed
  },
  division: { type: String, required: true },       // e.g., "Pacific"
  colors: {
    primary: { type: String, default: '#552583' },   // Lakers purple
    secondary: { type: String, default: '#FDB927' }  // Lakers gold
  },
  established: { type: Number },    // Year founded
  arena: { type: String },          // e.g., "Crypto.com Arena"
  coach: { type: String },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  championships: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<ITeam>('Team', TeamSchema);