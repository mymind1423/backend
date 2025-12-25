import os from 'os';

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const BASE_URL = process.env.APP_BASE_URL || `http://${getLocalIp()}:5000`;

export function buildFileUrl(folder, filename) {
  return `${BASE_URL}/uploads/${folder}/${filename}`;
}
