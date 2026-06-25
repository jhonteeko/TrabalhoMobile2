import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Alert,
  FlatList,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/authContext';
import { apiGetAds, apiCreateAd, Ad } from '../../service/authService';

export default function Home() {
  const { user, loading, logout } = useAuth();

  const [ads, setAds]                       = useState<Ad[]>([]);
  const [adsLoading, setAdsLoading]         = useState(true);
  const [selectedAd, setSelectedAd]         = useState<Ad | null>(null);
  const [profileOpen, setProfileOpen]       = useState(false);
  const [createAdOpen, setCreateAdOpen]     = useState(false);
  const [newTitle, setNewTitle]             = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice]             = useState('');
  const [newTag, setNewTag]       = useState('');
  const [newPhotoBase64, setNewPhotoBase64] = useState<string>('');
  const [newPhotoUri, setNewPhotoUri]       = useState<string>('');
  const [submitting, setSubmitting]         = useState(false);

  useEffect(() => {
    if (user) loadAdsFromServer();
  }, [user]);

  async function loadAdsFromServer() {
    try {
      setAdsLoading(true);
      const data = await apiGetAds();
      setAds(data);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível carregar os anúncios.');
    } finally {
      setAdsLoading(false);
    }
  }

  if (loading) return null;
  if (!user)   return <Redirect href="/login" />;

  const avatarSource = require('../../assets/images/userDefaultIcon.jpeg');

  // ── Image Picker ─────────────────────────────────────────────────────────────
  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos acessar sua galeria para escolher uma foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setNewPhotoUri(asset.uri);
      // Monta a string data URL para salvar no banco
      const mimeType = asset.mimeType ?? 'image/jpeg';
      setNewPhotoBase64(`data:${mimeType};base64,${asset.base64}`);
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────────────
  async function handleLogout() {
    const doLogout = async () => {
      await logout();
      router.replace('/login');
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Deseja encerrar a sessão?')) doLogout();
      return;
    }
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: doLogout },
    ]);
  }

  // ── Criar Anúncio ─────────────────────────────────────────────────────────────
  async function handleCreateAdSubmit() {
    if (!newTitle || !newDescription || !newPrice || !newTag) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setSubmitting(true);

      const savedAd = await apiCreateAd({
        title: newTitle,
        description: newDescription,
        price: newPrice.startsWith('R$') ? newPrice : `R$ ${newPrice}`,
        tag: newTag,
        // Envia base64 se o usuário escolheu uma foto, senão string vazia
        photo: newPhotoBase64 || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQMuowloNOhI2zc4H-Hs8cP5yPACmgnfYwn1GWNdZ3zg&s=10',
        sellerId: user!.id,
      });

      // Adiciona o anúncio no topo da lista sem precisar recarregar tudo
      setAds(prev => [savedAd, ...prev]);

      // Fecha o modal e limpa o formulário
      setCreateAdOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewPrice('');
      setNewTag('');
      setNewPhotoBase64('');
      setNewPhotoUri('');

      Alert.alert('Sucesso', 'Anúncio publicado com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao salvar anúncio.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── TopBar ────────────────────────────────────────────────────────────────────
  const TopBar = () => (
    <View style={styles.topBar}>
      {selectedAd ? (
        <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedAd(null)}>
          <Ionicons name="arrow-back" size={20} color="#e8ff47" />
          <Text style={styles.backBtnText}>Anúncios</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.appName}>Marketplace</Text>
      )}

      <View style={styles.topRight}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#888" />
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
  );

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (adsLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#e8ff47" />
        <Text style={{ color: '#aaa', marginTop: 12 }}>Conectando ao banco de dados...</Text>
      </View>
    );
  }

  // ── Detalhe do Anúncio ────────────────────────────────────────────────────────
  if (selectedAd) {
    return (
      <View style={styles.container}>
        <TopBar />
        <ScrollView
          contentContainerStyle={styles.detailScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Bloco superior: imagem à esquerda + info à direita */}
          <View style={styles.detailHero}>
            <View style={styles.detailImageBox}>
              <Image
                source={{ uri: selectedAd.photo }}
                style={styles.detailImage}
                resizeMode="cover"
              />
            </View>

            <View style={styles.detailSide}>
              <Text style={styles.detailTag}>{selectedAd.tag}</Text>
              <Text style={styles.detailTitle} numberOfLines={4}>
                {selectedAd.title}
              </Text>
              <Text style={styles.detailPrice}>{selectedAd.price}</Text>

              <View style={styles.detailDividerThin} />

              <View style={styles.detailSellerRow}>
                <View style={styles.detailAvatar}>
                  <Text style={styles.detailAvatarText}>
                    {selectedAd.seller.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailSellerLabel}>Vendido por</Text>
                  <Text style={styles.detailSellerName} numberOfLines={1}>
                    {selectedAd.seller}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Descrição abaixo, ocupa largura total */}
          <View style={styles.detailDescSection}>
            <Text style={styles.fieldLabel}>Descrição</Text>
            <Text style={styles.detailDesc}>{selectedAd.description}</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Listagem Principal ────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <TopBar />

      {/* Modal de Perfil */}
      <Modal
        visible={profileOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setProfileOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setProfileOpen(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Perfil</Text>
          <Text style={{ color: '#fff', marginBottom: 12, fontSize: 16 }}>
            ID: #{user!.id}
          </Text>
          <Text style={{ color: '#aaa', marginBottom: 24, fontSize: 16 }}>
            Usuário: {user!.name}
          </Text>
          <TouchableOpacity style={styles.saveBtn} onPress={() => setProfileOpen(false)}>
            <Text style={styles.saveBtnText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal Criar Anúncio */}
      <CreateAdModal
        visible={createAdOpen}
        onClose={() => {
          setCreateAdOpen(false);
          setNewPhotoUri('');
          setNewPhotoBase64('');
        }}
        title={newTitle}
        setTitle={setNewTitle}
        price={newPrice}
        setPrice={setNewPrice}
        tag={newTag}
        setTag={setNewTag}
        photoUri={newPhotoUri}
        onPickImage={handlePickImage}
        description={newDescription}
        setDescription={setNewDescription}
        onSubmit={handleCreateAdSubmit}
        submitting={submitting}
      />

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Anúncios Recentes</Text>
        <Text style={styles.listCount}>{ads.length} itens</Text>
      </View>

      <FlatList
        data={ads}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="pricetag-outline" size={40} color="#333" />
            <Text style={styles.emptyText}>Nenhum anúncio ainda.</Text>
            <Text style={styles.emptySubText}>Seja o primeiro a publicar!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setSelectedAd(item)}
            activeOpacity={0.85}
          >
            <Image source={{ uri: item.photo }} style={styles.cardImage} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTag}>{item.tag}</Text>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardPrice}>{item.price}</Text>
                <View style={styles.cardSellerRow}>
                  <Ionicons name="person-circle-outline" size={14} color="#555" />
                  <Text style={styles.cardSellerName}>{item.seller}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setCreateAdOpen(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#0a0a0a" />
      </TouchableOpacity>
    </View>
  );
}

