
export interface ScanResult {
  id: string;
  image: string;
  objectName: string;
  classification: 'reusable' | 'recyclable' | 'non-recyclable';
  confidence: number;
  materials: string[];
  environmentalImpact: {
    carbonFootprint: string;
    recyclability: string;
    biodegradability: string;
  };
  disposalTips: string[];
  reuseSuggestions: string[];
  educationalFacts: string[];
  timestamp: string;
}

export interface VoiceCommand {
  command: string;
  confidence: number;
}
