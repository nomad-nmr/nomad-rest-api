const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('./user')

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

groupSchema.methods.setUsersInactive = async function () {
	const group = this
	const users = await User.find({ group: group._id })
	users.forEach(async user => {
		user.isActive = false
		await user.save()
	})
}

groupSchema.methods.getUserCounts = async function () {
	const totalUserCount = await User.find({ group: this._id }).countDocuments()
	const activeUserCount = await User.find({ group: this._id, isActive: true }).countDocuments()
	return {
		totalUserCount,
		activeUserCount
	}
}

module.exports = mongoose.model('Group', groupSchema)
