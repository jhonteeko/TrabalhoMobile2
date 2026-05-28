import { Redirect } from "expo-router";
import { useState } from "react";
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";


import { useAuth } from "../../context/authContext";
 
export default function Home() {
  const { user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [editName, setEditName] = useState(user?.username ?? "");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
 
  if (!user) {
    return <Redirect href="/login" />;
  }
 
  const handleSave = () => {
    setProfileOpen(false);
  };

   const pickImage = async () => {
    // Solicita permissão para acessar a galeria
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
 
    if (status !== "granted") {
      Alert.alert(
        "Permissão negada",
        "Precisamos de acesso à sua galeria para alterar a foto de perfil.",
        [{ text: "OK" }]
      );
      return;
    }
 
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,   // abre o crop circular/quadrado
      aspect: [1, 1],        // força proporção quadrada
      quality: 0.8,
    });
 
    if (!result.canceled && result.assets.length > 0) {
      setProfilePhoto(result.assets[0].uri);
    }
  };
 
  const avatarSource = profilePhoto
    ? { uri: profilePhoto }
    : require("../../assets/images/userDefaultIcon.jpeg");
 
  return (
    <View style={styles.container}>
      {/* ── TOP BAR ── */}
      <View style={styles.topBar}>
        <Text style={styles.appName}>MyApp</Text>
 
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => setProfileOpen(true)}
          activeOpacity={0.8}
        >
          <Image source={avatarSource} style={styles.avatarImg} />
          <View style={styles.avatarBadge} />
        </TouchableOpacity>
      </View>
 
      {/* ── CONTENT ── */}
      <View style={styles.content}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.text}>Usuário:</Text>
        <Text style={styles.value}>{user.username}</Text>
        <Text style={styles.text}>Senha:</Text>
        <Text style={styles.value}>{user.password}</Text>
      </View>
 
      {/*PROFILE MODAL*/}
      <Modal
        visible={profileOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setProfileOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setProfileOpen(false)} />
 
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.sheetWrapper}
        >
          <View style={styles.sheet}>
            {/* Handle */}
            <View style={styles.handle} />
 
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sheetTitle}>Perfil</Text>
 
              {/* Avatar section */}
              <View style={styles.avatarSection}>
                <Image source={avatarSource} style={styles.avatarLarge} />
                <TouchableOpacity style={styles.changePhotoBtn} activeOpacity={0.75}
                onPress={pickImage}>
                  <Text style={styles.changePhotoBtnText}>Alterar foto</Text>
                </TouchableOpacity>
              </View>
 
              {/* Fields */}
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
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
 
  /* ── TOP BAR ── */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 56 : 44,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: "#111",
    borderBottomWidth: 1,
    borderBottomColor: "#1e1e1e",
  },
  appName: {
    color: "#e8ff47",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1,
  },
  avatarButton: {
    position: "relative",
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#e8ff47",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4cff72",
    borderWidth: 1.5,
    borderColor: "#111",
  },
 
  /* ── CONTENT ── */
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
  },
  text: {
    color: "#888",
    fontSize: 16,
    marginTop: 10,
  },
  value: {
    color: "#e8ff47",
    fontSize: 22,
    fontWeight: "bold",
  },
 
  /* ── MODAL / SHEET ── */
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheetWrapper: {
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#141414",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
    paddingTop: 12,
    maxHeight: "85%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#333",
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
  },
 
  /* Avatar */
  avatarSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#e8ff47",
    marginBottom: 12,
  },
  changePhotoBtn: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e8ff47",
  },
  changePhotoBtnText: {
    color: "#e8ff47",
    fontSize: 13,
    fontWeight: "600",
  },
 
  /* Fields */
  label: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    color: "#fff",
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
 
  /* Buttons */
  saveBtn: {
    backgroundColor: "#e8ff47",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
    marginTop: 4,
  },
  saveBtnText: {
    color: "#0a0a0a",
    fontWeight: "800",
    fontSize: 15,
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  cancelBtnText: {
    color: "#555",
    fontSize: 14,
  },
});