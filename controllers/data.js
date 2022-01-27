exports.postData = (req, res) => {
  const { datasetName, path } = req.body
  console.log('data received', path)
  res.send()
}
