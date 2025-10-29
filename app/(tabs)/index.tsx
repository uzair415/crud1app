import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const App = () => {
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  // Load data from AsyncStorage
  const loadItems = async () => {
    const saved = await AsyncStorage.getItem('items');
    if (saved) setItems(JSON.parse(saved));
  };

  // Save data to AsyncStorage
  const saveItems = async (data) => {
    await AsyncStorage.setItem('items', JSON.stringify(data));
  };

  // Create or update an item
  const handleAdd = async () => {
    if (text.trim() === '') return;

    let newItems;
    if (editingId) {
      newItems = items.map(item =>
        item.id === editingId ? { ...item, name: text } : item
      );
      setEditingId(null);
    } else {
      newItems = [...items, { id: Date.now().toString(), name: text }];
    }

    setItems(newItems);
    setText('');
    saveItems(newItems);
  };

  // Delete item
  const handleDelete = async (id) => {
    const filtered = items.filter(item => item.id !== id);
    setItems(filtered);
    saveItems(filtered);
  };

  // Edit item
  const handleEdit = (item) => {
    setText(item.name);
    setEditingId(item.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>React Native CRUD App</Text>

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Enter item name"
          style={styles.input}
        />
        <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
          <Text style={styles.addButtonText}>{editingId ? 'Update' : 'Add'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>{item.name}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Text style={styles.edit}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.delete}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputRow: { flexDirection: 'row', marginBottom: 10 },
  input: { flex: 1, borderColor: '#ccc', borderWidth: 1, padding: 10, borderRadius: 5 },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  itemText: { fontSize: 16 },
  actions: { flexDirection: 'row' },
  edit: { color: 'green', marginRight: 15 },
  delete: { color: 'red' },
});

export default App;
