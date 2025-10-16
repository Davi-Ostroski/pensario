import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, Calendar, Clock } from 'lucide-react';
import apiService from '../services/api';

const NotesList = ({ onCreateNote, onEditNote }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotes();
      setNotes(response.notes || []);
    } catch (error) {
      setError('Erro ao carregar notas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Tem certeza que deseja deletar esta nota?')) {
      return;
    }

    try {
      await apiService.deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (error) {
      setError('Erro ao deletar nota: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando notas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Minhas Notas</h2>
        <Button onClick={onCreateNote}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Nota
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {notes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="text-gray-500 text-lg">Nenhuma nota encontrada</div>
              <Button onClick={onCreateNote}>
                <Plus className="mr-2 h-4 w-4" />
                Criar sua primeira nota
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Card key={note.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditNote(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {note.category && (
                  <Badge variant="secondary" className="w-fit">
                    {note.category}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                {note.content && (
                  <CardDescription className="line-clamp-3 mb-4">
                    {note.content}
                  </CardDescription>
                )}
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-3 w-3" />
                    Criado: {formatDate(note.created_at)}
                  </div>
                  
                  {note.consultation_date && (
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-3 w-3" />
                      Consulta: {formatDate(note.consultation_date)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesList;

