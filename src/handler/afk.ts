import {Client, Message} from 'discord.js'
import {afkModel} from '../model/Afk'
import {MessageReq} from '../message/index'

export class AfkHandler {
	constructor(public client: Client) {}
	async init() {
		this.AddEvent()
	}
	async AddEvent() {
		this.client.on('messageCreate', this.HandleMessage.bind(this))
	}
	async HandleMessage(message: Message) {
		if (message.author.bot) return
		if (await afkModel.findOne({userId: message.author.id})) {
			await afkModel.deleteMany({userId: message.author.id})
			message.channel.send(
				MessageReq.DeleteAfkSuccess.replace('{name}', message.author.username)
			)
		}
		for (const user of message.mentions.users.values()) {
			const afk = await afkModel.findOne({userId: user.id})
			console.log(afk)
			if (afk) {
				message.channel.send(`${user.username} is afk: ${afk.message}`)
			}
		}
	}
}
