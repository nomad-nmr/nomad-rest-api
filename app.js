const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const port = process.env.PORT || 3000
const app = express()

const User = require('./models/user')
const Group = require('./models/group')
const trackerRoutes = require('./routes/tracker')
const instrumentsRoutes = require('./routes/admin/insruments')
const dashRoutes = require('./routes/dashboard')
const authRoutes = require('./routes/auth')
const usersRoutes = require('./routes/admin/users')

app.use(bodyParser.json({ strict: true, limit: '50mb' }))

//Setting headers to allow CORS
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
	next()
})

app.use('/tracker', trackerRoutes)
app.use('/admin/instruments', instrumentsRoutes)
app.use('/dash', dashRoutes)
app.use('/auth', authRoutes)
app.use('/admin/users', usersRoutes)
app.use((req, res) => {
	res.status(404).send()
})

// Setting findByIdAndUpdate() to return updated document
// Default setting is true
mongoose.set('returnOriginal', false)

mongoose
	.connect(process.env.MONGODB_URL, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
		useFindAndModify: false
	})
	.then(async () => {
		console.log('DB connected')
		//CReating default group and admin user (TODO: refactor into utility function that can be used in tracker auto-feed )
		try {
			let group = await Group.findOne()

			if (!group) {
				group = new Group()
				await group.save()
			}

			const user = await User.findOne()
			if (!user) {
				const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
				const adminUser = new User({
					username: 'admin',
					password: hashedPassword,
					accessLevel: 'admin',
					email: 'admin@' + process.env.EMAIL_SUFFIX,
					group: group._id
				})
				await adminUser.save()
			}
			app.listen(port, () => {
				console.log(`Server is up on port ${port}`)
			})
		} catch (error) {
			console.log(error)
		}
	})
