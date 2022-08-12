import {
	ApplicationCommandData,
	CacheType,
	ChatInputCommandInteraction,
	Client,
	EmbedBuilder,
	Message,
	PermissionResolvable,
	PermissionsBitField,
	SlashCommandBuilder,
} from 'discord.js'

interface BaseCommandInput {
	readonly client: Client
	readonly prefix: string
	readonly slash: boolean
	readonly name: string
	readonly description: string
	readonly usage: string
	readonly aliases: string[]
	readonly category: string
	readonly coolDown: number
	readonly guildOnly: boolean
	readonly ownerOnly: boolean
	readonly permissions: PermissionResolvable[]
	Commands: Map<string, BaseCommand>
}

export abstract class BaseCommand {
	coolDownList: Map<string, number>
	input: BaseCommandInput
	slash: boolean
	client: Client<boolean>
	prefix: string
	Commands: Map<string, BaseCommand>
	constructor(input: BaseCommandInput) {
		this.coolDownList = new Map()
		this.input = input
		this.slash = input.slash
		this.client = input.client
		this.prefix = input.prefix
		this.Commands = input.Commands
	}
	async init() {
		console.log(`Init command ${this.input.name}`)
	}
	HandleMessage(
		_message: Message,
		_args: string[]
	): Promise<unknown> | unknown {
		return null
	}
	async BeforeHandelMessage(message: Message, _args: string[]) {
		if (this.input.guildOnly && !message.guild) {
			message.reply('This command is only available in guilds.')
			return false
		}
		if (!this.CheckCommandTimeOut(message.author.id)) {
			message.reply(
				`You can use this command again in ${
					this.input.coolDown -
					Math.floor(
						Date.now() - (this.coolDownList.get(message.author.id) || 0)
					) /
						1000
				} seconds`
			)
			return false
		}
		if (!this.CheckPermission(message.member?.permissions)) {
			message.reply("You don't have permission to use this command.")
			return false
		}

		return true
	}
	async HandleMessageDone(message: Message, _args: string[]) {
		if (this.input.coolDown > 0) {
			this.SetCommandTimeOut(message.author.id)
		}
	}
	CheckPermission(permissionObj: Readonly<PermissionsBitField> | undefined) {
		for (const permission of this.input.permissions) {
			if (!permissionObj?.has(permission)) {
				return false
			}
		}
		return true
	}
	SetCommandTimeOut(UserId: string) {
		if (this.input.coolDown > 0) {
			this.coolDownList.set(UserId, Date.now() + this.input.coolDown * 1000)
			setTimeout(() => {
				this.coolDownList.delete(UserId)
			}, this.input.coolDown * 1000)
		}
	}
	CheckCommandTimeOut(UserId: string) {
		if (this.input.coolDown > 0) {
			const coolDown = this.coolDownList.get(UserId)
			if (coolDown) {
				const now = Date.now()
				const diff = (now - coolDown) / 1000
				if (diff < this.input.coolDown) {
					return false
				}
			}
		}
		return true
	}
	async BeforeHandleInteractionCommand(
		interaction: ChatInputCommandInteraction<CacheType>
	) {
		if (this.input.guildOnly && !interaction.guild) {
			interaction.reply('This command is only available in guilds.')
			return false
		}
		if (!this.CheckCommandTimeOut(interaction.user.id)) {
			interaction.reply(
				`You can use this command again in ${
					this.input.coolDown -
					Math.floor(
						Date.now() - (this.coolDownList.get(interaction.user.id) || 0)
					) /
						1000
				} seconds`
			)
			return false
		}
		return true
	}
	async HandleInteractionCommandDone(
		interaction: ChatInputCommandInteraction<CacheType>
	) {
		if (this.input.coolDown > 0) {
			this.SetCommandTimeOut(interaction.user.id)
		}
	}
	HandleInteractionCommand(
		_interaction: ChatInputCommandInteraction<CacheType>
	): Promise<unknown> | unknown {
		return null
	}

	public get SlashConfig(): ApplicationCommandData {
		let slash = new SlashCommandBuilder()
			.setName(this.input.name)
			.setDescription(this.input.description)
		slash = this.SetOptions(slash)
		return {
			...slash.toJSON(),
			defaultMemberPermissions: this.input.permissions,
		}
	}
	SetOptions(slash: SlashCommandBuilder) {
		return slash
	}
	async getHelpEmbed() {
		return new EmbedBuilder()
			.setTitle(this.input.name)
			.setDescription(this.input.description)
			.setFooter({
				text: `Prefix: ${this.prefix}`,
			})
			.setTimestamp()
			.setFields([
				{
					name: 'Usage',
					value: this.input.usage,
				},
			])
	}
}
