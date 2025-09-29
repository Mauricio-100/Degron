// cli.js
import { Command } from 'commander';
import { io } from 'socket.io-client';
import readline from 'readline';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig } from './config.js';

const program = new Command();
const config = getConfig();

// Commande pour configurer l'URL du serveur
program
  .command('config <key> <value>')
  .description('Configurer les paramètres du CLI de Dragon (ex: drn config server_url http://mon-serveur.com)')
  .action((key, value) => {
    setConfig(key, value);
    console.log(chalk.green(`Configuration mise à jour: ${key} = ${value}`));
  });

// Commande par défaut : le shell interactif
program.action(() => {
  const SERVER_URL = config.server_url;
  const spinner = ora(`Connexion à Dragon sur ${SERVER_URL}...`).start();
  const socket = io(SERVER_URL);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  socket.on('connect', () => {
    spinner.succeed(chalk.green('Connecté. Vous pouvez parler à Dragon.'));
    rl.prompt();
  });

  socket.on('connect_error', () => {
    spinner.fail(chalk.red(`Erreur: Impossible de se connecter au cerveau de Dragon à ${SERVER_URL}`));
    process.exit(1);
  });

  // Écouter les instructions du serveur
  socket.on('server_instruction', (instruction) => {
    const { action, payload } = instruction;
    const color = payload.color || 'white';
    
    // Effacer la ligne actuelle pour que le message du serveur s'affiche proprement
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);

    console.log(chalk[color](payload.text));
    rl.prompt();
  });
  
  // Gérer la déconnexion
  socket.on('disconnect', () => {
    console.log(chalk.yellow('Déconnecté du serveur de Dragon.'));
    process.exit(0);
  });

  // Gérer l'invite de commande
  rl.setPrompt(chalk.magenta('🐉 > '));
  rl.on('line', (line) => {
    if (line.trim()) {
      socket.emit('user_prompt', line.trim());
    }
    rl.prompt();
  });
});

program.parse(process.argv);
