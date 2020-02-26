const routeErrorHandler = (error) => {
	return {
		message: error.message
	}
}

module.exports = {
	routeErrorHandler
}