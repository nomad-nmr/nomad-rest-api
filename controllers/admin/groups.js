const { validationResult } = require('express-validator')

const Group = require('../../models/group')

exports.getGroups = async (req, res) => {
	//setting search parameters according to showInactive settings
	const searchParams = { isActive: true }
	if (req.query.showInactive === 'true') {
		delete searchParams.isActive
	}

	try {
		const groups = await Group.find(searchParams).sort({ groupName: 'asc' })
		if (!groups) {
			res.status(404).send()
		}

		if (req.query.list === 'true') {
			const groupList = groups.map(grp => {
				return { name: grp.groupName, id: grp._id }
			})
			return res.send(groupList)
		}

		//Calculation of numbers of users in each group
		const resGroupsObj = await Promise.all(
			groups.map(async grp => {
				const usersCounts = await grp.getUserCounts()
				return { ...grp._doc, ...usersCounts }
			})
		)

		res.send(resGroupsObj)
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
}

exports.addGroup = async (req, res) => {
	const { groupName, description } = req.body
	const errors = validationResult(req)
	try {
		if (!errors.isEmpty()) {
			return res.status(422).send(errors)
		}
		const group = new Group({ groupName: groupName.toLowerCase(), description })
		const newGroup = await group.save()
		res.status(201).send(newGroup)
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
}

exports.updateGroup = async (req, res) => {
	try {
		const group = await Group.findByIdAndUpdate(req.body._id, req.body)
		if (!group) {
			res.status(404).send()
		}

		if (!group.isActive) {
			group.setUsersInactive()
		}

		const usersCounts = await group.getUserCounts()
		res.send({ ...group._doc, ...usersCounts })
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
}

exports.toggleActive = async (req, res) => {
	try {
		const group = await Group.findById(req.params.groupId)
		if (!group) {
			res.status(404).send()
		}

		group.isActive = !group.isActive

		if (!group.isActive) {
			group.setUsersInactive()
		}

		const updatedGroup = await group.save()
		res.status(200).send({ message: 'Group active status updated successfully', _id: updatedGroup._id })
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
}
