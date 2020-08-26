const express = require('express')

const router = express.Router()

router.get('/ping', (req, res) => {
	res.send('OK')
})

router.post('/status', (req, res) => {
	console.log(req.body)
	res.send('Status object received OK')
})

module.exports = router
