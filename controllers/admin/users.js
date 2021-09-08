const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const moment = require('moment')

const User = require('../../models/user')
const Group = require('../../models/group')

exports.getUsers = async (req, res) => {
	//setting search parameters according to showInactive settings
	const { showInactive, current, pageSize, accessLevel, group, username, lastLoginOrder } = req.query
	const searchParams = { $and: [{}] }

	if (showInactive === 'false') {
		searchParams.$and.push({ isActive: true })
	}

	if (accessLevel && accessLevel !== 'null') {
		const accessLevelArr = accessLevel.split(',')
		searchParams.$and.push({ $or: accessLevelArr.map(i => ({ accessLevel: i })) })
	}

	if (group && group !== 'null') {
		const groupArr = group.split(',')
		searchParams.$and.push({ $or: groupArr.map(i => ({ group: i })) })
	}

	if (username) {
		const regex = new RegExp(username, 'i')
		searchParams.$and.push({
			$or: [{ username: { $regex: regex } }, { fullName: { $regex: regex } }]
		})
	}

	const sorter =
		lastLoginOrder === 'ascend'
			? { lastLogin: 'ascending' }
			: lastLoginOrder === 'descend'
			? { lastLogin: 'descending' }
			: { username: 'ascending' }

	try {
		const total = await User.find(searchParams).countDocuments()
		const users = await User.find(searchParams, '-tokens -password')
			.skip((current - 1) * pageSize)
			.limit(+pageSize)
			.sort(sorter)
			.populate('group')

		if (!users) {
			res.status(404).send()
		}

		if (req.query.list === 'true') {
			const userList = users.map(usr => {
				return { username: usr.username, id: usr._id, fullName: usr.fullName }
			})
			return res.send(userList)
		}

		const usersArr = users.map(user => {
			const inactiveDays = moment().diff(moment(user._doc.lastLogin), 'days')
			// Math.floor(
			// 	(new Date() - Date.parse(user._doc.lastLogin)) / (1000 * 60 * 60 * 24)
			// )

			const newUser = {
				...user._doc,
				lastLogin: user._doc.lastLogin ? moment(user._doc.lastLogin).format('DD MMM YYYY, HH:mm') : '-',
				inactiveDays: user._doc.lastLogin ? moment().diff(moment(user._doc.lastLogin), 'days') : '-'
				// inactiveDays.toString() !== 'NaN' ? inactiveDays : '-'
			}

			return newUser
		})

		res.send({ users: usersArr, total })
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
}

exports.postUser = async (req, res) => {
	const { username, email, accessLevel, fullName, isActive, groupName } = req.body
	const errors = validationResult(req)

	try {
		if (!errors.isEmpty()) {
			return res.status(422).send(errors)
		}

		const hashedPasswd = await bcrypt.hash(Math.random().toString(), 12)
		const group = await Group.findOne({ groupName })

		if (!group) {
			throw new Error('Group does not exist')
		}

		const newUserObj = {
			username: username.toLowerCase(),
			fullName,
			password: hashedPasswd,
			email,
			accessLevel,
			group: group._id,
			isActive
		}

		const user = new User(newUserObj)
		const newUser = await user.save()
		await newUser.populate('group').execPopulate()
		delete newUser.password
		res.status(201).send(newUser)
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
}

exports.updateUser = async (req, res) => {
	const errors = validationResult(req)

	try {
		if (!errors.isEmpty()) {
			return res.status(422).send(errors)
		}

		const group = await Group.findOne({ groupName: req.body.groupName })
		if (!group) {
			throw new Error('Group does not exist')
		}

		const updatedUser = { ...req.body, group: group._id }

		const user = await User.findByIdAndUpdate(req.body._id, updatedUser).populate('group')
		if (!user) {
			return res.status(404).send()
		}
		delete user.password
		delete user.tokens
		const lastLogin = user._doc.lastLogin ? moment(user._doc.lastLogin).format('DD MMM YYYY, HH:mm') : '-'
		const inactiveDays = user._doc.lastLogin ? moment().diff(moment(user._doc.lastLogin), 'days') : '-'
		res.status(201).send({ ...user._doc, lastLogin, inactiveDays })
	} catch (error) {
		console.log(error)
		res.status(500).send()
	}
}

exports.toggleActive = async (req, res) => {
	try {
		const user = await User.findById(req.params.id)
		if (!user) {
			return res.status(404).send()
		}

		user.isActive = !user.isActive

		const updatedUser = await user.save()
		res.send({ message: 'User active status was updated', _id: updatedUser._id })
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
}
