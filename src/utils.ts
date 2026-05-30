import { NoteColor, FolderConfig, Note } from "./types";

export const NOTESTORE_COLORS: NoteColor[] = [
  {
    slug: "neutral",
    name: "Royal Maroon",
    bgClass: "bg-[#5C0612] text-[#F9E7B9] font-medium",
    cardClass: "bg-[#5C0612] border-[#D4AF37] pro-shadow hover:pro-shadow-active hover:border-[#F9D24D] duration-300 text-white",
    borderClass: "border-[#D4AF37]",
  },
  {
    slug: "peach",
    name: "Luxury Champagne",
    bgClass: "bg-[#F9F5EA] text-[#5C0612] font-medium",
    cardClass: "bg-[#F9F5EA] border-[#E5C158] pro-shadow hover:pro-shadow-active hover:border-[#C5A030] duration-300 text-[#5C0612]",
    borderClass: "border-[#E5C158]",
  },
  {
    slug: "yellow",
    name: "Burgundy Velvet",
    bgClass: "bg-[#4A000A] text-[#F3E5AB] font-medium",
    cardClass: "bg-[#4A000A] border-[#C5A059] pro-shadow hover:pro-shadow-active hover:border-[#D4AF37] duration-300 text-white",
    borderClass: "border-[#C5A059]",
  },
  {
    slug: "mint",
    name: "Imperial Crimson",
    bgClass: "bg-[#E2C2C6] text-[#4A000A] font-medium",
    cardClass: "bg-[#E2C2C6] border-[#7F1D1D] pro-shadow hover:pro-shadow-active hover:border-[#991B1B] duration-300 text-[#4A000A]",
    borderClass: "border-[#7F1D1D]",
  },
  {
    slug: "sky",
    name: "Dorado Gold",
    bgClass: "bg-[#FDE293] text-[#3F000B] font-medium",
    cardClass: "bg-[#FDE293] border-[#B8901C] pro-shadow hover:pro-shadow-active hover:border-[#D4AF37] duration-300 text-[#3F000B]",
    borderClass: "border-[#B8901C]",
  },
  {
    slug: "lavender",
    name: "Baroque Rose",
    bgClass: "bg-[#FFF0F2] text-[#5C0612] font-medium",
    cardClass: "bg-[#FFF0F2] border-[#E2C2C6] pro-shadow hover:pro-shadow-active hover:border-[#D4AF37] duration-300 text-[#5C0612]",
    borderClass: "border-[#E2C2C6]",
  },
  {
    slug: "rose",
    name: "Cabinet Gold Wood",
    bgClass: "bg-[#F4EAD4] text-[#421E01] font-medium",
    cardClass: "bg-[#F4EAD4] border-[#D4AF37] pro-shadow hover:pro-shadow-active hover:border-[#C5A030] duration-300 text-[#421E01]",
    borderClass: "border-[#D4AF37]",
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