// ── Modal Criar Anúncio (componente separado para não perder foco nos inputs) ──
type CreateAdModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  setTitle: (t: string) => void;
  price: string;
  setPrice: (t: string) => void;
  tag: string;
  setTag: (t: string) => void;
  photoUri: string;
  onPickImage: () => void;
  description: string;
  setDescription: (t: string) => void;
  onSubmit: () => void;
  submitting: boolean;
};

function CreateAdModal({
  visible, onClose,
  title, setTitle,
  price, setPrice,
  tag, setTag,
  photoUri, onPickImage,
  description, setDescription,
  onSubmit, submitting,
}: CreateAdModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.sheetTitle}>Novo Anúncio</Text>

            {/* Seletor de Foto */}
            <Text style={styles.fieldLabel}>Foto do Item</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={onPickImage} activeOpacity={0.8}>
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={styles.imagePickerPreview}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.imagePickerPlaceholder}>
                  <Ionicons name="camera-outline" size={32} color="#555" />
                  <Text style={styles.imagePickerText}>Toque para escolher uma foto</Text>
                </View>
              )}
            </TouchableOpacity>
            {photoUri ? (
              <TouchableOpacity
                style={styles.removePhotoBtn}
                onPress={onPickImage}
              >
                <Ionicons name="refresh-outline" size={14} color="#888" />
                <Text style={styles.removePhotoBtnText}>Trocar foto</Text>
              </TouchableOpacity>
            ) : null}

            <Text style={styles.fieldLabel}>Título *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Computador Gamer"
              placeholderTextColor="#555"
            />

            <Text style={styles.fieldLabel}>Preço *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="Ex: 3500"
              keyboardType="numeric"
              placeholderTextColor="#555"
            />

            <Text style={styles.fieldLabel}>Tag *</Text>
            <TextInput
              style={styles.input}
              value={tag}
              onChangeText={setTag}
              placeholder="Ex: Eletrônicos, Móveis"
              placeholderTextColor="#555"
            />

            <Text style={styles.fieldLabel}>Descrição *</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descreva o estado do item..."
              multiline
              placeholderTextColor="#555"
            />

            <TouchableOpacity
              style={[styles.saveBtn, submitting && { opacity: 0.7 }]}
              onPress={onSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#0a0a0a" />
              ) : (
                <Text style={styles.saveBtnText}>Publicar Anúncio</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#0a0a0a' },
  topBar:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 56 : 44, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#1e1e1e' },
  appName:            { color: '#e8ff47', fontSize: 20, fontWeight: '800' },
  backBtn:            { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backBtnText:        { color: '#e8ff47', fontSize: 16, fontWeight: '600' },
  topRight:           { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoutBtn:          { width: 36, height: 36, borderRadius: 10, backgroundColor: '#1e1e1e', alignItems: 'center', justifyContent: 'center' },
  avatarButton:       { position: 'relative' },
  avatarImg:          { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#e8ff47' },
  avatarBadge:        { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: '#4cff72', borderWidth: 1.5, borderColor: '#111' },
  backdrop:           { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet:              { backgroundColor: '#141414', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 20, width: '100%', maxHeight: '90%' },
  sheetTitle:         { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 20 },
  fieldLabel:         { color: '#888', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  input:              { backgroundColor: '#1e1e1e', borderRadius: 10, borderWidth: 1, borderColor: '#2a2a2a', color: '#fff', fontSize: 16, padding: 12, marginBottom: 20 },
  saveBtn:            { backgroundColor: '#e8ff47', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 10 },
  saveBtnText:        { color: '#0a0a0a', fontWeight: '800', fontSize: 15 },
  cancelBtn:          { alignItems: 'center', paddingVertical: 14 },
  cancelBtnText:      { color: '#555', fontSize: 14 },
  listHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  listTitle:          { color: '#fff', fontSize: 18, fontWeight: '700' },
  listCount:          { color: '#555', fontSize: 13 },
  listContent:        { paddingHorizontal: 16, paddingBottom: 80, gap: 12 },
  card:               { backgroundColor: '#141414', borderRadius: 16, borderWidth: 1, borderColor: '#1e1e1e', overflow: 'hidden', flexDirection: 'row', height: 110 },
  cardImage:          { width: 110, height: 110, backgroundColor: '#1e1e1e' },
  cardBody:           { flex: 1, padding: 14, justifyContent: 'space-between' },
  cardTag:       { color: '#555', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  cardTitle:          { color: '#fff', fontSize: 14, fontWeight: '600' },
  cardFooter:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice:          { color: '#e8ff47', fontSize: 15, fontWeight: '800' },
  cardSellerRow:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardSellerName:     { color: '#555', fontSize: 11 },
  detailScroll:       { paddingBottom: 40 },
  // Hero: imagem esquerda + info direita
  detailHero:         { flexDirection: 'row', margin: 16, gap: 14, alignItems: 'flex-start' },
  detailImageBox:     { width: '42%', aspectRatio: 3 / 4, borderRadius: 14, overflow: 'hidden', backgroundColor: '#1e1e1e' },
  detailImage:        { width: '100%', height: '100%' },
  detailSide:         { flex: 1, paddingTop: 2 },
  detailTag:     { color: '#555', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  detailTitle:        { color: '#fff', fontSize: 16, fontWeight: '700', lineHeight: 22, marginBottom: 10 },
  detailPrice:        { color: '#e8ff47', fontSize: 22, fontWeight: '800', marginBottom: 14 },
  detailDividerThin:  { height: 1, backgroundColor: '#1e1e1e', marginBottom: 14 },
  detailSellerRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailAvatar:       { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e1e1e', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  detailAvatarText:   { color: '#e8ff47', fontSize: 15, fontWeight: '700' },
  detailSellerLabel:  { color: '#555', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailSellerName:   { color: '#fff', fontSize: 13, fontWeight: '600' },
  // Descrição abaixo
  detailDescSection:  { paddingHorizontal: 16, paddingTop: 4 },
  detailDesc:         { color: '#aaa', fontSize: 15, lineHeight: 24, marginTop: 8 },
  fab:                { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#e8ff47', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  // Image Picker
  imagePicker:        { width: '100%', height: 130, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 8, backgroundColor: '#1e1e1e' },
  imagePickerPreview: { width: '100%', height: '100%' },
  imagePickerPlaceholder: { flex: 1, backgroundColor: '#1e1e1e', alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePickerText:    { color: '#555', fontSize: 13 },
  removePhotoBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 },
  removePhotoBtnText: { color: '#888', fontSize: 12 },
  // Empty state
  emptyBox:           { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText:          { color: '#555', fontSize: 16, fontWeight: '600' },
  emptySubText:       { color: '#333', fontSize: 13 },
});