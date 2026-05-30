import { NoteColor, FolderConfig, Note } from "./types";

export const NOTESTORE_COLORS: NoteColor[] = [
  {
    slug: "neutral",
    name: "Cyber Purple",
    bgClass: "bg-[#0c101b]/95 border border-purple-500/40 text-purple-300",
    cardClass: "bg-[#0c101b]/95 border-purple-500/30 glow-purple hover:border-purple-400/85 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300 text-slate-200",
    borderClass: "border-purple-500/40",
  },
  {
    slug: "peach",
    name: "Hot Magenta",
    bgClass: "bg-[#0c101b]/95 border border-pink-500/40 text-pink-300",
    cardClass: "bg-[#0c101b]/95 border-pink-500/30 glow-pink hover:border-pink-400/85 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all duration-300 text-slate-200",
    borderClass: "border-pink-500/40",
  },
  {
    slug: "yellow",
    name: "Electric Gold",
    bgClass: "bg-[#0c101b]/95 border border-yellow-500/40 text-yellow-300",
    cardClass: "bg-[#0c101b]/95 border-yellow-500/30 glow-gold hover:border-yellow-400/85 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all duration-300 text-slate-200",
    borderClass: "border-yellow-500/40",
  },
  {
    slug: "mint",
    name: "Radioactive Lime",
    bgClass: "bg-[#0c101b]/95 border border-lime-500/40 text-lime-300",
    cardClass: "bg-[#0c101b]/95 border-lime-500/30 glow-green hover:border-lime-400/85 hover:shadow-[0_0_20px_rgba(132,204,22,0.3)] transition-all duration-300 text-slate-200",
    borderClass: "border-lime-500/40",
  },
  {
    slug: "sky",
    name: "Laser Cyan",
    bgClass: "bg-[#0c101b]/95 border border-cyan-500/40 text-cyan-300",
    cardClass: "bg-[#0c101b]/95 border-cyan-500/30 glow-cyan hover:border-cyan-400/85 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 text-slate-200",
    borderClass: "border-cyan-500/40",
  },
  {
    slug: "lavender",
    name: "Oceanic Blue",
    bgClass: "bg-[#0c101b]/95 border border-blue-500/40 text-blue-300",
    cardClass: "bg-[#0c101b]/95 border-blue-500/30 glow-blue hover:border-blue-400/85 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300 text-slate-200",
    borderClass: "border-blue-500/40",
  },
  {
    slug: "rose",
    name: "Solar Orange",
    bgClass: "bg-[#0c101b]/95 border border-orange-500/40 text-orange-300",
    cardClass: "bg-[#0c101b]/95 border-orange-500/30 glow-orange hover:border-orange-400/85 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all duration-300 text-slate-200",
    borderClass: "border-orange-500/40",
  }
];

export const DEFAULT_FOLDERS: FolderConfig[] = [
  { id: "all", name: "All Folders", iconName: "Inbox" },
  { id: "personal", name: "Personal", iconName: "User" },
  { id: "work", name: "Business & Work", iconName: "Briefcase" },
  { id: "ideas", name: "Sparks & Ideas", iconName: "Lightbulb" },
  { id: "journal", name: "Daily Journal", iconName: "BookOpen" }
];

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Unknown Date";

    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return d.toLocaleDateString("en-US", options);
  } catch {
    return "Recent";
  }
}

// Downloads individual note as file
export function downloadNoteAsTXT(note: Note) {
  let content = `Title: ${note.title || "Untitled Note"}\n`;
  content += `Created: ${formatDate(note.date)}\n`;
  content += `Tagging: ${note.tags.join(", ") || "None"}\n`;
  content += `Folder: ${note.folder}\n`;
  content += `===============================================\n\n`;

  if (note.isChecklistMode) {
    content += `[ Checklist Elements ]\n`;
    note.checklist.forEach((item) => {
      content += `${item.done ? "[x]" : "[ ]"} ${item.text}\n`;
    });
    if (note.content) {
      content += `\n[ Explanatory Notes ]\n${note.content}\n`;
    }
  } else {
    content += note.content;
  }

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const trigger = document.createElement("a");
  trigger.href = url;
  trigger.download = `${(note.title || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "note"}.txt`;
  document.body.appendChild(trigger);
  trigger.click();
  document.body.removeChild(trigger);
  URL.revokeObjectURL(url);
}

// Download entire database as JSON backup
export function downloadAllNotesAsJSON(notes: Note[]) {
  const jsonStr = JSON.stringify(notes, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const trigger = document.createElement("a");
  trigger.href = url;
  trigger.download = `notes-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(trigger);
  trigger.click();
  document.body.removeChild(trigger);
  URL.revokeObjectURL(url);
}
