const mongoose = require('mongoose')
const Schema = mongoose.Schema

const groupSchema = new Schema(
	{
		groupName: {
			type: String,
			required: true,
			default: 'default',
			unique: true
		},

		description: String,

		isActive: {
			type: Boolean,
			required: true,
			default: true
		}
	},
	{ timestamps: true }
)

module.exports = mongoose.model('Group', groupSchema)
