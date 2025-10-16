import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const NotesListScreen = ({ navigation }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useAuth();

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotes();
      setNotes(response.notes || []);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar notas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  const handleDeleteNote = (noteId, noteTitle) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja deletar a nota "${noteTitle}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteNote(noteId);
              setNotes(notes.filter(note => note.id !== noteId));
            } catch (error) {
              Alert.alert('Erro', 'Erro ao deletar nota: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderNoteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => navigation.navigate('NoteForm', { note: item })}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNote(item.id, item.title)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      
      {item.category && (
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      )}
      
      {item.content && (
        <Text style={styles.noteContent} numberOfLines={3}>
          {item.content}
        </Text>
      )}
      
      <View style={styles.noteFooter}>
        <Text style={styles.dateText}>
          Criado: {formatDate(item.created_at)}
        </Text>
        {item.consultation_date && (
          <Text style={styles.dateText}>
            Consulta: {formatDate(item.consultation_date)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhuma nota encontrada</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('NoteForm')}
      >
        <Text style={styles.createButtonText}>Criar sua primeira nota</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando notas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Minhas Notas</Text>
          <Text style={styles.headerSubtitle}>Olá, {user?.username}!</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyList}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NoteForm')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  noteCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  noteFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default NotesListScreen;

