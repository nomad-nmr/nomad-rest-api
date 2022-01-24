const express = require('express')
const multer = require('multer')
const path = require('path')
const { access, mkdir } = require('fs/promises')

const dataControllers = require('../controllers/data')

const router = express.Router()

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const { group, datasetName } = req.body
    const datastoreRootPath = process.env.DATASTORE_PATH ? process.env.DATASTORE_PATH : 'data'
    const storagePath = path.join(datastoreRootPath, group, datasetName)
    try {
      await access(storagePath)
    } catch {
      console.log('Path does not exists')
      await mkdir(storagePath, { recursive: true })
    }
    req.body.path = storagePath
    cb(null, storagePath)
  },
  filename: (req, file, cb) => {
    const { datasetName, expNo } = req.body
    cb(null, datasetName + '-' + expNo + '.zip')
  }
})

const upload = multer({ storage })

router.post('/auto', upload.single('nmrData'), dataControllers.postData)

module.exports = router
