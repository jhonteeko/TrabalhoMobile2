import { Platform } from 'react-native';

const DEV_IP = '192.168.0.114'; // Substitua pelo IP do seu computador na rede local

const DEV_URL = Platform.select({
  web: 'http://localhost:3000',
  default: `http://${DEV_IP}:3000`,
});

export const API_URL = __DEV__
  ? DEV_URL
  : 'https:';
