const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const publicDirectoryPath = path.join(__dirname, '..', 'nmr-control-dash', 'build')

const port = process.argv[2] ? process.argv[2] : 3000

app.use(express.static(publicDirectoryPath))

app.use(bodyParser.json({ strict: true, limit: '50mb' }))

//Point for client to check the server connection
app.get('/api/ping', (req, res) => {
	res.send('OK')
})

//Point for handling status file object
app.post('/api/status', (req, res) => {
	console.log(req.body)
	res.send('Status object received OK')
})

// Redirecting any requests that don't match with above to be handled by React router
app.use((req, res, next) => {
	res.sendFile(path.join(publicDirectoryPath, 'index.html'))
})

app.listen(port, () => {
	console.log(`Server is up on port ${port}`)
})
