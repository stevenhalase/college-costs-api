const Joi = require('@hapi/joi');

const ResponseModels = require('../models/Response');
const CollegeModel = require('../models/College');

module.exports = [
	{
		method: 'GET',
		path: '/api/v1/colleges',
		options: {
			auth: false,
			description: 'Get Colleges.',
			tags: ['api', 'colleges'],
			handler: CollegeModel.getAllColleges,
			response: {
				status: {
					200: ResponseModels.collegesResponseModel,
					500: ResponseModels.error500ResponseModel
				}
			}
		}
	},
	{
		method: 'GET',
		path: '/api/v1/colleges/details',
		options: {
			auth: false,
			description: 'Get College Details.',
			tags: ['api', 'colleges'],
			handler: CollegeModel.getCollege,
			validate: {
				query: {
					name: Joi.string()
						.description('College Name')
				}
			},
			response: {
				status: {
					200: ResponseModels.collegeResponseModel,
					400: ResponseModels.error400ResponseModel,
					404: ResponseModels.error404ResponseModel,
					500: ResponseModels.error500ResponseModel
				}
			}
		}
	},
	{
		method: 'GET',
		path: '/api/v1/colleges/cost',
		options: {
			auth: false,
			description: 'Get College Cost.',
			tags: ['api', 'colleges'],
			handler: CollegeModel.getCollegeCost,
			validate: {
				query: {
					name: Joi.string()
						.description('College Name'),
					outOfState: Joi.boolean()
						.default(true)
						.description('Out of State'),
					roomAndBoard: Joi.boolean()
						.default(true)
						.description('Room And Board')
				}
			},
			response: {
				status: {
					200: ResponseModels.collegeCostResponseModel,
					400: ResponseModels.error400ResponseModel,
					404: ResponseModels.error404ResponseModel,
					500: ResponseModels.error500ResponseModel
				}
			}
		}
	}
]