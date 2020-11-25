const User = require('../models/user')
const bcrypt = require('bcryptjs')

exports.postLogin = async (req, res) => {
	try {
		const user = await User.findOne({ username: req.body.username })
		if (!user) {
			return res.status(400).send({ message: 'Wrong username or password' })
		}
		const passMatch = await bcrypt.compare(req.body.password, user.password)
		if (!passMatch) {
			return res.status(400).send({ message: 'Wrong username or password' })
		}
		const token = await user.generateAuthToken()
		return res.send({
			username: user.username,
			accessLevel: user.accessLevel,
			token: token,
			expiresIn: process.env.JWT_EXPIRATION
		})
	} catch (error) {
		res.status(500).send()
		console.log(error)
	}
}

exports.postLogout = async (req, res) => {
	req.user.removeAuthToken(req.token)
	res.send()
}

exports.postUser = async (req, res) => {
	const { username, password, accessLevel } = req.body
	const hashedPasswd = await bcrypt.hash(password, 12)
	const newUser = {
		username,
		password: hashedPasswd,
		email: username + '@' + process.env.EMAIL_SUFFIX,
		accessLevel
	}
	try {
		const user = new User(newUser)
		await user.save()
		res.send()
	} catch (error) {
		res.status(500).send(error)
	}
}
