const formatDate = timeStamp =>
	new Date(timeStamp).toLocaleString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	})

module.exports = formatDate
