const bcrypt = require('bcryptjs')

const Group = require('../../models/group')
const User = require('../../models/user')
const Experiment = require('../../models/experiment')
const ParameterSet = require('../../models/parameterSet')

const runningExperiments = require('./runningExperiments')

// helper function that updated automatically DB if group, user or parameter set has not been stored yet (auto-feed)
// & updates exp history every time when experiment stops running (ie. status is changed from "running" to "completed" or "error" )
//It takes as argument reformated statusTable and historyTable and instrument in form og object {name, id}

const expHistAutoFeed = async (instrument, statusTable, historyTable) => {
	try {
		//getting runningExpState from DB if undefined
		if (!runningExperiments.state) {
			await runningExperiments.getState()
		}

		let histItem = runningExperiments.update(instrument.id, statusTable)

		if (histItem) {
			const rawHistItemObj = historyTable.find(
				entry => entry.datasetName === histItem.datasetName && entry.expNo === histItem.expNo
			)

			const statusEntry = statusTable.find(
				entry => entry.datasetName === histItem.datasetName && entry.expNo === histItem.expNo
			)

			const status = statusEntry ? statusEntry.status : 'Unknown'
			const expTime = statusEntry ? statusEntry.time : 'Unknown'

			if (rawHistItemObj) {
				//AUTO-FEED for group
				let group = await Group.findOne({ groupName: rawHistItemObj.group })
				if (!group) {
					const newGroup = new Group({ groupName: rawHistItemObj.group.toLowerCase() })
					group = await newGroup.save()
					console.log(`AUTO-FEED: New group ${group.groupName} was created`)
				}

				//AUTO-FEED for user
				let user = await User.findOne({ username: rawHistItemObj.username.toLowerCase() })
				if (!user) {
					const password = await bcrypt.hash(Math.random().toString(), 12)
					const newUser = new User({
						username: rawHistItemObj.username.toLowerCase(),
						group: group._id,
						email: rawHistItemObj.username + '@' + process.env.EMAIL_SUFFIX,
						password
					})
					user = await newUser.save()
					console.log(`New user ${user.username} at group ${group.groupName} was created`)
				}

				//AUTO-FEED for parameter set
				const parameterSet = await ParameterSet.findOne({ name: rawHistItemObj.parameterSet })
				if (!parameterSet) {
					const newParameterSet = new ParameterSet({
						name: rawHistItemObj.parameterSet,
						count: 1,
						availableOn: [instrument.id]
					})
					await newParameterSet.save()
					console.log(`AUTO-FEED: New parameter set ${newParameterSet.name} was created`)
				} else {
					const instr = parameterSet.availableOn.find(id => id.toString() === instrument.id.toString())
					if (!instr) {
						parameterSet.availableOn.push(instrument.id)
					}
					parameterSet.count++
					await parameterSet.save()
				}

				histItem = {
					...rawHistItemObj,
					expId: rawHistItemObj.datasetName + '-' + rawHistItemObj.expNo,
					status,
					expTime,
					finishedAt: new Date(),
					instrument,
					group: { name: group.groupName, id: group._id },
					user: { username: user.username, id: user._id }
				}
				const experiment = new Experiment(histItem)
				await experiment.save()
			}
		}

		//the following block update remarks to the experiment if they appear in history table in later update of the status file
		if (historyTable[0] && historyTable[0].remarks) {
			const { datasetName, expNo, remarks } = historyTable[0]
			await Experiment.findOneAndUpdate({ datasetName, expNo }, { remarks })
		}

		return Promise.resolve()
	} catch (error) {
		return Promise.reject(error)
	}
}

module.exports = expHistAutoFeed