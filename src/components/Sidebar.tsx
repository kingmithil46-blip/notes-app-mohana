import React, { ChangeEvent } from "react";
import { Inbox, User, Briefcase, Lightbulb, BookOpen, Tag, Plus, Download, Upload, BarChart3, CheckSquare, Sparkles } from "lucide-react";
import { FolderConfig, Note } from "../types";
import { DEFAULT_FOLDERS, downloadAllNotesAsJSON } from "../utils";

interface SidebarProps {
  currentFolder: string;
  setCurrentFolder: (folderId: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  notes: Note[];
  onAddNote: () => void;
  onImportBackup: (importedNotes: Note[]) => void;
}

const ICON_MAP: Record<string, any> = {
  Inbox,
  User,
  Briefcase,
  Lightbulb,
  BookOpen,
};

export default function Sidebar({
  currentFolder,
  setCurrentFolder,
  selectedTag,
  setSelectedTag,
  notes,
  onAddNote,
  onImportBackup,
}: SidebarProps) {
  // Count matching folders
  const getNoteCount = (folderId: string) => {
    if (folderId === "all") return notes.length;
    return notes.filter((n) => n.folder === folderId).length;
  };

  // Compile all unique tags and their respective frequencies
  const tagsCount: Record<string, number> = {};
  notes.forEach((note) => {
    note.tags.forEach((tag) => {
      const cleanTag = tag.trim();
      if (cleanTag) {
        tagsCount[cleanTag] = (tagsCount[cleanTag] || 0) + 1;
      }
    });
  });
  const tagsList = Object.entries(tagsCount).sort((a, b) => b[1] - a[1]);

  // Statistics
  const totalNotes = notes.length;
  const pinnedCount = notes.filter((n) => n.pinned).length;
  
  // Calculate completion percentage of checklists across notes
  let totalCheckItems = 0;
  let completedCheckItems = 0;
  notes.forEach((n) => {
    if (n.isChecklistMode && n.checklist.length > 0) {
      n.checklist.forEach((item) => {
        totalCheckItems++;
        if (item.done) completedCheckItems++;
      });
    }
  });
  const checklistPercent = totalCheckItems > 0 ? Math.round((completedCheckItems / totalCheckItems) * 100) : 0;

  // File import handler
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          // Rudimentary integrity validation
          const validatedNotes = json.filter((item: any) => {
            return item && typeof item === "object" && typeof item.id === "string";
          }) as Note[];
          
          if (validatedNotes.length > 0) {
            onImportBackup(validatedNotes);
            alert(`Successfully imported ${validatedNotes.length} notes!`);
          } else {
            alert("No valid notes found inside the backup file.");
          }
        } else {
          alert("Backup must be a valid JSON array.");
        }
      } catch (err) {
        alert("Unable to parse the backup file. Please select a valid notes backup JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset
  };

  return (
    <div className="flex flex-col h-full bg-[#3F000B] border-r border-[#6B1521] w-full text-[#ECD2B9]/90" id="sidebar-container">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#6B1521] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#A88121] flex items-center justify-center text-[#3F000B] font-semibold">
            <Sparkles className="w-5 h-5 text-[#3F000B]" />
          </div>
          <div>
            <h1 className="font-display font-bold tracking-tight text-white text-base leading-tight">ProNote</h1>
            <span className="font-mono text-[9px] text-[#D4AF37] font-bold uppercase tracking-wider">Royal Suite</span>
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="p-4 border-b border-[#6B1521]">
        <button
          onClick={onAddNote}
          id="btn-add-note-sidebar"
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A030] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#3F000B] font-bold py-3 px-4 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-black/20 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
          <span>New Document</span>
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-7">
        
        {/* Workspace Folders */}
        <div className="space-y-1.5">
          <h3 className="px-3 text-[10px] font-mono tracking-wider text-[#A57880] font-bold uppercase mb-2">Workspace</h3>
          <div className="space-y-0.5">
            {DEFAULT_FOLDERS.map((fold) => {
               const Icon = ICON_MAP[fold.iconName] || Inbox;
               const isSelected = currentFolder === fold.id && selectedTag === null;
               const count = getNoteCount(fold.id);
               
               return (
                <button
                  key={fold.id}
                  onClick={() => {
                    setCurrentFolder(fold.id);
                    setSelectedTag(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all text-left font-medium cursor-pointer ${
                    isSelected
                      ? "bg-[#5A0C16] text-[#FFF6F2] font-semibold border-l-2 border-[#D4AF37]"
                      : "text-[#ECD2B9]/80 hover:bg-[#5C0612]/30 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4.5 h-4.5 ${isSelected ? "text-[#D4AF37]" : "text-[#A57880]"}`} />
                    <span>{fold.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isSelected ? "bg-[#D4AF37] text-[#3F000B] font-bold" : "bg-[#250106] text-[#A57880] border border-[#6B1521]/50"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Tags Filter */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-3">
            <h3 className="text-[10px] font-mono tracking-wider text-[#A57880] font-bold uppercase">Indexed Tags</h3>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="text-[10px] font-sans font-semibold text-[#D4AF37] hover:text-[#FFF6F2] underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          {tagsList.length === 0 ? (
            <p className="px-3 text-xs italic text-[#A57880]">No tags indexed yet</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 px-3">
              {tagsList.map(([tag, count]) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#D4AF37] border-[#D4AF37] text-[#3F000B] font-bold"
                        : "bg-[#5C0612]/20 border-[#6B1521] text-[#ECD2B9] hover:border-[#D4AF37] hover:text-white"
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5 opacity-80" />
                    <span>{tag}</span>
                    <span className={`text-[9px] font-mono px-1 rounded-sm ${
                      isSelected ? "bg-[#3F000B] text-[#D4AF37]" : "bg-[#250106] text-[#A57880]"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Analytics Card */}
        {totalNotes > 0 && (
          <div className="p-4 bg-[#5C0612]/30 rounded-xl border border-[#6B1521]/40 mx-3 space-y-3.5 shadow-sm">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-[#A57880]" />
              <h4 className="text-xs font-bold text-[#ECD2B9]">Metrics Panel</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-[#250106] p-2 rounded-lg border border-[#6B1521]/50">
                <span className="block text-[9px] text-[#A57880] font-mono font-bold tracking-wider">TOTALS</span>
                <span className="block text-base font-bold text-white font-sans">{totalNotes}</span>
              </div>
              <div className="bg-[#250106] p-2 rounded-lg border border-[#6B1521]/50">
                <span className="block text-[9px] text-[#A57880] font-mono font-bold tracking-wider">PINNED</span>
                <span className="block text-base font-bold text-[#D4AF37] font-sans">{pinnedCount}</span>
              </div>
            </div>

            {totalCheckItems > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono text-[#A57880]">
                  <span>RESOLVED CHECKS</span>
                  <span className="text-[#D4AF37] font-bold">{checklistPercent}%</span>
                </div>
                <div className="w-full bg-[#250106] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#D4AF37] to-[#E5C158] h-full rounded-full transition-all duration-500"
                    style={{ width: `${checklistPercent}%` }}
                  ></div>
                </div>
                <p className="text-[10px] italic text-[#A57880] leading-tight">
                  {completedCheckItems} of {totalCheckItems} items resolved.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Backup and Recover Menu footer */}
      <div className="p-4 border-t border-[#6B1521] bg-[#2E0207] space-y-2">
        <span className="block text-[9px] font-mono text-[#A57880] uppercase tracking-widest text-center font-bold">STORAGE SERVICES</span>
        <div className="grid grid-cols-2 gap-2">
          {/* Export action */}
          <button
            onClick={() => {
              if (notes.length === 0) {
                alert("You don't have any notes to export yet.");
                return;
              }
              downloadAllNotesAsJSON(notes);
            }}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 border border-[#6B1521] hover:border-[#D4AF37] rounded-lg text-xs font-semibold text-[#ECD2B9] bg-[#5C0612]/30 hover:bg-[#5C0612]/60 transition-all cursor-pointer"
            title="Download JSON notes backup"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Export</span>
          </button>
          
          {/* Import action */}
          <label
            className="flex items-center justify-center space-x-1.5 py-2 px-3 border border-[#6B1521] hover:border-[#D4AF37] rounded-lg text-xs font-semibold text-[#ECD2B9] bg-[#5C0612]/30 hover:bg-[#5C0612]/60 transition-all cursor-pointer"
            title="Load JSON notes data"
          >
            <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
