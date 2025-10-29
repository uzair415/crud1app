import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load users from AsyncStorage on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const json = await AsyncStorage.getItem('@users');
        if (json) setUsers(JSON.parse(json));
      } catch (e) {
        console.error('Failed to load users:', e);
      }
    };
    loadUsers();
  }, []);

  // Save users list to AsyncStorage
  const saveUsers = async (list: User[]) => {
    setUsers(list);
    try {
      await AsyncStorage.setItem('@users', JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save users:', e);
    }
  };

  // Add or update user
  const handleSubmit = () => {
    if (!firstName || !lastName || !phone || !email) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    // Basic email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email.');
      return;
    }

    const user: User = {
      id: editingId || Date.now().toString(),
      firstName,
      lastName,
      phone,
      email,
    };

    let updatedList = [];
    if (editingId) {
      updatedList = users.map((u) => (u.id === editingId ? user : u));
      Alert.alert('Success', 'User updated!');
    } else {
      updatedList = [...users, user];
      Alert.alert('Success', 'User added!');
    }

    saveUsers(updatedList);

    // Reset form
    setFirstName('');
    setLastName('');
    setPhone('');
    setEmail('');
    setEditingId(null);
  };

  // Fill form with user data for editing
  const handleEdit = (user: User) => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone);
    setEmail(user.email);
    setEditingId(user.id);
  };

  // Delete user by id
  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const filtered = users.filter((u) => u.id !== id);
          saveUsers(filtered);
          Alert.alert('Deleted', 'User has been deleted.');
          if (editingId === id) {
            setEditingId(null);
            setFirstName('');
            setLastName('');
            setPhone('');
            setEmail('');
          }
        },
      },
    ]);
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.firstName}</Text>
      <Text style={styles.cell}>{item.lastName}</Text>
      <Text style={styles.cell}>{item.phone}</Text>
      <Text style={styles.cell}>{item.email}</Text>
      <View style={styles.actionCell}>
        <Button title="Edit" onPress={() => handleEdit(item)} />
        <View style={{ width: 10 }} />
        <Button color="red" title="Delete" onPress={() => handleDelete(item.id)} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{editingId ? 'Edit User' : 'Add User'}</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Button
        title={editingId ? 'Update User' : 'Add User'}
        onPress={handleSubmit}
      />

      {users.length > 0 && (
        <>
          <Text style={styles.listTitle}>Users List</Text>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={styles.cell}>First Name</Text>
            <Text style={styles.cell}>Last Name</Text>
            <Text style={styles.cell}>Phone</Text>
            <Text style={styles.cell}>Email</Text>
            <Text style={[styles.cell, { flex: 1 }]}>Actions</Text>
          </View>
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={renderUser}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  listTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 24, marginBottom: 10 },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  headerRow: { backgroundColor: '#eee' },
  cell: { flex: 1, paddingHorizontal: 8 },
  actionCell: { flexDirection: 'row', alignItems: 'center' },
});
