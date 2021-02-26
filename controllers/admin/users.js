const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')

const User = require('../../models/user')
const Group = require('../../models/group')

const formatDate = require('../../utils/formatDate')

exports.getUsers = async (req, res) => {
	//setting search parameters according to showInactive settings
	const searchParams = { isActive: true }
	if (req.query.showInactive === 'true') {
		delete searchParams.isActive
	}
	try {
		const users = await User.find(searchParams, '-tokens -password').populate('group')

		if (!users) {
			res.status(404).send()
		}

		const usersArr = users.map(user => {
			const lastLogin = formatDate(user._doc.lastLogin)
			// new Date(user._doc.lastLogin).toLocaleString('en-GB', {
			// 	day: '2-digit',
			// 	month: 'short',
			// 	year: '2-digit',
			// 	hour: '2-digit',
			// 	minute: '2-digit'
			// })
			const inactiveDays = Math.floor(
				(new Date() - Date.parse(user._doc.lastLogin)) / (1000 * 60 * 60 * 24)
			)

			const newUser = {
				...user._doc,
				lastLogin: lastLogin !== 'Invalid Date' ? lastLogin : '-',
				inactiveDays: inactiveDays.toString() !== 'NaN' ? inactiveDays : '-'
			}

			return newUser
		})
		res.send(usersArr)
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
		res.status(201).send({ ...user._doc, lastLogin: formatDate(user.lastLogin) })
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
