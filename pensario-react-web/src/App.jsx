import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import NotesList from './components/NotesList';
import NoteForm from './components/NoteForm';
import './App.css';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {isLogin ? (
        <Login onToggleMode={() => setIsLogin(false)} />
      ) : (
        <Register onToggleMode={() => setIsLogin(true)} />
      )}
    </div>
  );
};

const MainApp = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState('notes'); // 'notes', 'create', 'edit'
  const [selectedNote, setSelectedNote] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const handleCreateNote = () => {
    setSelectedNote(null);
    setCurrentView('create');
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setCurrentView('edit');
  };

  const handleBackToNotes = () => {
    setSelectedNote(null);
    setCurrentView('notes');
  };

  const handleNoteSaved = () => {
    setSelectedNote(null);
    setCurrentView('notes');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {currentView === 'notes' && (
          <NotesList 
            onCreateNote={handleCreateNote}
            onEditNote={handleEditNote}
          />
        )}
        
        {(currentView === 'create' || currentView === 'edit') && (
          <NoteForm
            note={selectedNote}
            onBack={handleBackToNotes}
            onSave={handleNoteSaved}
          />
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;

