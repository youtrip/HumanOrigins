export interface TimelinePoint {
  year: string; // e.g., "-200k"
  yearLabel: string;
  event: string;
  impactLevel: number; // 0-100 arbitrary scale of "dominance capability"
  description: string;
}

export interface Theory {
  title: string;
  icon: 'brain' | 'fire' | 'message' | 'tool';
  shortDescription: string;
  fullAnalysis: string;
  credibilityScore: number; // 1-10
}

export interface SingularityResponse {
  mainThesis: string;
  theories: Theory[];
  timeline: TimelinePoint[];
  conclusion: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}
