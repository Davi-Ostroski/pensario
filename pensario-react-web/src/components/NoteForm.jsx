import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Loader2, Mic } from 'lucide-react';
import apiService from '../services/api';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const NoteForm = ({ note, onBack, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [consultationDate, setConsultationDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const isEditing = !!note;
  const categories = ['Trabalho', 'Pessoal', 'Estudos', 'Projetos', 'Ideias', 'Lembretes'];

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

  const handleRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          audioChunksRef.current = [];
          setTranscribing(true);
          try {
            const formData = new FormData();
            formData.append('audio', audioBlob);
            const response = await apiService.transcribeAudio(formData);
            setContent((prevContent) => `${prevContent}${prevContent ? ' ' : ''}${response.transcription}`);
          } catch (error) {
            setError('Erro ao transcrever o áudio.');
          } finally {
            setTranscribing(false);
            stream.getTracks().forEach(track => track.stop());
          }
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        setError('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
      }
    }
  };

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
        category: category || null,
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
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Conteúdo</Label>
                <Button type="button" variant="ghost" size="icon" onClick={handleRecord} disabled={transcribing}>
                  {isRecording ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite o conteúdo da sua nota ou grave um áudio..."
                rows={10}
              />
              {transcribing && <p className="text-sm text-muted-foreground">Transcrevendo áudio...</p>}
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

