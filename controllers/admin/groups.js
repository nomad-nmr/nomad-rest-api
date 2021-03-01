const { validationResult } = require('express-validator')

const Group = require('../../models/group')
const User = require('../../models/user')
const formatDate = require('../../utils/formatDate')

exports.getGroups = async (req, res) => {
	//setting search parameters according to showInactive settings
	const searchParams = { isActive: true }
	if (req.query.showInactive === 'true') {
		delete searchParams.isActive
	}

	try {
		const groups = await Group.find(searchParams)
		if (!groups) {
			res.status(404).send()
		}

		if (req.query.list === 'true') {
			const groupList = groups.map(grp => grp.groupName)
			return res.send(groupList)
		}

		//Calculation of numbers of users in each group
		const resGroupsObj = await Promise.all(
			groups.map(async grp => {
				const usersCounts = await getUserCounts(grp._id)
				return { ...grp._doc, ...usersCounts, createdAt: formatDate(grp.createdAt) }
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
		await group.save()
		res.status(201).send({ ...group._doc, createdAt: formatDate(group.createdAt) })
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
		res.send({ ...group._doc, createdAt: formatDate(group.createdAt) })
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
		const updatedGroup = await group.save()
		res.status(200).send({ message: 'Group active status updated successfully', _id: updatedGroup._id })
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
}

//Helper function that counts total and active users in a group
const getUserCounts = async groupId => {
	const totalUserCount = await User.find({ group: groupId }).countDocuments()
	const activeUserCount = await User.find({ group: groupId, isActive: true }).countDocuments()
	return {
		totalUserCount,
		activeUserCount
	}
}
