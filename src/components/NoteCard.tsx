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

  // Truncate clean string for summary notes
  const getSnippet = () => {
    if (!note.content) return "No content";
    return note.content.length > 95 ? `${note.content.substring(0, 95)}...` : note.content;
  };

  return (
    <div
      onClick={onSelect}
      className={`relative group rounded-2xl border p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px] ${
        isSelected
          ? "ring-2 ring-[#D4AF37]/60 ring-offset-1 transform -translate-y-1 " + colorProfile.cardClass
          : colorProfile.cardClass
      }`}
      id={`note-card-${note.id}`}
    >
      <div>
        {/* Card Header row */}
        <div className="flex items-start justify-between mb-2.5">
          {/* Title */}
          <h3 className="font-display font-semibold text-slate-900 text-sm tracking-tight leading-snug group-hover:text-[#5C0612] flex-1 pr-6 break-words">
            {note.title || <span className="text-slate-400 italic font-normal">Untitled Document</span>}
          </h3>
 
          {/* Pin Trigger */}
          <button
            onClick={(e) => onTogglePin(note.id, e)}
            className={`absolute top-4 right-4 p-1.5 rounded-lg transition-all duration-200 hover:scale-110 focus:outline-none pointer-events-auto cursor-pointer ${
              note.pinned
                ? "text-[#5C0612] bg-[#F4EAD4]"
                : "text-slate-400 opacity-0 group-hover:opacity-100 hover:text-[#5C0612] hover:bg-[#F4EAD4]"
            }`}
            title={note.pinned ? "Unpin document" : "Pin document to top"}
          >
            <Pin className={`w-3.5 h-3.5 ${note.pinned ? "fill-[#5C0612] text-[#5C0612]" : ""}`} />
          </button>
        </div>

        {/* Note Categorize badge */}
        <div className="flex items-center space-x-1.5 mb-3 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
          <Folder className="w-3 h-3 text-slate-300" />
          <span>{note.folder === "all" ? "General Work" : note.folder}</span>
        </div>

        {/* Body content preview OR Checklist elements block */}
        {note.isChecklistMode ? (
          <div className="space-y-1.5 mb-4 mt-1">
            <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
              <CheckSquare className={`w-3.5 h-3.5 ${checklistCompleted ? "text-emerald-600" : "text-slate-400"}`} />
              <span className={checklistCompleted ? "text-emerald-700 font-bold line-through" : "text-slate-700 font-semibold"}>
                {completedTasks}/{totalTasks} tasks resolved
              </span>
            </div>
            
            {/* Displaying first 2 checklist points inside note preview cards */}
            {note.checklist.length > 0 && (
              <div className="space-y-1 pl-1">
                {note.checklist.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex items-center space-x-2 text-[11px] text-slate-500">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.done ? "bg-emerald-500" : "bg-slate-300"}`}></span>
                    <span className={`truncate leading-none ${item.done ? "line-through text-slate-400" : "font-medium"}`}>
                      {item.text || "Empty list item"}
                    </span>
                  </div>
                ))}
                {note.checklist.length > 2 && (
                  <span className="text-[10px] text-slate-400 pl-3.5 block font-medium">
                    + {note.checklist.length - 2} more items
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="font-sans text-xs text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap break-words font-medium">
            {getSnippet()}
          </p>
        )}
      </div>

      {/* Footer Details & quick actions row */}
      <div className="pt-3 border-t border-slate-200/60 flex flex-col gap-2">
        {/* Custom Tags pills */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 leading-none">
            {note.tags.map((tag) => (
              <button
                key={tag}
                onClick={(e) => onTagClick(tag, e)}
                className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-bold py-0.5 px-2 rounded-md transition-colors pointer-events-auto cursor-pointer"
              >
                <Tag className="w-2.5 h-2.5 opacity-70" />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-1">
          {/* Date stamp */}
          <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-mono font-semibold">
            <Calendar className="w-3 h-3 text-slate-300" />
            <span>{formatDate(note.date)}</span>
          </div>

          {/* Actions panel */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Clone note */}
            <button
              onClick={(e) => onDuplicate(note, e)}
              className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100 pointer-events-auto cursor-pointer"
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
              className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100 pointer-events-auto cursor-pointer"
              title="Export as Text file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            
            {/* Delete note */}
            <button
              onClick={(e) => onDelete(note.id, e)}
              className="p-1 text-slate-400 hover:text-[#DC2626] rounded-md hover:bg-red-50 pointer-events-auto cursor-pointer"
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
