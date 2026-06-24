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
import { useAuth } from '../../context/authContext';
import { apiGetAds, apiCreateAd, Ad } from '../../service/authService';

export default function Home() {
  const { user, loading, logout } = useAuth();

  const [ads, setAds]                   = useState<Ad[]>([]);
  const [adsLoading, setAdsLoading]     = useState(true);
  const [selectedAd, setSelectedAd]     = useState<Ad | null>(null);
  const [profileOpen, setProfileOpen]   = useState(false);
  const [createAdOpen, setCreateAdOpen] = useState(false);
  const [newTitle, setNewTitle]         = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice]         = useState('');
  const [newCategory, setNewCategory]   = useState('');
  const [newPhoto, setNewPhoto]         = useState('');

  // Busca os anúncios do banco de dados assim que a tela abre
  useEffect(() => {
    if (user) {
      loadAdsFromServer();
    }
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

  // ── Handlers de Ações ────────────────────────────────────────────────────────
  async function handleLogout() {
    if (Platform.OS === 'web') {
      if (window.confirm('Deseja encerrar a sessão?')) {
        await logout();
        router.replace('/login');
      }
      return;
    }
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  }

  async function handleCreateAdSubmit() {
    if (!newTitle || !newDescription || !newPrice || !newCategory) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      // Envia os dados para a nossa rota do Express
      const savedAd = await apiCreateAd({
        title: newTitle,
        description: newDescription,
        price: newPrice.startsWith('R$') ? newPrice : `R$ ${newPrice}`,
        category: newCategory,
        photo: newPhoto,
        sellerId: user!.id, // O operador ! resolve o erro de tipagem nula
      });

      // Adiciona o anúncio retornado do banco no topo da lista visual
      setAds([savedAd, ...ads]);
      setCreateAdOpen(false);
      
      // Limpar formulário
      setNewTitle('');
      setNewDescription('');
      setNewPrice('');
      setNewCategory('');
      setNewPhoto('');

      Alert.alert('Sucesso', 'Anúncio publicado com sucesso no banco de dados!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao salvar anúncio.');
    }
  }

  // ── TopBar interna ───────────────────────────────────────────────────────────
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
        <TouchableOpacity style={styles.avatarButton} onPress={() => setProfileOpen(true)} activeOpacity={0.8}>
          <Image source={avatarSource} style={styles.avatarImg} />
          <View style={styles.avatarBadge} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Tela de Carregamento Inicial ─────────────────────────────────────────────
  if (adsLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#e8ff47" />
        <Text style={{ color: '#aaa', marginTop: 12 }}>Conectando ao banco de dados...</Text>
      </View>
    );
  }

  // ── Visualização de Detalhes ─────────────────────────────────────────────────
  if (selectedAd) {
    return (
      <View style={styles.container}>
        <TopBar />
        <ScrollView contentContainerStyle={styles.detailScroll} showsVerticalScrollIndicator={false}>
          <Image source={{ uri: selectedAd.photo }} style={styles.detailImage} />
          <View style={styles.detailBody}>
            <Text style={styles.detailCategory}>{selectedAd.category}</Text>
            <Text style={styles.detailTitle}>{selectedAd.title}</Text>
            <Text style={styles.detailPrice}>{selectedAd.price}</Text>
            <View style={styles.divider} />
            <View style={styles.detailSellerRow}>
              <View style={styles.detailAvatar}><Text style={styles.detailAvatarText}>{selectedAd.seller.charAt(0)}</Text></View>
              <View>
                <Text style={styles.detailSellerLabel}>Vendido por</Text>
                <Text style={styles.detailSellerName}>{selectedAd.seller}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <Text style={styles.fieldLabel}>Descrição</Text>
            <Text style={styles.detailDesc}>{selectedAd.description}</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Listagem Principal ───────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <TopBar />

      {/* Modal de Perfil */}
      <Modal visible={profileOpen} animationType="slide" transparent onRequestClose={() => setProfileOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setProfileOpen(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Perfil</Text>
          <Text style={{color:'#fff', marginBottom: 20, fontSize: 16}}>ID do Usuário: #{user!.id}</Text>
          <Text style={{color:'#aaa', marginBottom: 24, fontSize: 16}}>Nome da Conta: {user!.name}</Text>
          <TouchableOpacity style={styles.saveBtn} onPress={() => setProfileOpen(false)}>
            <Text style={styles.saveBtnText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal Criar Anúncio (Isolado no JSX para não perder o foco ao digitar) */}
      <CreateAdModal 
        visible={createAdOpen}
        onClose={() => setCreateAdOpen(false)}
        title={newTitle}
        setTitle={setNewTitle}
        price={newPrice}
        setPrice={setNewPrice}
        category={newCategory}
        setCategory={setNewCategory}
        photo={newPhoto}
        setPhoto={setNewPhoto}
        description={newDescription}
        setDescription={setNewDescription}
        onSubmit={handleCreateAdSubmit}
      />

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Anúncios Recentes</Text>
        <Text style={styles.listCount}>{ads.length} itens encontrados</Text>
      </View>

      <FlatList
        data={ads}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => setSelectedAd(item)} activeOpacity={0.85}>
            <Image source={{ uri: item.photo }} style={styles.cardImage} />
            <View style={styles.cardBody}>
              <Text style={styles.cardCategory}>{item.category}</Text>
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

      {/* Botão Flutuante "+" */}
      <TouchableOpacity style={styles.fab} onPress={() => setCreateAdOpen(true)} activeOpacity={0.8}>
        <Ionicons name="add" size={30} color="#0a0a0a" />
      </TouchableOpacity>
    </View>
  );
}

type CreateAdModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  setTitle: (text: string) => void;
  price: string;
  setPrice: (text: string) => void;
  category: string;
  setCategory: (text: string) => void;
  photo: string;
  setPhoto: (text: string) => void;
  description: string;
  setDescription: (text: string) => void;
  onSubmit: () => void;
};

