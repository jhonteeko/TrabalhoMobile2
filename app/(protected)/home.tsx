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
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/authContext';
import { useTheme, Theme } from '../../context/themeContext';
import { apiGetAds, apiCreateAd, apiGetComments, apiCreateComment, Ad, Comment } from '../../service/authService';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const s = makeStyles(theme);

  const [ads, setAds]                       = useState<Ad[]>([]);
  const [adsLoading, setAdsLoading]         = useState(true);
  const [selectedAd, setSelectedAd]         = useState<Ad | null>(null);
  const [profileOpen, setProfileOpen]       = useState(false);
  const [createAdOpen, setCreateAdOpen]     = useState(false);
  const [newTitle, setNewTitle]             = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice]             = useState('');
  const [newTag, setNewTag]                 = useState('');
  const [newPhotoBase64, setNewPhotoBase64] = useState<string>('');
  const [newPhotoUri, setNewPhotoUri]       = useState<string>('');
  const [submitting, setSubmitting]         = useState(false);

  // Comentários
  const [comments, setComments]             = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText]       = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    if (user) loadAdsFromServer();
  }, [user]);

  // Carrega comentários sempre que um anúncio é selecionado
  useEffect(() => {
    if (selectedAd) {
      setComments([]);
      setCommentText('');
      loadComments(selectedAd.id);
    }
  }, [selectedAd]);

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

  async function loadComments(adId: number) {
    try {
      setCommentsLoading(true);
      const data = await apiGetComments(adId);
      setComments(data);
    } catch (error: any) {
      // silently fail — comentários são secundários
    } finally {
      setCommentsLoading(false);
    }
  }

  async function handleSendComment() {
    if (!commentText.trim() || !selectedAd) return;
    try {
      setSendingComment(true);
      const saved = await apiCreateComment(selectedAd.id, commentText.trim(), user!.id);
      setComments(prev => [...prev, saved]);
      setCommentText('');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível enviar o comentário.');
    } finally {
      setSendingComment(false);
    }
  }

  if (loading) return null;
  if (!user)   return <Redirect href="/login" />;

  const avatarSource = require('../../assets/images/userDefaultIcon.jpeg');

  // ── Image Picker ──────────────────────────────────────────────────────────────
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
      const mimeType = asset.mimeType ?? 'image/jpeg';
      setNewPhotoBase64(`data:${mimeType};base64,${asset.base64}`);
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────────────
  async function handleLogout() {
    const doLogout = async () => { await logout(); router.replace('/login'); };
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
        photo: newPhotoBase64 || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQMuowloNOhI2zc4H-Hs8cP5yPACmgnfYwn1GWNdZ3zg&s=10',
        sellerId: user!.id,
      });
      setAds(prev => [savedAd, ...prev]);
      setCreateAdOpen(false);
      setNewTitle(''); setNewDescription(''); setNewPrice('');
      setNewTag(''); setNewPhotoBase64(''); setNewPhotoUri('');
      Alert.alert('Sucesso', 'Anúncio publicado com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao salvar anúncio.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── TopBar ────────────────────────────────────────────────────────────────────
  const TopBar = () => (
    <View style={s.topBar}>
      {selectedAd ? (
        <TouchableOpacity style={s.backBtn} onPress={() => setSelectedAd(null)}>
          <Ionicons name="arrow-back" size={20} color={theme.accent} />
          <Text style={s.backBtnText}>Anúncios</Text>
        </TouchableOpacity>
      ) : (
        <Text style={s.appName}>Marketplace</Text>
      )}
      <View style={s.topRight}>
        <TouchableOpacity onPress={handleLogout} style={s.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={theme.textDim} />
        </TouchableOpacity>
        <TouchableOpacity style={s.avatarButton} onPress={() => setProfileOpen(true)} activeOpacity={0.8}>
          <Image source={avatarSource} style={s.avatarImg} />
          <View style={s.avatarBadge} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Loading inicial ───────────────────────────────────────────────────────────
  if (adsLoading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{ color: theme.textMuted, marginTop: 12 }}>Conectando ao banco de dados...</Text>
      </View>
    );
  }

  // ── Detalhe do Anúncio ────────────────────────────────────────────────────────
  if (selectedAd) {
    return (
      <View style={s.container}>
        <TopBar />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <ScrollView contentContainerStyle={s.detailScroll} showsVerticalScrollIndicator={false}>

            {/* Hero: imagem + info */}
            <View style={s.detailHero}>
              <View style={s.detailImageBox}>
                <Image source={{ uri: selectedAd.photo }} style={s.detailImage} resizeMode="cover" />
              </View>
              <View style={s.detailSide}>
                <Text style={s.detailTag}>{selectedAd.tag}</Text>
                <Text style={s.detailTitle} numberOfLines={4}>{selectedAd.title}</Text>
                <Text style={s.detailPrice}>{selectedAd.price}</Text>
                <View style={s.detailDividerThin} />
                <View style={s.detailSellerRow}>
                  <View style={s.detailAvatar}>
                    <Text style={s.detailAvatarText}>{selectedAd.seller.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.detailSellerLabel}>Vendido por</Text>
                    <Text style={s.detailSellerName} numberOfLines={1}>{selectedAd.seller}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Descrição */}
            <View style={s.detailDescSection}>
              <Text style={s.fieldLabel}>Descrição</Text>
              <Text style={s.detailDesc}>{selectedAd.description}</Text>
            </View>

            {/* ── Seção de Comentários ── */}
            <View style={s.commentsSection}>
              <View style={s.commentsSectionHeader}>
                <Text style={s.commentsSectionTitle}>Comentários</Text>
                <Text style={s.commentsCount}>{comments.length}</Text>
              </View>

              {/* Campo de novo comentário */}
              <View style={s.commentInputRow}>
                <View style={s.commentInputWrap}>
                  <TextInput
                    style={s.commentInput}
                    value={commentText}
                    onChangeText={setCommentText}
                    placeholder="Escreva um comentário..."
                    placeholderTextColor={theme.textDim}
                    multiline
                    maxLength={300}
                  />
                </View>
                <TouchableOpacity
                  style={[s.commentSendBtn, (!commentText.trim() || sendingComment) && s.commentSendBtnDisabled]}
                  onPress={handleSendComment}
                  disabled={!commentText.trim() || sendingComment}
                  activeOpacity={0.8}
                >
                  {sendingComment
                    ? <ActivityIndicator size="small" color={theme.accentText} />
                    : <Ionicons name="send" size={18} color={theme.accentText} />
                  }
                </TouchableOpacity>
              </View>

              {/* Lista de comentários */}
              {commentsLoading ? (
                <ActivityIndicator color={theme.accent} style={{ marginTop: 20 }} />
              ) : comments.length === 0 ? (
                <View style={s.commentsEmpty}>
                  <Ionicons name="chatbubble-outline" size={32} color={theme.emptyIcon} />
                  <Text style={s.commentsEmptyText}>Nenhum comentário ainda.</Text>
                </View>
              ) : (
                comments.map(c => (
                  <View key={c.id} style={s.commentCard}>
                    <View style={s.commentAvatar}>
                      <Text style={s.commentAvatarText}>{c.author.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={s.commentBody}>
                      <Text style={s.commentAuthor}>{c.author}</Text>
                      <Text style={s.commentContent}>{c.content}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ── Listagem Principal ────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <TopBar />

      {/* Modal de Perfil */}
      <Modal visible={profileOpen} animationType="slide" transparent onRequestClose={() => setProfileOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => setProfileOpen(false)} />
        <View style={s.sheet}>
          <Text style={s.sheetTitle}>Perfil</Text>
          <View style={s.profileInfoRow}>
            <Image source={avatarSource} style={s.profileAvatar} />
            <View>
              <Text style={s.profileName}>{user!.name}</Text>
              <Text style={s.profileId}>ID #{user!.id}</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.themeRow}>
            <View style={s.themeRowLeft}>
              <Ionicons name={isDark ? 'moon-outline' : 'sunny-outline'} size={20} color={theme.accent} />
              <Text style={s.themeLabel}>{isDark ? 'Modo Escuro' : 'Modo Claro'}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#d0d0d0', true: '#3a3a1a' }}
              thumbColor={theme.accent}
            />
          </View>
          <View style={s.divider} />
          <TouchableOpacity style={s.saveBtn} onPress={() => setProfileOpen(false)}>
            <Text style={s.saveBtnText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal Criar Anúncio */}
      <CreateAdModal
          visible={createAdOpen}
          onClose={() => { setCreateAdOpen(false); setNewPhotoUri(''); setNewPhotoBase64(''); }}
          title={newTitle}       setTitle={setNewTitle}
          price={newPrice}       setPrice={setNewPrice}
          tag={newTag}           setTag={setNewTag}
          photoUri={newPhotoUri} onPickImage={handlePickImage}
          description={newDescription} setDescription={setNewDescription}
          onSubmit={handleCreateAdSubmit}
          submitting={submitting}
          theme={theme}
        />

        <View style={s.listHeader}>
          <Text style={s.listTitle}>Anúncios Recentes</Text>
          <Text style={s.listCount}>{ads.length} itens</Text>
        </View>

        <FlatList
          data={ads}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <Ionicons name="pricetag-outline" size={40} color={theme.emptyIcon} />
              <Text style={s.emptyText}>Nenhum anúncio ainda.</Text>
              <Text style={s.emptySubText}>Seja o primeiro a publicar!</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => setSelectedAd(item)} activeOpacity={0.85}>
              <Image source={{ uri: item.photo }} style={s.cardImage} />
              <View style={s.cardBody}>
                <Text style={s.cardTag}>{item.tag}</Text>
                <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
                <View style={s.cardFooter}>
                  <Text style={s.cardPrice}>{item.price}</Text>
                  <View style={s.cardSellerRow}>
                    <Ionicons name="person-circle-outline" size={14} color={theme.textDim} />
                    <Text style={s.cardSellerName}>{item.seller}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity style={s.fab} onPress={() => setCreateAdOpen(true)} activeOpacity={0.8}>
          <Ionicons name="add" size={30} color={theme.accentText} />
        </TouchableOpacity>
      </View>
    );
  }

  // ── Modal Criar Anúncio ───────────────────────────────────────────────────────
  type CreateAdModalProps = {
    visible: boolean; onClose: () => void;
    title: string; setTitle: (t: string) => void;
    price: string; setPrice: (t: string) => void;
    tag: string; setTag: (t: string) => void;
    photoUri: string; onPickImage: () => void;
    description: string; setDescription: (t: string) => void;
    onSubmit: () => void; submitting: boolean;
    theme: Theme;
  };

  function CreateAdModal({
    visible, onClose, title, setTitle, price, setPrice,
    tag, setTag, photoUri, onPickImage, description, setDescription,
    onSubmit, submitting, theme,
  }: CreateAdModalProps) {
    const s = makeStyles(theme);
    return (
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={s.sheet}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={s.sheetTitle}>Novo Anúncio</Text>

              <Text style={s.fieldLabel}>Foto do Item</Text>
              <TouchableOpacity style={s.imagePicker} onPress={onPickImage} activeOpacity={0.8}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={s.imagePickerPreview} resizeMode="contain" />
                ) : (
                  <View style={s.imagePickerPlaceholder}>
                    <Ionicons name="camera-outline" size={32} color={theme.textDim} />
                    <Text style={s.imagePickerText}>Toque para escolher uma foto</Text>
                  </View>
                )}
              </TouchableOpacity>
              {photoUri ? (
                <TouchableOpacity style={s.removePhotoBtn} onPress={onPickImage}>
                  <Ionicons name="refresh-outline" size={14} color={theme.textLabel} />
                  <Text style={s.removePhotoBtnText}>Trocar foto</Text>
                </TouchableOpacity>
              ) : null}

              <Text style={s.fieldLabel}>Título *</Text>
              <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="Ex: Computador Gamer" placeholderTextColor={theme.textDim} />

              <Text style={s.fieldLabel}>Preço *</Text>
              <TextInput style={s.input} value={price} onChangeText={setPrice} placeholder="Ex: 3500" keyboardType="numeric" placeholderTextColor={theme.textDim} />

              <Text style={s.fieldLabel}>Tag *</Text>
              <TextInput style={s.input} value={tag} onChangeText={setTag} placeholder="Ex: Eletrônicos, Móveis" placeholderTextColor={theme.textDim} />

              <Text style={s.fieldLabel}>Descrição *</Text>
              <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={description} onChangeText={setDescription} placeholder="Descreva o estado do item..." multiline placeholderTextColor={theme.textDim} />

              <TouchableOpacity style={[s.saveBtn, submitting && { opacity: 0.7 }]} onPress={onSubmit} disabled={submitting}>
                {submitting ? <ActivityIndicator color={theme.accentText} /> : <Text style={s.saveBtnText}>Publicar Anúncio</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={s.cancelBtn} onPress={onClose} disabled={submitting}>
                <Text style={s.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  // ── Estilos dinâmicos ─────────────────────────────────────────────────────────
  function makeStyles(t: Theme) {
    return StyleSheet.create({
      container:              { flex: 1, backgroundColor: t.bg },
      topBar:                 { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 56 : 44, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: t.bgTopBar, borderBottomWidth: 1, borderBottomColor: t.border },
      appName:                { color: t.accent, fontSize: 20, fontWeight: '800' },
      backBtn:                { flexDirection: 'row', alignItems: 'center', gap: 6 },
      backBtnText:            { color: t.accent, fontSize: 16, fontWeight: '600' },
      topRight:               { flexDirection: 'row', alignItems: 'center', gap: 12 },
      logoutBtn:              { width: 36, height: 36, borderRadius: 10, backgroundColor: t.bgInput, alignItems: 'center', justifyContent: 'center' },
      avatarButton:           { position: 'relative' },
      avatarImg:              { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: t.accent },
      avatarBadge:            { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: t.avatarBadge, borderWidth: 1.5, borderColor: t.bgTopBar },
      backdrop:               { ...StyleSheet.absoluteFillObject, backgroundColor: t.backdrop },
      sheet:                  { backgroundColor: t.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 20, width: '100%', maxHeight: '90%' },
      sheetTitle:             { color: t.text, fontSize: 22, fontWeight: '700', marginBottom: 20 },
      profileInfoRow:         { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
      profileAvatar:          { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: t.accent },
      profileName:            { color: t.text, fontSize: 18, fontWeight: '700' },
      profileId:              { color: t.textDim, fontSize: 13, marginTop: 2 },
      divider:                { height: 1, backgroundColor: t.border, marginVertical: 16 },
      themeRow:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
      themeRowLeft:           { flexDirection: 'row', alignItems: 'center', gap: 10 },
      themeLabel:             { color: t.text, fontSize: 16, fontWeight: '500' },
      fieldLabel:             { color: t.textLabel, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
      input:                  { backgroundColor: t.bgInput, borderRadius: 10, borderWidth: 1, borderColor: t.borderInput, color: t.text, fontSize: 16, padding: 12, marginBottom: 20 },
      saveBtn:                { backgroundColor: t.accent, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 10 },
      saveBtnText:            { color: t.accentText, fontWeight: '800', fontSize: 15 },
      cancelBtn:              { alignItems: 'center', paddingVertical: 14 },
      cancelBtnText:          { color: t.textDim, fontSize: 14 },
      listHeader:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
      listTitle:              { color: t.text, fontSize: 18, fontWeight: '700' },
      listCount:              { color: t.textDim, fontSize: 13 },
      listContent:            { paddingHorizontal: 16, paddingBottom: 80, gap: 12 },
      card:                   { backgroundColor: t.bgCard, borderRadius: 16, borderWidth: 1, borderColor: t.border, overflow: 'hidden', flexDirection: 'row', height: 110 },
      cardImage:              { width: 110, height: 110, backgroundColor: t.bgInput },
      cardBody:               { flex: 1, padding: 14, justifyContent: 'space-between' },
      cardTag:                { color: t.textDim, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
      cardTitle:              { color: t.text, fontSize: 14, fontWeight: '600' },
      cardFooter:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
      cardPrice:              { color: t.accent, fontSize: 15, fontWeight: '800' },
      cardSellerRow:          { flexDirection: 'row', alignItems: 'center', gap: 4 },
      cardSellerName:         { color: t.textDim, fontSize: 11 },
      // Detalhe
      detailScroll:           { paddingBottom: 60 },
      detailHero:             { flexDirection: 'row', margin: 16, gap: 14, alignItems: 'flex-start' },
      detailImageBox:         { width: '42%', aspectRatio: 3 / 4, borderRadius: 14, overflow: 'hidden', backgroundColor: t.bgInput },
      detailImage:            { width: '100%', height: '100%' },
      detailSide:             { flex: 1, paddingTop: 2 },
      detailTag:              { color: t.textDim, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
      detailTitle:            { color: t.text, fontSize: 16, fontWeight: '700', lineHeight: 22, marginBottom: 10 },
      detailPrice:            { color: t.accent, fontSize: 22, fontWeight: '800', marginBottom: 14 },
      detailDividerThin:      { height: 1, backgroundColor: t.border, marginBottom: 14 },
      detailSellerRow:        { flexDirection: 'row', alignItems: 'center', gap: 10 },
      detailAvatar:           { width: 36, height: 36, borderRadius: 18, backgroundColor: t.bgInput, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
      detailAvatarText:       { color: t.accent, fontSize: 15, fontWeight: '700' },
      detailSellerLabel:      { color: t.textDim, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
      detailSellerName:       { color: t.text, fontSize: 13, fontWeight: '600' },
      detailDescSection:      { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 },
      detailDesc:             { color: t.textMuted, fontSize: 15, lineHeight: 24, marginTop: 8 },
      // Comentários
      commentsSection:        { paddingHorizontal: 16, paddingTop: 16 },
      commentsSectionHeader:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
      commentsSectionTitle:   { color: t.text, fontSize: 17, fontWeight: '700' },
      commentsCount:          { backgroundColor: t.bgInput, color: t.textDim, fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
      commentInputRow:        { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 20 },
      commentInputWrap:       { flex: 1, backgroundColor: t.bgInput, borderRadius: 12, borderWidth: 1, borderColor: t.borderInput },
      commentInput:           { color: t.text, fontSize: 14, paddingHorizontal: 14, paddingVertical: 10, maxHeight: 100 },
      commentSendBtn:         { width: 42, height: 42, borderRadius: 12, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' },
      commentSendBtnDisabled: { opacity: 0.4 },
      commentsEmpty:          { alignItems: 'center', paddingVertical: 30, gap: 8 },
      commentsEmptyText:      { color: t.textDim, fontSize: 14 },
      commentCard:            { flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'flex-start' },
      commentAvatar:          { width: 34, height: 34, borderRadius: 17, backgroundColor: t.bgInput, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
      commentAvatarText:      { color: t.accent, fontSize: 13, fontWeight: '700' },
      commentBody:            { flex: 1, backgroundColor: t.bgCard, borderRadius: 12, borderWidth: 1, borderColor: t.border, padding: 12 },
      commentAuthor:          { color: t.text, fontSize: 13, fontWeight: '700', marginBottom: 4 },
      commentContent:         { color: t.textMuted, fontSize: 14, lineHeight: 20 },
      // FAB
      fab:                    { position: 'absolute', right: 20, bottom: 20, backgroundColor: t.accent, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6 },
      // Image picker
      imagePicker:            { width: '100%', height: 130, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: t.borderInput, marginBottom: 8, backgroundColor: t.bgInput },
      imagePickerPreview:     { width: '100%', height: '100%' },
      imagePickerPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
      imagePickerText:        { color: t.textDim, fontSize: 13 },
      removePhotoBtn:         { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 },
      removePhotoBtnText:     { color: t.textLabel, fontSize: 12 },
      // Empty state
      emptyBox:               { alignItems: 'center', paddingTop: 60, gap: 8 },
      emptyText:              { color: t.textDim, fontSize: 16, fontWeight: '600' },
      emptySubText:           { color: t.emptyIcon, fontSize: 13 },
    });
  }