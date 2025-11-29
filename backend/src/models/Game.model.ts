import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGame extends Document {
  gameId: string;
  date: Date;
  homeTeam: Types.ObjectId;    // Reference to Team model
  awayTeam: Types.ObjectId;    // Reference to Team model
  status: 'scheduled' | 'live' | 'final';
  quarter: number;
  timeRemaining: string;       // e.g., "5:23"
  scores: {
    home: number;
    away: number;
    quarterBreakdown: {
      q1: { home: number; away: number };
      q2: { home: number; away: number };
      q3: { home: number; away: number };
      q4: { home: number; away: number };
      ot?: { home: number; away: number };
    }
  };
  location: string;
  attendance?: number;
  highlights: Array<{
    time: string;
    quarter: number;
    description: string;
    player?: Types.ObjectId;   // Reference to Player model
    type: 'score' | 'turnover' | 'foul' | 'timeout';
  }>;
}

const GameSchema: Schema = new Schema({
  gameId: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  homeTeam: { 
    type: Schema.Types.ObjectId, 
    ref: 'Team',               // Links to Team collection
    required: true 
  },
  awayTeam: { 
    type: Schema.Types.ObjectId, 
    ref: 'Team', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'live', 'final'],
    default: 'scheduled'
  },
  quarter: { type: Number, default: 1 },
  timeRemaining: { type: String, default: '12:00' },
  scores: {
    home: { type: Number, default: 0 },
    away: { type: Number, default: 0 },
    quarterBreakdown: {
      q1: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } },
      q2: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } },
      q3: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } },
      q4: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } },
      ot: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } }
    }
  },
  location: { type: String },
  attendance: { type: Number },
  highlights: [{
    time: { type: String, required: true },
    quarter: { type: Number, required: true },
    description: { type: String, required: true },
    player: { type: Schema.Types.ObjectId, ref: 'Player' },
    type: { 
      type: String, 
      enum: ['score', 'turnover', 'foul', 'timeout'],
      required: true
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model<IGame>('Game', GameSchema);