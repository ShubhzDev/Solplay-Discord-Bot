import { Collection } from 'discord.js';
import { unoCommand } from './unoCommand';
import { playCommand } from './playCommand';

const commands = new Collection();
commands.set(unoCommand.data.name, unoCommand);
commands.set(playCommand.data.name, playCommand);

export { commands };