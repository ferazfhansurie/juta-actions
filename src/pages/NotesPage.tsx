import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3,
  Trash2,
  MoreHorizontal,
  FileText,
  Clock,
  X,
  Brain
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);

  // Fetch notes from API on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://c4ba947d9455f026.ngrok.app/api/internal-items/type/note/1', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        // Convert API response to our Note interface
        const noteItems = data.items.map((note: any) => ({
          id: note.id.toString(),
          title: note.title,
          content: note.content,
          createdAt: new Date(note.created_at),
          updatedAt: new Date(note.updated_at)
        }));
        setNotes(noteItems);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedNoteData = selectedNote ? notes.find(n => n.id === selectedNote) : null;

  const handleCreateNote = async () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote.id);
    setEditingContent('');
    setShowNotesModal(false);
  };

  // Process note content through AI analysis (like WhatsApp messages)
  const handleProcessNote = async (content: string) => {
    if (!content.trim()) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://c4ba947d9455f026.ngrok.app/api/process-note', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 1,
          content: content,
          title: content.split('\n')[0] || 'Brain Dump Note'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // If a note was created, update local state with the server ID
        if (data.note && selectedNote) {
          const updatedNotes = notes.map(note =>
            note.id === selectedNote
              ? { ...note, id: data.note.id.toString() }
              : note
          );
          setNotes(updatedNotes);
          setSelectedNote(data.note.id.toString());
        }

        // Show success message if actions were detected
        if (data.actions && data.actions.length > 0) {
          console.log(`AI detected ${data.actions.length} action(s) from your note!`);
        }
      }
    } catch (error) {
      console.error('Error processing note with AI:', error);
    }
  };

  const handleNoteSelect = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setSelectedNote(noteId);
      setEditingContent(note.content);
      setShowNotesModal(false);
    }
  };

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContentChange = (content: string) => {
    setEditingContent(content);
    setHasUnsavedChanges(true);
    
    if (selectedNote) {
      const lines = content.split('\n');
      const title = lines[0] || 'New Note';
      
      // Update local state immediately for responsive UX
      const updatedNotes = notes.map(note => {
        if (note.id === selectedNote) {
          return {
            ...note,
            title: title.slice(0, 50),
            content,
            updatedAt: new Date()
          };
        }
        return note;
      });
      setNotes(updatedNotes);
    }
  };

  const handleSaveNote = async () => {
    if (!editingContent.trim() || !selectedNote) return;
    
    setIsProcessing(true);
    try {
      await handleProcessNote(editingContent);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    // Delete from API
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`https://c4ba947d9455f026.ngrok.app/api/internal-items/note/${noteId}?userId=1`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error deleting note from API:', error);
    }
    
    // Update local state
    setNotes(notes.filter(n => n.id !== noteId));
    if (selectedNote === noteId) {
      setSelectedNote(null);
      setEditingContent('');
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  const getPreviewText = (content: string) => {
    const lines = content.split('\n');
    const secondLine = lines[1] || '';
    return secondLine.slice(0, 80) + (secondLine.length > 80 ? '...' : '');
  };

  if (loading) {
    return (
      <div className="min-h-screen p-3 lg:p-6 flex items-center justify-center">
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading notes</h3>
          <p className="text-white/70">Fetching your brain dump...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - matching AIActionsPage style */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 lg:space-x-4">
            <button
              onClick={() => setShowNotesModal(true)}
              className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-medium transition-all duration-300 whitespace-nowrap bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
            >
              <FileText className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
              <span className="truncate max-w-[120px] lg:max-w-[200px]">
                {selectedNoteData ? selectedNoteData.title : 'Select Note'}
              </span>
              <span className="ml-1 px-1.5 lg:px-2 py-0.5 bg-white/10 text-white/80 text-xs rounded-full font-semibold min-w-[16px] lg:min-w-[20px] text-center">
                {notes.length}
              </span>
            </button>

            <button
              onClick={handleCreateNote}
              className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-medium transition-all duration-300 whitespace-nowrap bg-purple-500/20 text-purple-300 border border-purple-400/30 shadow-lg hover:bg-purple-500/30"
            >
              <Plus className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
              <span>New Note</span>
            </button>
          </div>

          {selectedNoteData && (
            <div className="text-xs text-white/60">
              Last edited {formatDate(selectedNoteData.updatedAt)}
            </div>
          )}
        </div>

        {/* Notes Section Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm lg:text-base font-bold text-white">
            {selectedNoteData ? selectedNoteData.title : 'Notes'}
          </h2>
          <div className="text-xs text-white/60">
            Brain dump & thoughts
          </div>
        </div>

        {/* Main Content Area - matching AIActionsPage style */}
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 h-[calc(100vh-200px)]">
          {selectedNoteData ? (
            /* Note Editor */
            <div className="flex flex-col h-full">
              <textarea
                value={editingContent}
                onChange={(e) => handleContentChange(e.target.value)}
                onKeyDown={(e) => {
                  // Prevent any unwanted form submissions or page actions
                  if (e.key === 'Enter' && e.shiftKey) {
                    // Allow shift+enter for new lines
                    return;
                  }
                }}
                placeholder="Start writing your thoughts... When ready, click 'Process with AI' to analyze for actions and save to your brain dump."
                className="flex-1 w-full p-4 lg:p-8 resize-none bg-transparent border-0 outline-0 text-base lg:text-lg leading-relaxed text-white placeholder-white/40 overflow-y-auto"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              />
              
              {/* Save Button */}
              {hasUnsavedChanges && editingContent.trim() && (
                <div className="p-4 lg:p-6 border-t border-white/10 flex justify-between items-center">
                  <div className="text-sm text-white/60">
                    {isProcessing ? 'Processing with AI...' : 'Ready to analyze and save'}
                  </div>
                  <button
                    onClick={handleSaveNote}
                    disabled={isProcessing}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isProcessing
                        ? 'bg-white/10 text-white/50 cursor-not-allowed'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-400/30 shadow-lg hover:bg-purple-500/30 hover:shadow-xl'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        <span>Process with AI</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Empty State - matching AIActionsPage style */
            <div className="flex items-center justify-center h-64 lg:h-96">
              <div className="text-center px-4">
                <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Edit3 className="w-6 h-6 lg:w-8 lg:h-8 text-white/40" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-white mb-2">
                  Your Second Brain
                </h3>
                <p className="text-white/70 text-sm lg:text-base max-w-md">
                  Create a new note or select an existing one to start capturing your thoughts and ideas.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Notes Modal */}
        {showNotesModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl max-h-[80vh] rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 lg:p-6 border-b border-white/10">
                <h2 className="text-lg lg:text-xl font-bold text-white">Select Note</h2>
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 lg:p-6 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search notes..."
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition-all"
                  />
                </div>
              </div>

              {/* Notes List */}
              <div className="max-h-96 overflow-y-auto p-3 lg:p-4">
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60 mb-4">
                      {notes.length === 0 ? 'No notes yet' : 'No notes found'}
                    </p>
                    <button
                      onClick={handleCreateNote}
                      className="px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-xl hover:bg-purple-500/30 transition-all"
                    >
                      Create your first note
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNotes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => handleNoteSelect(note.id)}
                        className={`group relative overflow-hidden rounded-xl backdrop-blur-xl border transition-all duration-300 cursor-pointer hover:scale-[1.01] p-3 lg:p-4 ${
                          selectedNote === note.id 
                            ? 'bg-white/20 border-purple-400/40 shadow-xl shadow-purple-500/20' 
                            : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-white text-sm truncate flex-1 pr-2">
                              {note.title}
                            </h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(note.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3 h-3 text-white/60" />
                            </button>
                          </div>
                          
                          <p className="text-sm text-white/70 mb-2 line-clamp-2 leading-relaxed">
                            {getPreviewText(note.content)}
                          </p>
                          
                          <div className="flex items-center space-x-1 text-xs text-white/50">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(note.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 text-center">
                <p className="text-xs text-white/50">{notes.length} note{notes.length !== 1 ? 's' : ''} total</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPage;