import {Client} from 'discord.js'
import fs from 'fs'
import path from 'path'
import {BaseCommand} from '../class/Command'

export class CommandHandler {
	Commands: Map<string, BaseCommand>
	Aliases: Map<string, string>
	constructor(
		public readonly path: string,
		public readonly client: Client,
		public readonly prefix: string,
		public readonly slash: boolean = true
	) {
		this.Commands = new Map<string, BaseCommand>()
		this.Aliases = new Map<string, string>()
	}
	async init() {
		const files = await this.getFiles(this.path)
		for (const file of files) {
			const command = await import(file)
			const commandClass = command.default || command
			const commandInstance: BaseCommand = new commandClass(
				this.client,
				this.prefix,
				this.slash,
				this.Commands
			)
			await commandInstance.init()
			this.Commands.set(commandInstance.input.name, commandInstance)
			for (const alias of commandInstance.input.aliases) {
				this.Aliases.set(alias, commandInstance.input.name)
			}
		}
		if (this.slash) {
			const allSlashCommand = Array.from(this.Commands.values()).filter(
				(c) => c.input.slash
			)
			// set slash command
			this.client.application?.commands.set(
				allSlashCommand.map((c) => c.SlashConfig)
			)
		}

		await this.AddEvent()
	}
	async getFiles(dir: string) {
		return await this.ScanDirectory(dir)
	}
	async ScanDirectory(dir: string) {
		const result: string[] = []
		const files = await fs.promises.readdir(dir, {withFileTypes: true})
		for (const file of files) {
			if (file.isDirectory()) {
				const files = await this.ScanDirectory(path.join(dir, file.name))
				result.push(...files)
			} else {
				result.push(path.join(dir, file.name))
			}
		}
		return result
	}
	async AddEvent() {
		this.client.on('messageCreate', async (message) => {
			if (message.author.bot) return

			if (message.content.startsWith(this.prefix)) {
				const args = message.content
					.trim()
					.slice(this.prefix.length)
					.split(/ +/)
				const command = args.shift()?.toLowerCase()
				if (!command) return
				const commandInstance =
					this.Commands.get(command) ||
					this.Commands.get(this.Aliases.get(command) || '')
				if (commandInstance) {
					if (await commandInstance.BeforeHandelMessage(message, args)) {
						await commandInstance.HandleMessage(message, args)
						await commandInstance.HandleMessageDone(message, args)
					}
				}
			}
		})
		this.client.on('interactionCreate', async (interaction) => {
			if (!interaction.isChatInputCommand()) return
			const commandName = interaction.commandName
			const commandInstance = this.Commands.get(commandName)
			if (commandInstance) {
				if (await commandInstance.BeforeHandleInteractionCommand(interaction)) {
					await commandInstance.HandleInteractionCommand(interaction)
					await commandInstance.HandleInteractionCommandDone(interaction)
				}
			}
		})
	}
}
