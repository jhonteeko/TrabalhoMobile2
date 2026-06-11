import { Platform } from 'react-native';

const DEV_IP = 'localhost'; // <- TROQUE PELO SEU IP LOCAL

const DEV_URL = Platform.select({
  web: 'http://localhost:3000',        // Navegador: localhost funciona
  default: `http://${DEV_IP}:3000`,    // iOS físico / Android / Expo Go
});

export const API_URL = __DEV__
  ? DEV_URL
  : 'https://sua-api-em-producao.com'; // <- URL de produção futuramente
