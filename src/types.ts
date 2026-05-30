export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  folder: string; // 'all' | 'personal' | 'work' | 'ideas' | 'journal' | custom name
  tags: string[];
  color: string; // The color slug: 'neutral', 'peach', 'yellow', 'mint', 'sky', 'lavender', 'rose'
  pinned: boolean;
  checklist: ChecklistItem[];
  isChecklistMode: boolean;
  updatedAt: number;
}

export interface FolderConfig {
  id: string;
  name: string;
  iconName: string; // 'Inbox' | 'User' | 'Briefcase' | 'Lightbulb' | 'BookOpen'
}

export interface NoteColor {
  slug: string;
  name: string;
  bgClass: string;     // bg-xxx-xxx or similar for preview grids
  cardClass: string;   // fully fleshed styling for the individual cards
  borderClass: string;
}
