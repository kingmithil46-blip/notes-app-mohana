import React, { useState, useEffect, MouseEvent } from "react";
import { 
  Search, Plus, Sparkles, Menu, X, BookOpen, 
  HelpCircle, Archive, AlertCircle, RefreshCw, FolderSearch
} from "lucide-react";
import { Note } from "./types";
import Sidebar from "./components/Sidebar";
import NoteCard from "./components/NoteCard";
import NoteEditor from "./components/NoteEditor";

const LOCAL_STORAGE_KEY = "notes_maker_data_save";

const ONBOARDING_NOTES: Note[] = [
  {
    id: "welcome-note-1",
    title: "Welcome to Notes Maker! 📝",
    content: `This is a highly polished, offline-first notes organizer designed to work beautifully on both desktop and mobile layouts.

Here is what you can do in your brand new notebook:

📁 ORGANIZE BY WORKSPACE FOLDERS
Sort your thoughts instantly into Business, Personal, Sparks & Ideas, or Daily Journals via the sidebar filters.

🏷️ CATEGORIZE WITH INDEXED TAGS
Create custom hashtags directly in the editor below! For instance, tagging a note #todo or #meeting dynamically aggregates them into interactive indexes.

🎨 COLOR ACCENT THEMES
Choose from 7 distinct matte color overlays (like Sage Mint, sunset Rose, or Sand Gold) to personalize your papers.

☁️ EXPORT & BACKUPS OPTIONS
Use the storage panel at the bottom of the sidebar to export your entire archive as a backup JSON file or import a saved dataset offline!`,
    date: new Date().toISOString(),
    folder: "personal",
    tags: ["guide", "onboarding", "intro"],
    color: "peach",
    pinned: true,
    checklist: [],
    isChecklistMode: false,
    updatedAt: Date.now(),
  },
  {
    id: "welcome-note-2",
    title: "🔒 Fully Offline Workspace",
    content: `This space is customized to be a 100% offline document hub. No external AI APIs, trackers, or foreign integrations process your notes.

Here is what makes ProNote's offline architecture safe and fast:

🛡️ ZERO-NETWORK PROCESSING
Every element you type, sort, filter, or index remains fully secure inside your browser's local sandbox storage engine (localStorage).

📂 EXPORT SECURE BACKUPS
To back up your directories, click 'Backup JSON' in the sidebar to download a secure, offline backup file.

🔌 NO CONNECTION REQUIRED
This web application works smoothly during flights, remote travel, or offline work states. No active internet is required to run your workspace!`,
    date: new Date().toISOString(),
    folder: "ideas",
    tags: ["offline", "security"],
    color: "sky",
    pinned: true,
    checklist: [],
    isChecklistMode: false,
    updatedAt: Date.now() - 1000,
  },
  {
    id: "welcome-note-3",
    title: "Weekend Checklist 🍏",
    content: "A quick collection of tasks for the upcoming Saturday morning.",
    date: new Date().toISOString(),
    folder: "journal",
    tags: ["todo", "weekend"],
    color: "mint",
    pinned: false,
    checklist: [
      { id: "item-1", text: "Buy organic avocados and fresh parsley from farmers market", done: true },
      { id: "item-2", text: "Proofread and finalize client portfolio project draft review", done: false },
      { id: "item-3", text: "Read two chapters of 'Sapiens'", done: false },
      { id: "item-4", text: "Stretch and complete 35-minute mindfulness breathing sequence", done: true }
    ],
    isChecklistMode: true,
    updatedAt: Date.now() - 2000,
  }
];

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  
  // Filtering and Searching states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolder, setCurrentFolder] = useState("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Mobile slide toggles
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load notes initially
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed);
          // Auto select first note
          setActiveNoteId(parsed[0].id);
        } else {
          setNotes(ONBOARDING_NOTES);
          setActiveNoteId(ONBOARDING_NOTES[0].id);
        }
      } catch {
        setNotes(ONBOARDING_NOTES);
        setActiveNoteId(ONBOARDING_NOTES[0].id);
      }
    } else {
      setNotes(ONBOARDING_NOTES);
      setActiveNoteId(ONBOARDING_NOTES[0].id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ONBOARDING_NOTES));
    }
  }, []);

  // Save notes status triggers
  const saveToLocalStorage = (nextNotes: Note[]) => {
    setNotes(nextNotes);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextNotes));
  };

  // Create document CTA
  const handleAddNote = () => {
    const newNote: Note = {
      id: "note-" + Math.random().toString(36).substr(2, 9),
      title: "",
      content: "",
      date: new Date().toISOString(),
      folder: currentFolder !== "all" ? currentFolder : "personal",
      tags: selectedTag ? [selectedTag] : [],
      color: "neutral",
      pinned: false,
      checklist: [],
      isChecklistMode: false,
      updatedAt: Date.now(),
    };

    const nextNotes = [newNote, ...notes];
    saveToLocalStorage(nextNotes);
    setActiveNoteId(newNote.id);
    setIsSidebarOpen(false); // Close sidebar on mobile drawer
  };

  // Update note callback
  const handleUpdateNote = (updated: Note) => {
    const nextNotes = notes.map((n) => (n.id === updated.id ? updated : n));
    saveToLocalStorage(nextNotes);
  };

  // Delete note trigger
  const handleDeleteNote = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you absolutely sure you want to delete this document? This action is irreversible.")) {
      const nextNotes = notes.filter((n) => n.id !== id);
      saveToLocalStorage(nextNotes);
      if (activeNoteId === id) {
        setActiveNoteId(nextNotes.length > 0 ? nextNotes[0].id : null);
      }
    }
  };

  // Clone document duplicate trigger
  const handleDuplicateNote = (note: Note, e: MouseEvent) => {
    e.stopPropagation();
    const clonedNote: Note = {
      ...note,
      id: "note-" + Math.random().toString(36).substr(2, 9),
      title: note.title ? `${note.title} (Copy)` : "Untitled Copy",
      date: new Date().toISOString(),
      pinned: false,
      updatedAt: Date.now(),
    };
    const nextNotes = [clonedNote, ...notes];
    saveToLocalStorage(nextNotes);
    setActiveNoteId(clonedNote.id);
  };

  // Toggle Pinned
  const handleTogglePin = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const nextNotes = notes.map((n) => {
      if (n.id === id) {
        return { ...n, pinned: !n.pinned, updatedAt: Date.now() };
      }
      return n;
    });
    saveToLocalStorage(nextNotes);
  };

  // Handle Tag click filter
  const handleTagClick = (tag: string, e: MouseEvent) => {
    e.stopPropagation();
    setSelectedTag(tag);
    setCurrentFolder("all"); // Swap folders to show tag comprehensively
  };

  // Import JSON backup callback
  const handleImportBackup = (importedNotes: Note[]) => {
    // Append or replace
    const combinedNotes = [...importedNotes, ...notes.filter((curr) => !importedNotes.some((imp) => imp.id === curr.id))];
    saveToLocalStorage(combinedNotes);
    setActiveNoteId(combinedNotes[0].id);
  };

  // Filter notes based on sidebar options + query searches
  const filteredNotes = notes.filter((note) => {
    // Folder filter
    if (currentFolder !== "all" && note.folder !== currentFolder) {
      return false;
    }

    // Tag filter
    if (selectedTag && !note.tags.includes(selectedTag)) {
      return false;
    }

    // Search query
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const matchTitle = note.title.toLowerCase().includes(query);
      const matchContent = note.content.toLowerCase().includes(query);
      const matchTags = note.tags.some((t) => t.toLowerCase().includes(query));
      return matchTitle || matchContent || matchTags;
    }

    return true;
  });

  // Sort notes: pinned go on top first, then sorted by newest updatedAt date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  const activeNote = notes.find((n) => n.id === activeNoteId);

  return (
    <div className="flex h-screen bg-[#030712] overflow-hidden font-sans text-slate-100" id="main-application-frame">
      
      {/* 1. Mobile Slide out/Overlay Drawer Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* 2. Side navigation Workspace menu */}
      <div
        className={`fixed md:sticky md:top-0 inset-y-0 left-0 transform md:transform-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-80 h-full z-50 bg-[#050811] transition-transform duration-300 ease-in-out shrink-0`}
      >
        <Sidebar
          currentFolder={currentFolder}
          setCurrentFolder={setCurrentFolder}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          notes={notes}
          onAddNote={handleAddNote}
          onImportBackup={handleImportBackup}
        />
      </div>

      {/* 3. Notes Ledger list & writing canvas display area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#030712]">
        
        {/* Workspace Toolbar Header */}
        <header className="h-[65px] bg-[#02050b] border-b border-slate-900 px-4 md:px-6 flex items-center justify-between shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
          <div className="flex items-center space-x-3">
            {/* Burger Menu on Mobile layout */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-slate-900 border border-slate-800 rounded-xl text-slate-200 cursor-pointer transition-colors"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5 text-purple-400" />
            </button>
            <div className="flex items-center space-x-2.5">
              <span className="font-display font-bold text-[17px] text-white tracking-tight text-shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                {selectedTag ? `#${selectedTag}` : currentFolder === "all" ? "All Documents" : currentFolder.toUpperCase()}
              </span>
              <span className="text-[10px] font-mono text-[#00f5ff] font-bold bg-[#00f5ff]/10 py-1 px-3 rounded-full border border-cyan-500/20 shadow-[0_0_8px_rgba(0,245,255,0.15)]">
                {filteredNotes.length} index sheets
              </span>
            </div>
          </div>

          {/* Quick Create Button header */}
          <button
            onClick={handleAddNote}
            className="md:hidden h-9 w-9 bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-[0_0_12px_rgba(219,39,119,0.4)] border border-pink-500/20 text-white rounded-lg flex items-center justify-center cursor-pointer transition-all transform active:scale-95"
            title="Create general markdown draft"
          >
            <Plus className="w-4 h-4" />
          </button>
        </header>

        {/* Outer Split Pane Scaffold */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Notes Card Deck listing (Left pane) */}
          <div className="flex-1 flex flex-col h-full bg-[#030712] overflow-y-auto p-4 md:p-6 space-y-5 bg-dot-matrix" id="notes-grid-ledger">
            {/* Search Input bar */}
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center pr-2 pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Lookup headers, paragraphs, or tag filters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-[#0c101b] border border-slate-900 hover:border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all text-xs font-sans font-semibold hover:shadow-[0_0_10px_rgba(255,255,255,0.02)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-2.5 w-5 h-5 flex items-center justify-center rounded-lg bg-slate-950 border border-slate-800 font-sans text-[9px] text-slate-400 hover:text-white cursor-pointer hover:bg-slate-900 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Empty ledger state */}
            {sortedNotes.length === 0 ? (
              <div id="notes-empty-state-card" className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#0c101b]/90 flex items-center justify-center border border-slate-900/65 text-slate-400 shadow-[0_0_15px_rgba(0,0,0,0.6)]">
                  <FolderSearch className="w-8 h-8 text-purple-400 animate-pulse" />
                </div>
                <div className="space-y-1.5 flex flex-col items-center">
                  <h3 className="font-display font-bold tracking-tight text-white text-sm md:text-base">No documents drafted</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-sans font-medium px-4">
                    {searchQuery ? "We couldn't find matching words inside titles or tag structures. Try clearing search descriptors." : "This workspace folder is currently clean. Start drafting your first document sheet right now."}
                  </p>
                </div>
                {!searchQuery && (
                  <button
                    onClick={handleAddNote}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:shadow-[0_0_15px_rgba(168,85,247,0.35)] text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-purple-500/20 transition-all cursor-pointer transform active:scale-97"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Onboarding Note</span>
                  </button>
                )}
              </div>
            ) : (
              /* Grid layouts */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-max">
                {sortedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isSelected={activeNoteId === note.id}
                    onSelect={() => {
                      setActiveNoteId(note.id);
                      // On mobile layouts, sliding sidebar shuts
                      setIsSidebarOpen(false);
                    }}
                    onTogglePin={handleTogglePin}
                    onDelete={handleDeleteNote}
                    onDuplicate={handleDuplicateNote}
                    onTagClick={handleTagClick}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Active Note Editor workspace (Right pane / responsive drawer) */}
          {activeNote ? (
            <div
              className={`fixed md:relative inset-0 md:inset-auto md:w-[620px] lg:w-[710px] xl:w-[810px] h-full z-45 bg-[#030712] border-l border-slate-905 border-slate-900/80 transition-all md:translate-x-0 ${
                activeNoteId ? "translate-x-0" : "translate-x-full"
              }`}
              id="active-editor-pane"
            >
              <div className="p-4 md:p-5 h-full">
                <NoteEditor
                  note={activeNote}
                  onUpdateNote={handleUpdateNote}
                  onClose={() => setActiveNoteId(null)}
                />
              </div>
            </div>
          ) : (
            /* Selected state empty wrapper indicator on desktop */
            <div className="hidden md:flex flex-1 md:w-[620px] lg:w-[710px] xl:w-[810px] flex-col items-center justify-center p-8 bg-[#030712] border-l border-slate-900 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#0c101b] border border-slate-900 flex flex-col items-center justify-center text-slate-400 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <BookOpen className="w-6.5 h-6.5 text-purple-400 animate-pulse text-neon-purple" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="font-display font-semibold text-slate-200 text-sm">Workspace Sheet Unselected</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-sans font-medium">
                  Select an items card from your ledger directory or create a new document to start editorial drafting.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
