export interface SheetConfig {
  avatars: string[];
  angles: string[];
  awarenessLevels: string[];
  offers: string[];
  fomoElements: string[];
}

export interface AdTask {
  id: string;
  avatar: string;
  angle: string;
  awareness: string;
  variation: number; // 1, 2, or 3
}

