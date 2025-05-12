export interface Insight {
    title: string;
    description: string;
    type: 'coupon' | 'movie' | 'product' | 'combined';
    severity: 'low' | 'medium' | 'high';
    metadata?: Record<string, any>;
  }