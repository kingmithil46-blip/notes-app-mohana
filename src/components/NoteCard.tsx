import React, { MouseEvent } from "react";
import { Pin, Trash2, Download, Copy, CheckSquare, Tag, Folder, Calendar } from "lucide-react";
import { Note } from "../types";
import { NOTESTORE_COLORS, formatDate, downloadNoteAsTXT } from "../utils";

interface NoteCardProps {
  key?: string | number;
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onTogglePin: (id: string, e: MouseEvent) => void;
  onDelete: (id: string, e: MouseEvent) => void;
  onDuplicate: (note: Note, e: MouseEvent) => void;
  onTagClick: (tag: string, e: MouseEvent) => void;
}

export default function NoteCard({
  note,
  isSelected,
  onSelect,
  onTogglePin,
  onDelete,
  onDuplicate,
  onTagClick,
}: NoteCardProps) {
  // Find custom color profile
  const colorProfile = NOTESTORE_COLORS.find((c) => c.slug === note.color) || NOTESTORE_COLORS[0];

  // Checklist completion overview
  const totalTasks = note.checklist.length;
  const completedTasks = note.checklist.filter((t) => t.done).length;
  const checklistCompleted = totalTasks > 0 && totalTasks === completedTasks;

  // Folder colors representing matching glows
  const folderColors: Record<string, string> = {
    all: "text-neon-purple",
    personal: "text-neon-pink",
    work: "text-neon-green",
    ideas: "text-neon-cyan",
    journal: "text-neon-gold"
  };

  const folderColor = folderColors[note.folder] || "text-neon-purple";

  // Truncate clean string for summary notes
  const getSnippet = () => {
    if (!note.content) return "No content";
    return note.content.length > 95 ? `${note.content.substring(0, 95)}...` : note.content;
  };

  return (
    <div
      onClick={onSelect}
      className={`relative group rounded-2xl border p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px] ${
        isSelected
          ? "ring-2 ring-purple-500/50 scale-[1.02] shadow-[0_0_25px_rgba(168,85,247,0.25)] " + colorProfile.cardClass
          : colorProfile.cardClass
      }`}
      id={`note-card-${note.id}`}
    >
      <div>
        {/* Card Header row */}
        <div className="flex items-start justify-between mb-2.5">
          {/* Title */}
          <h3 className="font-display font-semibold text-slate-100 text-sm tracking-tight leading-snug group-hover:text-white flex-1 pr-10 break-words transition-colors">
            {note.title || <span className="text-slate-500 italic font-normal">Untitled Document</span>}
          </h3>
 
          {/* Pin Trigger */}
          <button
            onClick={(e) => onTogglePin(note.id, e)}
            className={`absolute top-4 right-4 p-1.5 rounded-lg border border-transparent transition-all duration-300 hover:scale-110 focus:outline-none pointer-events-auto cursor-pointer ${
              note.pinned
                ? "text-yellow-400 bg-yellow-950/60 border-yellow-500/40 shadow-[0_0_12px_rgba(234,179,8,0.3)]"
                : "text-slate-600 opacity-0 group-hover:opacity-100 hover:text-yellow-400 hover:bg-yellow-950/30 hover:border-yellow-500/20"
            }`}
            title={note.pinned ? "Unpin document" : "Pin document to top"}
          >
            <Pin className={`w-3.5 h-3.5 ${note.pinned ? "fill-yellow-400 text-yellow-400" : ""}`} />
          </button>
        </div>

        {/* Note Categorize badge */}
        <div className={`flex items-center space-x-1.5 mb-3 text-[10px] font-mono font-bold uppercase tracking-wider ${folderColor}`}>
          <Folder className="w-3 h-3 opacity-85" />
          <span>{note.folder === "all" ? "General Work" : note.folder}</span>
        </div>

        {/* Body content preview OR Checklist elements block */}
        {note.isChecklistMode ? (
          <div className="space-y-1.5 mb-4 mt-1">
            <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-medium">
              <CheckSquare className={`w-3.5 h-3.5 ${checklistCompleted ? "text-lime-400 text-shadow-green" : "text-slate-500"}`} />
              <span className={checklistCompleted ? "text-lime-400 font-bold line-through" : "text-slate-300 font-semibold"}>
                {completedTasks}/{totalTasks} tasks resolved
              </span>
            </div>
            
            {/* Displaying first 2 checklist points inside note preview cards */}
            {note.checklist.length > 0 && (
              <div className="space-y-1 pl-1">
                {note.checklist.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.done ? "bg-lime-400 shadow-[0_0_5px_#39ff14]" : "bg-slate-700"}`}></span>
                    <span className={`truncate leading-none ${item.done ? "line-through text-slate-550 text-slate-500" : "font-medium text-slate-300"}`}>
                      {item.text || "Empty list item"}
                    </span>
                  </div>
                ))}
                {note.checklist.length > 2 && (
                  <span className="text-[10px] text-slate-500 pl-3.5 block font-medium">
                    + {note.checklist.length - 2} more items
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="font-sans text-xs text-slate-400 leading-relaxed mb-4 whitespace-pre-wrap break-words font-medium">
            {getSnippet()}
          </p>
        )}
      </div>

      {/* Footer Details & quick actions row */}
      <div className="pt-3 border-t border-slate-900 flex flex-col gap-2">
        {/* Custom Tags pills */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 leading-none">
            {note.tags.map((tag) => (
              <button
                key={tag}
                onClick={(e) => onTagClick(tag, e)}
                className="flex items-center space-x-1 bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 text-[9px] font-bold py-0.5 px-2 rounded-md transition-colors pointer-events-auto cursor-pointer"
              >
                <Tag className="w-2.5 h-2.5 text-cyan-400 opacity-80" />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-1">
          {/* Date stamp */}
          <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-mono font-semibold">
            <Calendar className="w-3 h-3 text-slate-600" />
            <span>{formatDate(note.date)}</span>
          </div>

          {/* Actions panel */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Clone note */}
            <button
              onClick={(e) => onDuplicate(note, e)}
              className="p-1 px-1.5 text-slate-500 hover:text-white rounded-md hover:bg-slate-900 hover:border-slate-800 border border-transparent pointer-events-auto cursor-pointer transition-colors"
              title="Duplicate Note"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            
            {/* Download/Export TXT */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadNoteAsTXT(note);
              }}
              className="p-1 px-1.5 text-slate-500 hover:text-white rounded-md hover:bg-slate-900 hover:border-slate-800 border border-transparent pointer-events-auto cursor-pointer transition-colors"
              title="Export as Text file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            
            {/* Delete note */}
            <button
              onClick={(e) => onDelete(note.id, e)}
              className="p-1 px-1.5 text-slate-500 hover:text-red-400 rounded-md hover:bg-red-950/40 hover:border-red-900/40 border border-transparent pointer-events-auto cursor-pointer transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
