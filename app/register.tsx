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
  ScrollView,
} from 'react-native';
import { useRef, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';

export default function RegisterScreen() {
  const { registerUser } = useAuth();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  function validate() {
    if (!user.trim()) {
      return 'Informe seu nome.';
    }

    if (password.length < 6) {
      return 'A senha deve ter no mínimo 6 caracteres.';
    }

    if (password !== confirm) {
      return 'As senhas não coincidem.';
    }

    return null;
  }

  async function handleRegister() {
    setError('');

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      await registerUser(user, password);

      router.replace('/login');
    } catch (error) {
      setError('Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.inner,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: slideAnim,
                },
              ],
            },
          ]}
        >
          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#888"
            />
          </TouchableOpacity>

          {/* Brand */}
          <View style={styles.brand}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>
                ✦
              </Text>
            </View>

            <Text style={styles.appName}>
              NOME DO APP
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>
              Criar conta
            </Text>

            <Text style={styles.subtitle}>
              Preencha os dados abaixo para
              começar
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={15}
                  color="#ff6b6b"
                />

                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Nome */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Nome
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Seu nome completo"
                placeholderTextColor="#555"
                value={user}
                onChangeText={setUser}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>

            {/* Senha */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Senha
              </Text>

              <View style={styles.inputRow}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      flex: 1,
                      marginBottom: 0,
                      borderWidth: 0,
                    },
                  ]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#555"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoComplete="new-password"
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowPass((v) => !v)
                  }
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={
                      showPass
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={20}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmar senha */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Confirmar senha
              </Text>

              <View style={styles.inputRow}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      flex: 1,
                      marginBottom: 0,
                      borderWidth: 0,
                    },
                  ]}
                  placeholder="Repita a senha"
                  placeholderTextColor="#555"
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showConfirm}
                  autoComplete="new-password"
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowConfirm((v) => !v)
                  }
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={
                      showConfirm
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={20}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password strength */}
            {password.length > 0 && (
              <View style={styles.strengthRow}>
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthBar,
                      {
                        backgroundColor:
                          password.length >=
                          i * 3
                            ? password.length >=
                              10
                              ? '#4ade80'
                              : '#e8ff47'
                            : '#2a2a2a',
                      },
                    ]}
                  />
                ))}

                <Text
                  style={styles.strengthLabel}
                >
                  {password.length < 6
                    ? 'Fraca'
                    : password.length < 10
                    ? 'Média'
                    : 'Forte'}
                </Text>
              </View>
            )}

            {/* Botão */}
            <TouchableOpacity
              style={styles.btn}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#0a0a0a" />
              ) : (
                <Text style={styles.btnText}>
                  Criar conta
                </Text>
              )}
            </TouchableOpacity>

            {/* Link login */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.linkRow}
            >
              <Text style={styles.linkText}>
                Já tem conta?{' '}
                <Text
                  style={styles.linkHighlight}
                >
                  Entrar
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },

  inner: {
    paddingHorizontal: 24,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },

  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#e8ff47',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoText: {
    fontSize: 18,
    color: '#0a0a0a',
  },

  appName: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 5,
    color: '#fff',
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
    letterSpacing: -0.5,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    color: '#555',
    marginBottom: 24,
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

  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    marginTop: -8,
  },

  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },

  strengthLabel: {
    fontSize: 11,
    color: '#888',
    marginLeft: 4,
    width: 36,
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