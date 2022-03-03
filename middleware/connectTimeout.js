const connectTimeout = (req, res, next) => {
  req.connection.setTimeout(10000)
  next()
}

module.exports = connectTimeout
