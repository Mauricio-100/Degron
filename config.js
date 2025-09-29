// config.js
import fs from 'fs';
import path from 'path';

const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.dragon', 'config.json');

function getConfig() {
  if (fs.existsSync(configPath)) {
    const data = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(data);
  }
  // Configuration par défaut si le fichier n'existe pas
  return { server_url: "http://localhost:3000" }; 
}

function setConfig(key, value) {
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const config = getConfig();
  config[key] = value;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export { getConfig, setConfig };