const CreateAdModal = ({
  visible, onClose, title, setTitle, price, setPrice,
  category, setCategory, photo, setPhoto, description, setDescription, onSubmit
}: CreateAdModalProps) => (
  <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <Pressable style={styles.backdrop} onPress={onClose} />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1, justifyContent: 'flex-end'}}>
      <View style={styles.sheet}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sheetTitle}>Criar Anúncio</Text>
          
          <Text style={styles.fieldLabel}>Título do Item *</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ex: Computador Gamer" placeholderTextColor="#555"/>
          
          <Text style={styles.fieldLabel}>Preço *</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="Ex: 3500" keyboardType="numeric" placeholderTextColor="#555"/>
          
          <Text style={styles.fieldLabel}>Categoria *</Text>
          <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="Ex: Eletrônicos, Móveis" placeholderTextColor="#555"/>

          <Text style={styles.fieldLabel}>URL da Imagem (Opcional)</Text>
          <TextInput style={styles.input} value={photo} onChangeText={setPhoto} placeholder="https://picsum.photos/..." placeholderTextColor="#555"/>

          <Text style={styles.fieldLabel}>Descrição do Produto *</Text>
          <TextInput style={[styles.input, {height: 80, textAlignVertical: 'top'}]} value={description} onChangeText={setDescription} placeholder="Descreva o estado do item..." multiline placeholderTextColor="#555"/>

          <TouchableOpacity style={styles.saveBtn} onPress={onSubmit}><Text style={styles.saveBtnText}>Salvar no Banco de Dados</Text></TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}><Text style={styles.cancelBtnText}>Cancelar</Text></TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

// ─── Estilos Customizados ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 56 : 44, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#1e1e1e' },
  appName: { color: '#e8ff47', fontSize: 20, fontWeight: '800' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backBtnText: { color: '#e8ff47', fontSize: 16, fontWeight: '600' },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoutBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#1e1e1e', alignItems: 'center', justifyContent: 'center' },
  avatarButton: { position: 'relative' },
  avatarImg: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#e8ff47' },
  avatarBadge: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: '#4cff72', borderWidth: 1.5, borderColor: '#111' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { backgroundColor: '#141414', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 20, width: '100%', maxHeight: '85%' },
  sheetTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 20 },
  fieldLabel: { color: '#888', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  input: { backgroundColor: '#1e1e1e', borderRadius: 10, borderWidth: 1, borderColor: '#2a2a2a', color: '#fff', fontSize: 16, padding: 12, marginBottom: 20 },
  saveBtn: { backgroundColor: '#e8ff47', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#0a0a0a', fontWeight: '800', fontSize: 15 },
  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
  cancelBtnText: { color: '#555', fontSize: 14 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  listTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  listCount: { color: '#555', fontSize: 13 },
  listContent: { paddingHorizontal: 16, paddingBottom: 80, gap: 12 },
  card: { backgroundColor: '#141414', borderRadius: 16, borderWidth: 1, borderColor: '#1e1e1e', overflow: 'hidden', flexDirection: 'row', height: 110 },
  cardImage: { width: 110, height: 110, backgroundColor: '#1e1e1e' },
  cardBody: { flex: 1, padding: 14, justifyContent: 'space-between' },
  cardCategory: { color: '#555', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { color: '#e8ff47', fontSize: 15, fontWeight: '800' },
  cardSellerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardSellerName: { color: '#555', fontSize: 11 },
  detailScroll: { paddingBottom: 40 },
  detailImage: { width: '100%', height: 260, backgroundColor: '#1e1e1e' },
  detailBody: { padding: 24 },
  detailCategory: { color: '#555', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  detailTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  detailPrice: { color: '#e8ff47', fontSize: 26, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#1e1e1e', marginVertical: 20 },
  detailSellerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1e1e1e', alignItems: 'center', justifyContent: 'center' },
  detailAvatarText: { color: '#e8ff47', fontSize: 18, fontWeight: '700' },
  detailSellerLabel: { color: '#555', fontSize: 11 },
  detailSellerName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  detailDesc: { color: '#aaa', fontSize: 15, lineHeight: 24, marginTop: 8 },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#e8ff47', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6 }
});