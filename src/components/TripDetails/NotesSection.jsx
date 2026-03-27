import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';
import { collection, onSnapshot, addDoc, query, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { StickyNote, Plus, Trash2, Clock } from 'lucide-react';

const NotesSection = ({ tripId }) => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser || !tripId) return;

    const notesRef = collection(db, 'users', currentUser.uid, 'trips', tripId, 'notes');
    const q = query(notesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotes(notesData);
    });

    return () => unsubscribe();
  }, [currentUser, tripId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const notesRef = collection(db, 'users', currentUser.uid, 'trips', tripId, 'notes');
      await addDoc(notesRef, {
        content,
        createdAt: serverTimestamp()
      });
      setContent('');
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const noteRef = doc(db, 'users', currentUser.uid, 'trips', tripId, 'notes', noteId);
      await deleteDoc(noteRef);
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
      
      {/* Add Note Section */}
      <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <StickyNote className="w-6 h-6 text-teal-600" /> Travel Journal
        </h3>
        
        <form onSubmit={handleAddNote} className="space-y-4">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Jot down quick thoughts, addresses, or reminders for your trip..."
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-6 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium min-h-[140px] resize-y"
            required
          />
          <div className="flex justify-end">
             <button 
                type="submit" 
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center gap-2"
              >
                {loading ? <div className="w-5 h-5 animate-spin border-2 border-white/30 border-t-white rounded-full"/> : <Plus className="w-5 h-5"/>}
                Save Note
              </button>
          </div>
        </form>
      </div>

      {/* Notes Masonry / List */}
      <div className="space-y-6">
        {notes.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-800 mb-2">Your journal is empty</h4>
            <p className="text-gray-500">Add flight gates, hotel contacts, or exciting discoveries here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notes.map(note => (
              <div 
                key={note.id} 
                className="group relative bg-amber-50/50 hover:bg-amber-100/50 rounded-3xl p-8 shadow-sm hover:shadow-md border border-amber-100 transition-all flex flex-col min-h-[200px]"
              >
                <div className="flex-1 text-gray-700 whitespace-pre-wrap leading-relaxed text-lg mb-6">
                  {note.content}
                </div>
                
                <div className="flex items-center justify-between text-xs font-semibold text-gray-400 mt-auto pt-4 border-t border-amber-200/50">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {note.createdAt?.toDate ? note.createdAt.toDate().toLocaleString() : 'Just now'}</span>
                  
                  <button 
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-2 text-red-300 hover:bg-red-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default NotesSection;
