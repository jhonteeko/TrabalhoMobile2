import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRef, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';

export default function LoginScreen() {
  const { user } = useAuth();
  const { loginUser } = useAuth();
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  async function handleLogin() {
    setError('');

    if(!username.trim()){
      setError('Digite o usuario');
      return;
    }
    if(!password.trim()){
      setError('Digite a senha');
      return;
    }

    try {
        setLoading(true);

        const success = await loginUser(username, password);

        if (!success) {
          setError('Usuario ou senha invalidos');
          return;
        }
        router.replace('/home');
    } catch (error) {
      setError('Erro ao entrar');
      
    } finally {
      setLoading (false);
    }
    
  }
  

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.bg} />

      <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Logo / Brand */}
        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>✦</Text>
          </View>
          <Text style={styles.appName}>NOME DO APP</Text>
          <Text style={styles.tagline}>Sua tagline aqui</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Entrar</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={15} color="#ff6b6b" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Usuario</Text>
            <TextInput
              style={styles.input}
              placeholder= {user?.username || "Usuario"}
              placeholderTextColor="#555"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="••••••••"
                placeholderTextColor="#555"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoComplete="password"
              />
              <TouchableOpacity onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleLogin} style={styles.btn} disabled={loading} activeOpacity={0.85}>
            {loading ? (
              <ActivityIndicator color="#0a0a0a" />
            ) : (
              <Text style={styles.btnText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/register')} style={styles.linkRow}>
            <Text style={styles.linkText}>
              Não tem conta?{' '}
              <Text style={styles.linkHighlight}>Criar agora</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0a0a',
  },
  inner: {
    paddingHorizontal: 24,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#e8ff47',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoText: {
    fontSize: 26,
    color: '#0a0a0a',
  },
  appName: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 6,
    color: '#fff',
    marginBottom: 6,
  },
  tagline: {
    fontSize: 13,
    color: '#555',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#141414',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: '#222',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1e0a0a',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3a1010',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 13,
    flex: 1,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingRight: 4,
  },
  eyeBtn: {
    padding: 10,
  },
  btn: {
    backgroundColor: '#e8ff47',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  btnText: {
    color: '#0a0a0a',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  linkRow: {
    alignItems: 'center',
  },
  linkText: {
    color: '#555',
    fontSize: 14,
  },
  linkHighlight: {
    color: '#e8ff47',
    fontWeight: '600',
  },
});
