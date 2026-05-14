
export type AppView = 'dashboard' | 'content' | 'audio' | 'analytics' | 'strategist' | 'copywriter' | 'vision' | 'ugc' | 'product_photo' | 'testimonial' | 'landing' | 'studio_ai' | 'affiliate';

export interface CampaignData {
  id: string;
  name: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
}

export interface AdContent {
  title: string;
  headline: string;
  body: string;
  cta: string;
}

export interface Recommendation {
  title: string;
  babyExplanation: string;
  technicalAnalysis: string;
  actionPlan: string[];
  impact: 'Tinggi' | 'Sedang' | 'Rendah';
}

export interface CopyVariation {
  hook: string;
  body: string;
  cta: string;
  hashtags: string;
}
