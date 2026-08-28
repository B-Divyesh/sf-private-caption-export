export interface Caption {
  id: string;
  start: number;
  end: number;
  speaker: string;
  text: string;
  uncertain: boolean;
  selected: boolean;
}

export interface Project {
  title: string;
  date: string;
  consent: boolean;
  captions: Caption[];
  exportTheme?: 'paper' | 'dark' | 'high-contrast';
}
