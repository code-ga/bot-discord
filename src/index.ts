import path from 'path'
import dotenv from 'dotenv'
import {Client} from 'discord.js'
import {allIntents} from './constant'
import { CommandHandler } from './handler/command'
import mongoose from "mongoose";
import { AfkHandler } from './handler/afk';
dotenv.config({
	path: path.join(__dirname, '..', '.env'),
})

const client = new Client({
	intents: allIntents,
})

const Command = new CommandHandler(
	path.join(__dirname, 'command'),
	client,
	process.env.PREFIX || '!',
	true
)
const afk = new AfkHandler(client)

client.on('ready', async (client) => {
	await Command.init()
	await afk.init()

	if (!process.env.MONGODB_URI) {
		throw new Error('MONGODB_URI is not set')
	}
	await mongoose.connect(process.env.MONGODB_URI, {})
	console.log(`Logged in as ${client.user.tag}!`)
})

client.login(process.env.DISCORD_TOKEN)
