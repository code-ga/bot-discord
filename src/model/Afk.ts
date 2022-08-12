import {modelOptions, prop, getModelForClass} from '@typegoose/typegoose'
@modelOptions({
	schemaOptions: {
		timestamps: true,
	},
})
export class Afk {
	@prop()
	message: string
	@prop()
	userId: string
}
export const afkModel = getModelForClass(Afk)
