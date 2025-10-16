import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import apiService from '../services/api';

const NoteFormScreen = ({ navigation, route }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [consultationDate, setConsultationDate] = useState('');
  const [loading, setLoading] = useState(false);

  const note = route.params?.note;
  const isEditing = !!note;

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setCategory(note.category || '');
      
      if (note.consultation_date) {
        // Converter ISO string para formato brasileiro
        const date = new Date(note.consultation_date);
        const formattedDate = date.toLocaleDateString('pt-BR') + ' ' + 
                             date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        setConsultationDate(formattedDate);
      }
    }

    // Configurar título da tela
    navigation.setOptions({
      title: isEditing ? 'Editar Nota' : 'Nova Nota',
    });
  }, [note, isEditing, navigation]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'O título é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || null,
        consultation_date: null, // Simplificado para este exemplo
      };

      if (isEditing) {
        await apiService.updateNote(note.id, noteData);
        Alert.alert('Sucesso', 'Nota atualizada com sucesso!');
      } else {
        await apiService.createNote(noteData);
        Alert.alert('Sucesso', 'Nota criada com sucesso!');
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', error.message || 'Erro ao salvar nota');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Digite o título da nota"
              multiline={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Categoria</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="Ex: Trabalho, Pessoal, Estudos..."
              multiline={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Conteúdo</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={content}
              onChangeText={setContent}
              placeholder="Digite o conteúdo da sua nota..."
              multiline={true}
              numberOfLines={10}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isEditing ? 'Atualizar' : 'Salvar'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleCancel}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6c757d',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButtonText: {
    color: '#6c757d',
  },
});

export default NoteFormScreen;

