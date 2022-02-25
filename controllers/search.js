const Experiment = require('../models/experiment')

exports.fetchExperiments = async (req, res) => {
  // const { userId } = req.query
  const excludeProps =
    '-remarks -status -load -atma -spin -lock -shim -proc -acq -createdAt -expTime -dataPath'
  const experiments = await Experiment.find(
    { 'user.id': req.user._id, status: 'Archived' },
    excludeProps
  )

  const datasets = []
  experiments.forEach(exp => {
    const datasetIndex = datasets.findIndex(dataSet => dataSet.datasetName === exp.datasetName)

    const expObj = {
      key: exp._id,
      datasetName: exp.datasetName,
      expNo: exp.expNo,
      parameterSet: exp.parameterSet,
      parameters: exp.parameters,
      title: exp.title,
      archivedAt: exp.updatedAt
    }

    if (datasetIndex < 0) {
      const newDataSet = {
        instrument: exp.instrument,
        user: exp.user,
        group: exp.group,
        datasetName: exp.datasetName,
        key: exp.datasetName,
        solvent: exp.solvent,
        title: exp.title.split('||')[0].trim(),
        submittedAt: exp.submittedAt,
        exps: [expObj]
      }
      datasets.push(newDataSet)
    } else {
      datasets[datasetIndex].exps.push(expObj)
    }
  })

  res.send(datasets)
}
