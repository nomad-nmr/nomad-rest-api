const Experiment = require('../models/experiment')

exports.postData = async (req, res) => {
  const { datasetName, expNo, dataPath } = req.body
  try {
    const experiment = await Experiment.findOne({ expId: datasetName + '-' + expNo })
    if (!experiment) {
      throw new Error('Experiment not found in Database')
    }
    experiment.dataPath = dataPath
    experiment.status = 'Archived'
    experiment.save()
    if (!process.env.NODE_ENV === 'production') {
      console.log('data received', datasetName, expNo)
    }
    res.send()
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}
