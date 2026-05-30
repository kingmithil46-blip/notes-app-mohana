import React, { useState, FormEvent } from "react";
import { 
  Pin, CheckSquare, ListTodo, Tag, Folder, 
  Plus, X, Copy, Check, RotateCcw, HelpCircle, 
  Download, FileText, AlignLeft, HelpCircle as HelpIcon
} from "lucide-react";
import { Note, ChecklistItem } from "../types";
import { NOTESTORE_COLORS, DEFAULT_FOLDERS } from "../utils";

interface NoteEditorProps {
  note: Note;
  onUpdateNote: (updatedNote: Note) => void;
  onClose: () => void;
}

export default function NoteEditor({ note, onUpdateNote, onClose }: NoteEditorProps) {
  const [tagInput, setTagInput] = useState("");

  // Handle single values update
  const updateField = (field: keyof Note, value: any) => {
    onUpdateNote({
      ...note,
      [field]: value,
      updatedAt: Date.now(),
    });
  };

  // Checklist Action Helpers
  const addChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: "item-" + Math.random().toString(36).substr(2, 9),
      text: "",
      done: false,
    };
    updateField("checklist", [...note.checklist, newItem]);
  };

  const updateChecklistItem = (id: string, text: string) => {
    const nextChecklist = note.checklist.map((item) => {
      if (item.id === id) return { ...item, text };
      return item;
    });
    updateField("checklist", nextChecklist);
  };

  const toggleChecklistItem = (id: string) => {
    const nextChecklist = note.checklist.map((item) => {
      if (item.id === id) return { ...item, done: !item.done };
      return item;
    });
    updateField("checklist", nextChecklist);
  };

  const removeChecklistItem = (id: string) => {
    const nextChecklist = note.checklist.filter((item) => item.id !== id);
    updateField("checklist", nextChecklist);
  };

  // Tag Builders
  const handleAddTag = (e: FormEvent) => {
    e.preventDefault();
    const cleanTag = tagInput.trim().toLowerCase().replace(/#/g, "");
    if (cleanTag && !note.tags.includes(cleanTag)) {
      updateField("tags", [...note.tags, cleanTag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const filteredTags = note.tags.filter((t) => t !== tagToRemove);
    updateField("tags", filteredTags);
  };

  // Dynamic Word & Character Counts
  const wordCount = note.content ? note.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = note.content ? note.content.length : 0;

  const currentColor = NOTESTORE_COLORS.find((c) => c.slug === note.color) || NOTESTORE_COLORS[0];

  return (
    <div className={`flex flex-col h-full rounded-2xl border transition-all duration-300 overflow-hidden ${currentColor.bgClass} ${currentColor.borderClass}`} id="note-editor-wrapper">
      
      {/* Editorial Header bar */}
      <div className="px-6 py-4 border-b border-[#D4AF37] bg-[#F4EAD4] flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          {/* Back/Close drawer trigger on small layouts */}
          <button
            onClick={onClose}
            className="md:hidden p-2 text-slate-705 hover:text-[#5C0612] hover:bg-[#FAF2DC] rounded-lg pointer-events-auto cursor-pointer font-bold text-xs"
          >
            ← Back
          </button>
          
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider">
            <Folder className="w-3.5 h-3.5 text-amber-900/60" />
            <span>Folder:</span>
            <select
              value={note.folder}
              onChange={(e) => updateField("folder", e.target.value)}
              className="bg-slate-550/2 bg-white hover:bg-slate-50 text-slate-800 border border-[#D4AF37]/35 rounded-lg px-2.5 py-1 text-xs font-bold uppercase font-mono tracking-tight cursor-pointer focus:ring-1 focus:ring-[#5C0612] focus:outline-none"
            >
              {DEFAULT_FOLDERS.filter(f => f.id !== "all").map((fold) => (
                <option key={fold.id} value={fold.id}>{fold.name}</option>
               ))}
            </select>
          </div>
        </div>

        {/* Quick Style Palette and Pin status */}
        <div className="flex items-center space-x-3">
          {/* Note color selectors */}
          <div className="flex items-center space-x-1 border-r border-[#D4AF37]/20 pr-3">
            {NOTESTORE_COLORS.map((col) => (
              <button
                key={col.slug}
                onClick={() => updateField("color", col.slug)}
                className={`w-5 h-5 rounded-full border transition-all ${col.slug === "neutral" ? "bg-[#5C0612] border-[#D4AF37]" : col.bgClass} ${
                  note.color === col.slug ? "scale-120 ring-2 ring-[#D4AF37]" : "hover:scale-110"
                }`}
                title={`Theme: ${col.name}`}
              />
            ))}
          </div>

          {/* Toggle PIN */}
          <button
            onClick={() => updateField("pinned", !note.pinned)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              note.pinned
                ? "bg-[#5C0612] border-[#5C0612] text-white"
                : "bg-white border-slate-200 text-slate-400 hover:text-[#5C0612] hover:border-[#D4AF37]"
            }`}
            title={note.pinned ? "Pinned to dashboard" : "Pin Note to top"}
          >
            <Pin className={`w-4 h-4 ${note.pinned ? "fill-white" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Work Surface Container */}
      <div className="flex-1 overflow-y-auto flex flex-col md:flex-row p-6 gap-6" id="editor-body">
        
        {/* Note inputs drafting block (Left side) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FFFDF9] rounded-xl shadow-[0_4px_24px_rgba(92,6,18,0.01)] border border-[#E5C158]/55 p-6 space-y-5">
          {/* Title Text Input */}
          <input
            type="text"
            value={note.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Type your summary header..."
            className="w-full text-[#3F000B] font-display font-bold text-xl md:text-2xl tracking-tight border-b border-transparent focus:border-[#D4AF37] outline-none pb-2 placeholder-amber-800/40 leading-tight bg-transparent"
          />

          {/* Tag pills builder row */}
          <div className="flex flex-wrap gap-2 items-center">
            {note.tags.map((tg) => (
              <span
                key={tg}
                className="inline-flex items-center space-x-1.5 bg-[#F4EAD4] border border-[#D4AF37] text-amber-950 font-sans font-bold text-xs py-1 px-2.5 rounded-lg"
              >
                <Tag className="w-3 h-3 text-amber-700" />
                <span>{tg}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tg)}
                  className="rounded-full hover:bg-[#E5C158]/30 font-bold leading-none p-0.5 ml-1 text-[10px] text-amber-700 hover:text-amber-950 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}
            
            <form onSubmit={handleAddTag} className="inline-block">
              <input
                type="text"
                placeholder="+ Index tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="border border-[#D4AF37] bg-white text-slate-800 text-xs py-1 px-3 rounded-lg font-sans placeholder-slate-400 focus:border-[#5C0612] outline-none w-24 focus:w-32 transition-all font-semibold"
              />
            </form>
          </div>

          {/* Toggle Checklist / Text Editor controls */}
          <div className="flex items-center space-x-2 border-b border-slate-150 pb-3">
            <button
              onClick={() => updateField("isChecklistMode", false)}
              className={`flex items-center space-x-2 py-1.5 px-3.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                !note.isChecklistMode 
                  ? "bg-slate-900 text-white" 
                  : "bg-white/60 text-slate-500 hover:bg-white"
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Deep Writing</span>
            </button>
            <button
              onClick={() => updateField("isChecklistMode", true)}
              className={`flex items-center space-x-2 py-1.5 px-3.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                note.isChecklistMode 
                  ? "bg-slate-900 text-white" 
                  : "bg-white/60 text-slate-500 hover:bg-white"
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Action Checklist</span>
            </button>
          </div>

          {/* Primary Editor Surface */}
          <div className="flex-1 flex flex-col min-h-[250px]">
            {note.isChecklistMode ? (
              /* Checklist creation mode widgets */
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <span className="block text-[10px] font-mono tracking-wider font-bold text-slate-400 uppercase">Interactive Checkpoints</span>
                  {note.checklist.length === 0 ? (
                    <div className="bg-slate-50/40 border border-dashed border-slate-200 rounded-xl p-6 text-center space-y-2">
                      <p className="text-xs text-slate-500 font-sans font-medium">No tasks appended to this checklist document.</p>
                      <button
                        onClick={addChecklistItem}
                        className="inline-flex items-center space-x-2 py-1.5 px-3.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg border border-slate-200 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add initial checkpoint</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                      {note.checklist.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-[#D4AF37]/50 group">
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() => toggleChecklistItem(item.id)}
                            className="w-4 h-4 rounded text-[#5C0612] focus:ring-[#5C0612] accent-[#5C0612] cursor-pointer"
                          />
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => updateChecklistItem(item.id, e.target.value)}
                            placeholder="Describe action item..."
                            className={`flex-1 text-xs text-slate-800 bg-transparent border-0 outline-none focus:ring-0 placeholder-slate-300 font-semibold ${
                              item.done ? "line-through text-slate-400 font-normal" : ""
                            }`}
                          />
                          <button
                            onClick={() => removeChecklistItem(item.id)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove checkpoint"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      
                      <button
                        onClick={addChecklistItem}
                        className="w-full flex items-center justify-center space-x-2 py-2.5 border border-dashed border-slate-200 hover:border-slate-400 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task Item</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Subtext container for Checklist notes */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex-1 flex flex-col">
                  <span className="block text-[10px] font-mono tracking-wider font-bold text-slate-400 uppercase mb-2">Descriptive Scribble (Optional)</span>
                  <textarea
                    value={note.content}
                    onChange={(e) => updateField("content", e.target.value)}
                    placeholder="Type details, context, notes related to these actions..."
                    className="w-full flex-1 min-h-[90px] border-0 text-slate-700 text-xs font-sans leading-relaxed resize-none focus:ring-0 outline-none placeholder-slate-300 font-medium"
                  />
                </div>
              </div>
            ) : (
              /* Classical deep writing paper container */
              <textarea
                value={note.content}
                onChange={(e) => updateField("content", e.target.value)}
                placeholder="Unleash thoughts here, write documentation, notes, journal entries..."
                className="w-full flex-1 border-0 text-slate-800 text-xs md:text-sm font-sans leading-relaxed resize-none focus:ring-0 outline-none placeholder-slate-300 font-medium"
              />
            )}
          </div>

          {/* Footer metrics reporting details */}
          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400 font-mono font-bold">
            <span>SAVED LOCALLY IN CODESPACE</span>
            <span>{wordCount} Words • {charCount} Chars</span>
          </div>
        </div>

        {/* Workspace Operations Manual (Right side) */}
        <div className="w-full md:w-80 flex flex-col space-y-4 shrink-0">
          
          {/* Quick help manual details */}
          <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#D4AF37]/45 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-[#5C0612] font-bold text-[12px]">
              <HelpIcon className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-mono uppercase tracking-wider">Workspace Tips</span>
            </div>
            
            <p className="text-xs text-amber-900/80 leading-relaxed font-sans font-medium">
              ProNote works entirely as an offline workspace. All document drafts, indexes, and checklist states stay safely secured in your browser's offline storage vaults.
            </p>

            <ul className="text-[11px] text-amber-950/70 space-y-2 pl-4 list-disc font-sans leading-relaxed font-semibold">
              <li>Add customized index tags by typing in the <b>Index tag</b> input and hitting Enter.</li>
              <li>Toggle between <b>Deep Writing</b> and <b>Action Checklist</b> format anytime.</li>
              <li>Select note color bubbles at the top to personalize your editorial canvas instantly.</li>
              <li>Use the <b>Export / Import</b> tools in the left sidebar to back up, restore, or transfer notes data safely.</li>
              <li>All document metrics are tracked and calculated locally.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
