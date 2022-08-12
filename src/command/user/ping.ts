import {
	CacheType,
	ChatInputCommandInteraction,
	Client,
	Message,
} from 'discord.js'
import {BaseCommand} from '../../class/Command'

export default class PingCommand extends BaseCommand {
	constructor(
		client: Client,
		prefix: string,
		slash = true,
		Commands: Map<string, BaseCommand>
	) {
		super({
			client,
			prefix,
			slash,
			name: 'ping',
			description: 'Ping',
			usage: 'ping',
			aliases: ['p'],
			category: 'general',
			coolDown: 0,
			guildOnly: false,
			ownerOnly: false,
			permissions: [],
			Commands,
		})
	}
	async HandleMessage(message: Message) {
		message.channel.send(await this.getPing())
	}
	async HandleInteractionCommand(
		interaction: ChatInputCommandInteraction<CacheType>
	) {
		interaction.reply(await this.getPing())
	}
	async getPing() {
		return `Pong! ${this.client.ws.ping}ms`
	}
}
