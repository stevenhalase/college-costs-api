const Joi = require('@hapi/joi');

const collegeModel = Joi.object({
	'College': Joi.any().example('Adelphi University'),
	'Tuition (in-state)': Joi.any().example('38657'),
	'Tuition (out-of-state)': Joi.any().example('34154'),
	'Room & Board': Joi.any().example('12449'),
}).label('College');

const collegeResponseModel = Joi.object({
	college: collegeModel
}).label('College Response');

const collegesResponseModel = Joi.object({
	colleges: Joi.array().items(collegeModel)
}).label('Colleges Response');

const collegeCostResponseModel = Joi.object({
	cost: Joi.number()
		.example(12345.34)
}).label('Cost Response');

const error400ResponseModel = Joi.object({
	statusCode: Joi.number()
		.example(400),
	error: Joi.string()
		.example('College name is required'),
	message: Joi.string()
		.example('Error: College name is required')
}).label('400 Response');

const error404ResponseModel = Joi.object({
	statusCode: Joi.number()
		.example(404),
	error: Joi.string()
		.example('College not found'),
	message: Joi.string()
		.example('Error: College not found')
}).label('404 Response');

const error500ResponseModel = Joi.object({
	statusCode: Joi.number()
		.example(500),
	error: Joi.string()
		.example('Internal Server Error'),
	message: Joi.string()
		.example('An internal server error occurred')
}).label('500 Response');

module.exports = {
	collegeResponseModel,
	collegesResponseModel,
    collegeCostResponseModel,
    error400ResponseModel,
    error404ResponseModel,
    error500ResponseModel
};