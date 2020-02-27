class MissingNameError extends Error {};
class NotFoundError extends Error {};
class InternalServerError extends Error {};

module.exports = {
	MissingNameError,
	NotFoundError,
	InternalServerError
};