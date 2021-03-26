const mongoose = require('mongoose')
const Schema = mongoose.Schema

const parameterSetSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true
		},
		description: String,
		count: {
			type: Number,
			required: true,
			default: 0
		},
		availableOn: [
			{
				instrument: {
					name: String,
					id: { type: Schema.Types.ObjectId, ref: 'Instrument' }
				}
			}
		],
		defaultParams: {
			type: Array,
			required: true,
			default: [
				{ name: 'ns', value: null },
				{ name: 'd1', value: null },
				{ name: 'ds', value: null },
				{ name: 'td1', value: null },
				{ name: 'expt', value: null }
			]
		},
		customParams: [{ name: String, comment: String, value: String }]
	},
	{ timestamps: true }
)

module.exports = mongoose.model('ParameterSet', parameterSetSchema)
