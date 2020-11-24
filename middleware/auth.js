const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
	const token = req.query.auth
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		if (decoded) {
			const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
			if (!user) {
				throw new Error()
			}
			req.user = user
			req.token = token
			next()
		}
	} catch (error) {
		const user = await User.findOne({ 'tokens.token': token })
		if (user) {
			user.removeAuthToken(token)
		}
		res.status(401).send({ error: 'Please authenticate.' })
	}
}

module.exports = auth
