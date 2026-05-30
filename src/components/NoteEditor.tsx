import React, { useState, FormEvent } from "react";
import { 
  Pin, CheckSquare, ListTodo, Tag, Folder, 
  Plus, X, Copy, Check, HelpCircle, 
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
    <div className={`flex flex-col h-full rounded-2xl border transition-all duration-300 overflow-hidden ${currentColor.bgClass}`} id="note-editor-wrapper">
      
      {/* Editorial Header bar */}
      <div className="px-6 py-4 border-b border-slate-900 bg-[#02050b] flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          {/* Back/Close drawer trigger on small layouts */}
          <button
            onClick={onClose}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg pointer-events-auto cursor-pointer font-bold text-xs"
          >
            ← Back
          </button>
          
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">
            <Folder className="w-3.5 h-3.5 text-purple-400" />
            <span>Folder:</span>
            <select
              value={note.folder}
              onChange={(e) => updateField("folder", e.target.value)}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold uppercase font-mono tracking-tight cursor-pointer focus:ring-1 focus:ring-purple-500 focus:outline-none"
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
          <div className="flex items-center space-x-1.5 border-r border-slate-900 pr-3">
            {NOTESTORE_COLORS.map((col) => (
              <button
                key={col.slug}
                onClick={() => updateField("color", col.slug)}
                className={`w-5 h-5 rounded-full border border-slate-800 transition-all ${
                  col.slug === "neutral" ? "bg-purple-600 shadow-[0_0_8px_#bf5af2]" :
                  col.slug === "peach" ? "bg-pink-600 shadow-[0_0_8px_#ff007f]" :
                  col.slug === "yellow" ? "bg-amber-500 shadow-[0_0_8px_#ffd700]" :
                  col.slug === "mint" ? "bg-lime-500 shadow-[0_0_8px_#39ff14]" :
                  col.slug === "sky" ? "bg-cyan-500 shadow-[0_0_8px_#00f5ff]" :
                  col.slug === "lavender" ? "bg-blue-600 shadow-[0_0_8px_#0055ff]" :
                  "bg-orange-600 shadow-[0_0_8px_#ff5e00]"
                } ${
                  note.color === col.slug ? "scale-125 ring-2 ring-white" : "hover:scale-110 opacity-70 hover:opacity-100"
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
                ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                : "bg-slate-950 border-slate-900 text-slate-500 hover:text-yellow-400 hover:border-yellow-550"
            }`}
            title={note.pinned ? "Pinned to dashboard" : "Pin Note to top"}
          >
            <Pin className={`w-4 h-4 ${note.pinned ? "fill-yellow-400 text-yellow-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Work Surface Container */}
      <div className="flex-1 overflow-y-auto flex flex-col xl:flex-row p-6 gap-6 bg-dot-matrix" id="editor-body">
        
        {/* Note inputs drafting block (Left side) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#070b14]/95 rounded-xl border border-slate-900 p-6 space-y-5 hover:border-slate-800 transition-colors shadow-2xl shadow-black/80">
          {/* Title Text Input */}
          <input
            type="text"
            value={note.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Type document title here..."
            className="w-full text-white font-display font-medium text-xl md:text-2xl tracking-tight border-b border-slate-900 focus:border-purple-500/60 outline-none pb-2 placeholder-slate-700 leading-tight bg-transparent transition-all"
          />

          {/* Tag pills builder row */}
          <div className="flex flex-wrap gap-2 items-center text-xs">
            {note.tags.map((tg) => (
              <span
                key={tg}
                className="inline-flex items-center space-x-1.5 bg-slate-950/85 border border-slate-900 text-slate-300 font-sans font-bold text-xs py-1 px-2.5 rounded-lg hover:border-purple-500/40 transition-colors"
              >
                <Tag className="w-3 h-3 text-cyan-400" />
                <span>{tg}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tg)}
                  className="rounded-full hover:bg-slate-900 hover:text-red-400 font-bold leading-none p-0.5 ml-1 text-[10px] text-slate-500 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}
            
            <form onSubmit={handleAddTag} className="inline-block">
              <input
                type="text"
                placeholder="+ Add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="border border-slate-900 bg-slate-950 text-slate-200 text-xs py-1 px-3 rounded-lg font-sans placeholder-slate-800 focus:border-purple-500 outline-none w-24 focus:w-32 transition-all font-semibold"
              />
            </form>
          </div>

          {/* Toggle Checklist / Text Editor controls */}
          <div className="flex items-center space-x-2 border-b border-slate-900 pb-3">
            <button
              onClick={() => updateField("isChecklistMode", false)}
              className={`flex items-center space-x-2 py-1.5 px-3.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                !note.isChecklistMode 
                  ? "bg-purple-900/30 text-purple-200 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.25)]" 
                  : "bg-slate-950 text-slate-500 hover:bg-slate-900/50 border border-slate-900"
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Deep Writing</span>
            </button>
            <button
              onClick={() => updateField("isChecklistMode", true)}
              className={`flex items-center space-x-2 py-1.5 px-3.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                note.isChecklistMode 
                  ? "bg-pink-900/30 text-pink-200 border border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.25)]" 
                  : "bg-slate-950 text-slate-500 hover:bg-slate-900/50 border border-slate-900"
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
                  <span className="block text-[10px] font-mono tracking-widest font-bold text-slate-500 uppercase">Interactive Checkpoints</span>
                  {note.checklist.length === 0 ? (
                    <div className="bg-slate-950/40 border border-dashed border-slate-905 border-slate-900/85 rounded-xl p-6 text-center space-y-2">
                      <p className="text-xs text-slate-500 font-sans font-semibold">No tasks appended to this checklist document.</p>
                      <button
                        onClick={addChecklistItem}
                        className="inline-flex items-center space-x-2 py-1.5 px-3.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg border border-slate-800 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add initial checkpoint</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                      {note.checklist.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 bg-slate-950 p-2 rounded-xl border border-slate-900 hover:border-purple-500/40 transition-colors group">
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() => toggleChecklistItem(item.id)}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500/40 accent-purple-500 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => updateChecklistItem(item.id, e.target.value)}
                            placeholder="Describe action item..."
                            className={`flex-1 text-xs text-slate-200 bg-transparent border-0 outline-none focus:ring-0 placeholder-slate-700 font-semibold ${
                              item.done ? "line-through text-slate-500 font-normal" : ""
                            }`}
                          />
                          <button
                            onClick={() => removeChecklistItem(item.id)}
                            className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-slate-900 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove checkpoint"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      
                      <button
                        onClick={addChecklistItem}
                        className="w-full flex items-center justify-center space-x-2 py-2.5 border border-dashed border-slate-900 hover:border-slate-700 hover:bg-slate-950/40 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task Item</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Subtext container for Checklist notes */}
                <div className="mt-4 pt-4 border-t border-slate-900 flex-1 flex flex-col">
                  <span className="block text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase mb-2">Descriptive Scribble (Optional)</span>
                  <textarea
                    value={note.content}
                    onChange={(e) => updateField("content", e.target.value)}
                    placeholder="Type details, context, notes related to these actions..."
                    className="w-full flex-1 min-h-[90px] border-0 text-slate-300 text-xs font-sans leading-relaxed resize-none focus:ring-0 outline-none placeholder-slate-750 placeholder-slate-700 font-medium bg-transparent"
                  />
                </div>
              </div>
            ) : (
              /* Classical deep writing paper container */
              <textarea
                value={note.content}
                onChange={(e) => updateField("content", e.target.value)}
                placeholder="Unleash thoughts here, write documentation, notes, journal entries..."
                className="w-full flex-1 border-0 text-slate-200 text-xs md:text-sm font-sans leading-relaxed resize-none focus:ring-0 outline-none placeholder-slate-750 placeholder-slate-700 font-medium bg-transparent"
              />
            )}
          </div>

          {/* Footer metrics reporting details */}
          <div className="pt-3 border-t border-slate-900 flex justify-between items-center text-[11px] text-slate-500 font-mono font-bold">
            <span>SAVED LOCALLY IN CODESPACE</span>
            <span>{wordCount} Words • {charCount} Chars</span>
          </div>
        </div>

        {/* Workspace Operations Manual (Right side) */}
        <div className="w-full xl:w-80 flex flex-col space-y-4 shrink-0">
          
          {/* Help tips Details */}
          <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-900 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-slate-400 font-bold text-[12px]">
              <HelpIcon className="w-4 h-4 text-pink-500" />
              <span className="font-mono uppercase tracking-wider text-slate-400">Offline Hub Vault</span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium">
              Your drafts stay locked inside local browser keys. No foreign entities read your entries.
            </p>

            <ul className="text-[11px] text-slate-500 space-y-2 pl-4 list-disc font-sans leading-relaxed font-medium">
              <li>Add customized hashtags by typing in the <b>Add tag</b> input box.</li>
              <li>Toggle between <b>Deep Writing</b> and <b>Action Checklist</b> format anytime.</li>
              <li>Select note glow themes to customize your editing canvas style.</li>
              <li>Backups can be fully restored downstream across browser devices.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
