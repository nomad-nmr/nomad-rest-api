const mongoose = require('mongoose')
const Schema = mongoose.Schema

const rackSchema = new Schema({
	title: {
		type: String,
		required: true,
		trim: true
	},
	group: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'Group'
	},
	isOpen: {
		type: Boolean,
		required: true,
		default: true
	},
	samples: [
		{
			slot: {
				type: Number,
				required: true
			},
			user: {
				type: Schema.Types.ObjectId,
				required: true,
				ref: 'User'
			},
			solvent: {
				type: String,
				required: true
			},
			title: {
				type: String,
				required: true
			},
			experiments: [
				{
					type: Schema.Types.ObjectId,
					ref: 'Experiment'
				}
			],
			addedAt: Date,
			instrument: {
				type: Schema.Types.ObjectId,
				ref: 'Instrument'
			},
			holder: Number,
			status: String
		}
	]
})

module.exports = mongoose.model('Rack', rackSchema)
