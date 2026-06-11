import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/authContext';

export default function Home() {
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? '');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  if (!user) {
    return <Redirect href="/login" />;
  }

  async function handleLogout() {
  if (Platform.OS === 'web') {
    // Alert.alert não funciona na web
    const confirmed = window.confirm('Deseja encerrar a sessão?');
    if (confirmed) {
      await logout();
      router.replace('/login');
    }
    return;
  }

  Alert.alert(
    'Sair',
    'Deseja encerrar a sessão?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]
  );
}

  const handleSave = () => {
    setProfileOpen(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à sua galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const avatarSource = profilePhoto
    ? { uri: profilePhoto }
    : require('../../assets/images/userDefaultIcon.jpeg');

  return (
    <View style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <Text style={styles.appName}>MyApp</Text>

        <View style={styles.topActions}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => setProfileOpen(true)}
            activeOpacity={0.8}
          >
            <Image source={avatarSource} style={styles.avatarImg} />
            <View style={styles.avatarBadge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.title}>Home</Text>

        <Text style={styles.text}>Bem-vindo,</Text>
        {/* user.name — campo correto vindo da API */}
        <Text style={styles.value}>{user.name}</Text>

        <Text style={styles.idLabel}>ID #{user.id}</Text>
      </View>

      {/* PROFILE MODAL */}
      <Modal
        visible={profileOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setProfileOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setProfileOpen(false)} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrapper}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sheetTitle}>Perfil</Text>

              <View style={styles.avatarSection}>
                <Image source={avatarSource} style={styles.avatarLarge} />
                <TouchableOpacity style={styles.changePhotoBtn} onPress={pickImage} activeOpacity={0.75}>
                  <Text style={styles.changePhotoBtnText}>Alterar foto</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Nome de usuário</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholderTextColor="#555"
                placeholder="Seu nome"
                autoCapitalize="none"
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
                <Text style={styles.saveBtnText}>Salvar alterações</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setProfileOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 12, paddingHorizontal: 20,
    backgroundColor: '#111',
    borderBottomWidth: 1, borderBottomColor: '#1e1e1e',
  },
  appName: { color: '#e8ff47', fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoutBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#1e1e1e', alignItems: 'center', justifyContent: 'center',
  },
  avatarButton: { position: 'relative' },
  avatarImg: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#e8ff47' },
  avatarBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#4cff72', borderWidth: 1.5, borderColor: '#111',
  },

  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 30 },
  text: { color: '#888', fontSize: 16, marginTop: 10 },
  value: { color: '#e8ff47', fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  idLabel: { color: '#333', fontSize: 13, marginTop: 8 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheetWrapper: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    paddingTop: 12, maxHeight: '85%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#333', alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarLarge: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 3, borderColor: '#e8ff47', marginBottom: 12,
  },
  changePhotoBtn: {
    paddingVertical: 6, paddingHorizontal: 18,
    borderRadius: 20, borderWidth: 1, borderColor: '#e8ff47',
  },
  changePhotoBtnText: { color: '#e8ff47', fontSize: 13, fontWeight: '600' },
  label: {
    color: '#888', fontSize: 12, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6,
  },
  input: {
    backgroundColor: '#1e1e1e', borderRadius: 10,
    borderWidth: 1, borderColor: '#2a2a2a',
    color: '#fff', fontSize: 16,
    paddingVertical: 12, paddingHorizontal: 14, marginBottom: 18,
  },
  saveBtn: {
    backgroundColor: '#e8ff47', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginBottom: 12, marginTop: 4,
  },
  saveBtnText: { color: '#0a0a0a', fontWeight: '800', fontSize: 15 },
  cancelBtn: { alignItems: 'center', paddingVertical: 10 },
  cancelBtnText: { color: '#555', fontSize: 14 },
});