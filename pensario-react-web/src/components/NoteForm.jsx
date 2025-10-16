import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import apiService from '../services/api';

const NoteForm = ({ note, onBack, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [consultationDate, setConsultationDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!note;

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setCategory(note.category || '');
      
      if (note.consultation_date) {
        // Converter ISO string para formato datetime-local
        const date = new Date(note.consultation_date);
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setConsultationDate(localDateTime);
      }
    }
  }, [note]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!title.trim()) {
      setError('O título é obrigatório');
      setLoading(false);
      return;
    }

    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || null,
        consultation_date: consultationDate || null,
      };

      if (isEditing) {
        await apiService.updateNote(note.id, noteData);
      } else {
        await apiService.createNote(noteData);
      }

      onSave();
    } catch (error) {
      setError(error.message || 'Erro ao salvar nota');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h2 className="text-2xl font-bold">
          {isEditing ? 'Editar Nota' : 'Nova Nota'}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Editar Nota' : 'Criar Nova Nota'}
          </CardTitle>
          <CardDescription>
            {isEditing 
              ? 'Faça as alterações necessárias na sua nota'
              : 'Preencha os campos abaixo para criar uma nova nota'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título da nota"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Trabalho, Pessoal, Estudos..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultationDate">Data de Consulta</Label>
              <Input
                id="consultationDate"
                type="datetime-local"
                value={consultationDate}
                onChange={(e) => setConsultationDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite o conteúdo da sua nota..."
                rows={10}
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? 'Atualizar' : 'Salvar'}
              </Button>
              
              <Button type="button" variant="outline" onClick={onBack}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoteForm;

