//Middleware that can be used after general auth middleware to check admin accessLevel

const authAdmin = (req, res, next) => {
	if (req.user.accessLevel !== 'admin') {
		return res.status('403').send({ error: 'Please authenticate as user with admin access level' })
	}
	next()
}

module.exports = authAdmin
