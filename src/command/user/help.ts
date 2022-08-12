import { Client, Message, SlashCommandBuilder ,EmbedBuilder} from "discord.js";
import { BaseCommand } from "../../class/Command";

export default class HelpCommand extends BaseCommand{
    constructor(client: Client, prefix: string, slash = true, Commands: Map<string, BaseCommand>){
        super({
            client,
            prefix,
            slash,
            name: 'help',
            description: 'Help',
            usage: 'help [command]',
            aliases: ['h'],
            category: 'general',
            coolDown: 0,
            guildOnly: false,
            ownerOnly: false,
            permissions: [],
            Commands,
        })
    }
    SetOptions(slash: SlashCommandBuilder): SlashCommandBuilder {
        slash.addStringOption((option) =>
            option.setName('command').setRequired(false).setDescription('Command')
        )
        return slash
    }
    async HandleMessage(message: Message<boolean>, args: string[]): unknown {
        if (args.length < 1){

        }
    }
    GetHelpForAllCommand(){
        return new EmbedBuilder
    }
}