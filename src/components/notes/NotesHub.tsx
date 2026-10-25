import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  X, 
  BookOpen, 
  Star, 
  Lock,
  ExternalLink
} from 'lucide-react';

interface NoteItem {
  id: string;
  title: string;
  description: string;
  category: string;
  pages: number;
  price: 'FREE' | 'PRO';
  priceAmount?: number;
  language: string;
  rating: number;
  downloads: string;
  pdfUrl: string;
}

interface NotesHubProps {
  navigate: (path: string) => void;
}

export const NotesHub: React.FC<NotesHubProps> = ({ navigate }) => {
  const { success } = useToast();
  const [mode, setMode] = useState<'FREE' | 'PAID'>('FREE');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewNote, setPreviewNote] = useState<NoteItem | null>(null);

  const categories = ['All', 'Data Structures', 'Web Dev', 'Engineering Fundamentals', 'Python', 'Exam Past Questions'];

  const notesList: NoteItem[] = [
    {
      id: 'n1',
      title: 'Python & Data Structures Handwritten Notes',
      description: 'Comprehensive syntax guide, arrays, memory management, pointers, and sample interview questions.',
      category: 'Python',
      pages: 41,
      price: 'FREE',
      language: 'ENGLISH',
      rating: 4.9,
      downloads: '14.2k',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'n2',
      title: 'Advanced Algorithms & Graph Traversals',
      description: 'DFS, BFS, Dijkstra, A* search heuristics, dynamic programming recurrence relations, and complexity proofs.',
      category: 'Data Structures',
      pages: 56,
      price: 'FREE',
      language: 'ENGLISH',
      rating: 4.8,
      downloads: '9.8k',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'n3',
      title: 'Full-Stack Web Development Architecture',
      description: 'React state patterns, REST & GraphQL APIs, database indexing, caching strategies, and Docker deployment.',
      category: 'Web Dev',
      pages: 38,
      price: 'FREE',
      language: 'ENGLISH',
      rating: 4.9,
      downloads: '18.5k',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'n4',
      title: 'Calculus III & Linear Algebra Masterclass',
      description: 'Multivariable calculus, partial derivatives, eigenvalues, eigenvectors, and geometric transformations.',
      category: 'Engineering Fundamentals',
      pages: 64,
      price: 'PRO',
      priceAmount: 12,
      language: 'ENGLISH',
      rating: 5.0,
      downloads: '6.1k',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'n5',
      title: 'Computer Science Midterm & Final Past Questions',
      description: 'Curated compilation of university past exam papers with verified step-by-step model solutions.',
      category: 'Exam Past Questions',
      pages: 85,
      price: 'FREE',
      language: 'ENGLISH',
      rating: 4.9,
      downloads: '22.4k',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'n6',
      title: 'System Engineering & Distributed Systems Pro',
      description: 'Microservices, consensus algorithms (Raft/Paxos), load balancing, and fault-tolerant architecture.',
      category: 'Engineering Fundamentals',
      pages: 72,
      price: 'PRO',
      priceAmount: 15,
      language: 'ENGLISH',
      rating: 4.9,
      downloads: '4.3k',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ];

  const filteredNotes = notesList.filter(note => {
    const matchesMode = mode === 'FREE' ? note.price === 'FREE' : note.price === 'PRO';
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMode && matchesCategory && matchesSearch;
  });

  const handleDownload = (note: NoteItem) => {
    success(`📥 Downloading "${note.title}"...`);
    window.open(note.pdfUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-slate-950">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Segmented Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.08] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>[ 📓 NOTES HUB ]</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Browse Free & Course Notes
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Direct downloads and previews for university course study materials, handwritten summaries, and past exam questions.
            </p>
          </div>

          {/* Segmented Mode Filter */}
          <div className="flex items-center bg-[#0F1626] p-1.5 rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setMode('FREE')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'FREE'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              FREE Notes
            </button>
            <button
              onClick={() => setMode('PAID')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'PAID'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PAID / Pro Notes
            </button>
          </div>
        </div>

        {/* Search Bar & Category Filter Chips */}
        <div className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notes by course title, algorithms, or topics..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-[#0F1626]/80 text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-[#111A2E] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Grid & Card Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className="bg-[#0F1626]/90 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between group shadow-xl"
            >
              {/* Card Media / Thumbnail Preview Header */}
              <div className="relative h-44 bg-gradient-to-br from-[#162035] to-[#0B0F17] p-5 flex flex-col justify-between border-b border-white/10 overflow-hidden">
                {/* Background code or math watermark */}
                <div className="absolute inset-0 opacity-10 font-mono text-[10px] text-emerald-400 p-4 pointer-events-none select-none">
                  {"// SUMMARY\nconst study = (topics) => topics.master();\nfunc optimizeMemory() {\n  pointer.alloc();\n}"}
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg ${
                    note.price === 'FREE' 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                  }`}>
                    {note.price === 'FREE' ? 'FREE NOTE' : `PRO $${note.priceAmount}`}
                  </span>
                  <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-semibold text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    <span>{note.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between relative z-10 pt-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
                    📄 {note.pages} pages
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {note.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {note.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400 font-medium">
                  <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5 font-mono">
                    [{note.language}]
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {note.price === 'FREE' ? 'FREE' : `$${note.priceAmount}.00`}
                  </span>
                </div>

                {/* Card Action Buttons (Two-Column) */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <button
                    onClick={() => setPreviewNote(note)}
                    className="bg-[#162035] text-slate-200 hover:bg-[#1C2944] py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border border-white/10 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => handleDownload(note)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Open / PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PDF Preview Modal */}
        {previewNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="max-w-2xl w-full bg-[#0F1626] border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <button
                onClick={() => setPreviewNote(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  Preview Mode (Pages 1-3 of {previewNote.pages})
                </span>
                <h2 className="text-xl font-extrabold text-white">{previewNote.title}</h2>
              </div>

              {/* Simulated PDF Pages */}
              <div className="bg-[#0B0F17] p-6 rounded-2xl border border-white/10 space-y-4 max-h-[50vh] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed">
                <div className="text-center pb-3 border-b border-white/10 text-slate-500">
                  --- PAGE 1: CHAPTER INTRO & CORE CONCEPTS ---
                </div>
                <p>
                  # {previewNote.title}
                  <br /><br />
                  1.1 Introduction: Understanding the fundamental architectural principles covered in this study guide. Designed for university-level engineering exams and technical interviews.
                  <br /><br />
                  1.2 Key Formulas & Syntax Rules:
                  - Time Complexity: O(n log n) average sorting benchmark.
                  - Memory Allocation: Stack vs Heap frame segmentation.
                </p>
                <div className="text-center py-3 border-y border-white/10 text-slate-500">
                  --- PAGE 2: DIAGRAMS & SAMPLE PROBLEMS ---
                </div>
                <p>
                  Figure 1.2: Memory reference mapping and pointer traversal diagrams.
                  <br /><br />
                  *Question:* Given an unsorted array of integers, write an optimized algorithm to find the duplicate element in O(n) time.
                  <br />
                  *Solution:* Utilize a hash set or fast-slow pointer traversal.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setPreviewNote(null)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    handleDownload(previewNote);
                    setPreviewNote(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full PDF ({previewNote.pages} pages)</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
