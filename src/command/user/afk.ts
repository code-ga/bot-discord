import {
	Client,
	Message,
	ChatInputCommandInteraction,
	CacheType,
	SlashCommandBuilder,
} from 'discord.js'
import {BaseCommand} from '../../class/Command'
import {MessageReq} from '../../message/index'
import {afkModel} from '../../model/Afk'
export default class AfkCommand extends BaseCommand {
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
			name: 'afk',
			description: 'Afk',
			usage: 'afk',
			aliases: ['a'],
			category: 'general',
			coolDown: 0,
			guildOnly: false,
			ownerOnly: false,
			permissions: [],Commands
		})
	}
	async HandleMessage(message: Message, args: string[]) {
		const afk = await this.setAfk(args.join(' '), message.author.id)
		message.channel.send(await this.getAfk(afk.message))
	}
	async HandleInteractionCommand(
		interaction: ChatInputCommandInteraction<CacheType>
	) {
		const afk = await this.setAfk(
			interaction.options.getString('message', true),
			interaction.user.id
		)
		interaction.reply(await this.getAfk(afk.message))
	}
	async getAfk(message = '') {
		return MessageReq.SetAfKSuccess.replace('{message}', message)
	}
	async setAfk(message: string, userId: string) {
		const afk = new afkModel({
			message,
			userId: userId,
		})
		await afk.save()
		return afk
	}
	SetOptions(slash: SlashCommandBuilder) {
		slash.addStringOption((option) =>
			option.setName('message').setRequired(true).setDescription('Message')
		)
		return slash
	}
}
