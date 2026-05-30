import React, { ChangeEvent } from "react";
import { Inbox, User, Briefcase, Lightbulb, BookOpen, Tag, Plus, Download, Upload, BarChart3, CheckSquare } from "lucide-react";
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
          // integrity validation
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

  // Folder style definitions for vibrant neon glows
  const folderStyles: Record<string, { active: string; textGlow: string; badge: string; border: string }> = {
    all: {
      active: "bg-purple-950/40 border-l-3 border-purple-400 text-purple-200",
      textGlow: "text-neon-purple font-semibold",
      badge: "bg-purple-950 border border-purple-500/30 text-purple-400",
      border: "border-purple-500/20"
    },
    personal: {
      active: "bg-pink-950/40 border-l-3 border-pink-400 text-pink-200",
      textGlow: "text-neon-pink font-semibold",
      badge: "bg-pink-950 border border-pink-500/30 text-pink-400",
      border: "border-pink-500/20"
    },
    work: {
      active: "bg-lime-950/40 border-l-3 border-lime-400 text-lime-200",
      textGlow: "text-neon-green font-semibold",
      badge: "bg-lime-950 border border-lime-500/30 text-lime-400",
      border: "border-lime-500/20"
    },
    ideas: {
      active: "bg-cyan-950/40 border-l-3 border-cyan-400 text-cyan-200",
      textGlow: "text-neon-cyan font-semibold",
      badge: "bg-cyan-950 border border-cyan-500/30 text-cyan-400",
      border: "border-cyan-500/20"
    },
    journal: {
      active: "bg-yellow-950/40 border-l-3 border-yellow-400 text-yellow-200",
      textGlow: "text-neon-gold font-semibold",
      badge: "bg-yellow-950 border border-yellow-500/30 text-yellow-400",
      border: "border-yellow-500/20"
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050811] border-r border-slate-900 w-full text-slate-300" id="sidebar-container">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-900 bg-[#02050b] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center text-white scale-100 hover:scale-105 transition-transform duration-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <BookOpen className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold tracking-tight text-white text-base leading-tight">NEONOTE</h1>
            <span className="font-mono text-[9px] text-[#00f5ff] font-bold uppercase tracking-widest text-glow-cyan">PRO WORKSPACE</span>
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="p-4 border-b border-slate-900 bg-[#02050b]/50">
        <button
          onClick={onAddNote}
          id="btn-add-note-sidebar"
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-[0_0_20px_rgba(219,39,119,0.4)] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-300 transform active:scale-98 cursor-pointer border border-pink-500/30"
        >
          <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
          <span>New Document</span>
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-7 bg-dot-matrix">
        
        {/* Workspace Folders */}
        <div className="space-y-1.5">
          <h3 className="px-3 text-[10px] font-mono tracking-widest text-slate-500 font-bold uppercase mb-2">Workspace Directories</h3>
          <div className="space-y-0.5">
            {DEFAULT_FOLDERS.map((fold) => {
               const Icon = ICON_MAP[fold.iconName] || Inbox;
               const isSelected = currentFolder === fold.id && selectedTag === null;
               const count = getNoteCount(fold.id);
               const customStyle = folderStyles[fold.id] || folderStyles.all;
               
               return (
                <button
                  key={fold.id}
                  onClick={() => {
                    setCurrentFolder(fold.id);
                    setSelectedTag(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all text-left font-medium cursor-pointer ${
                    isSelected
                      ? customStyle.active + " shadow-[inset_0_0_12px_rgba(255,255,255,0.02)]"
                      : "text-slate-400 hover:bg-slate-900/40 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4.5 h-4.5 transition-colors ${isSelected ? customStyle.textGlow : "text-slate-500 group-hover:text-slate-300"}`} />
                    <span className={isSelected ? "font-semibold" : ""}>{fold.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isSelected ? customStyle.badge : "bg-slate-950 text-slate-500 border border-slate-900"
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
            <h3 className="text-[10px] font-mono tracking-widest text-slate-500 font-bold uppercase">Indexed Hashtags</h3>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="text-[10px] font-sans font-bold text-cyan-400 hover:text-white underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          {tagsList.length === 0 ? (
            <p className="px-3 text-xs italic text-slate-600">No tags indexed yet</p>
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
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                        : "bg-slate-950 border-slate-900 text-slate-400 hover:border-purple-500 hover:text-white hover:shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                    }`}
                  >
                    <Tag className={`w-3.5 h-3.5 ${isSelected ? "text-cyan-400" : "text-slate-600"}`} />
                    <span>{tag}</span>
                    <span className={`text-[9px] font-mono px-1 rounded-sm ${
                      isSelected ? "bg-cyan-950 text-cyan-400" : "bg-slate-900 text-slate-600"
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
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-905 border-slate-900/80 mx-3 space-y-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-bold text-slate-300">Workspace Statistics</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-[#02050b] p-2 rounded-lg border border-slate-900">
                <span className="block text-[9px] text-slate-500 font-mono font-bold tracking-wider">INDEXED</span>
                <span className="block text-base font-bold text-white font-sans">{totalNotes}</span>
              </div>
              <div className="bg-[#02050b] p-2 rounded-lg border border-slate-900">
                <span className="block text-[9px] text-slate-500 font-mono font-bold tracking-wider">PINNED</span>
                <span className="block text-base font-bold text-yellow-400 font-sans text-shadow-yellow">{pinnedCount}</span>
              </div>
            </div>

            {totalCheckItems > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>RESOLVED CHECKS</span>
                  <span className="text-pink-400 font-bold">{checklistPercent}%</span>
                </div>
                <div className="w-full bg-[#02050b] h-1.5 rounded-full overflow-hidden border border-slate-900">
                  <div
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${checklistPercent}%` }}
                  ></div>
                </div>
                <p className="text-[10px] italic text-slate-500 leading-tight">
                  {completedCheckItems} of {totalCheckItems} items resolved.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Backup and Recover Menu footer */}
      <div className="p-4 border-t border-slate-900 bg-[#02050b] space-y-2">
        <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest text-center font-bold">Offline Storage</span>
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
            className="flex items-center justify-center space-x-1.5 py-2 px-3 border border-slate-900 hover:border-purple-500 rounded-lg text-xs font-semibold text-slate-300 bg-slate-950 hover:bg-purple-950/30 hover:text-white transition-all cursor-pointer hover:shadow-[0_0_10px_rgba(168,85,247,0.15)]"
            title="Download JSON notes backup"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Export</span>
          </button>
          
          {/* Import action */}
          <label
            className="flex items-center justify-center space-x-1.5 py-2 px-3 border border-slate-900 hover:border-cyan-500 rounded-lg text-xs font-semibold text-slate-300 bg-slate-950 hover:bg-cyan-950/30 hover:text-white transition-all cursor-pointer hover:shadow-[0_0_10px_rgba(6,182,212,0.15)]"
            title="Load JSON notes data"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
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
