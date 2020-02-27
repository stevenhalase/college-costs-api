const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const {
	MissingNameError,
	NotFoundError,
	InternalServerError
} = require('../errors');

class CollegeModel {
	static handleError(h, error) {
		switch(true) {
			case error instanceof MissingNameError:
				return CollegeModel.collegeNameRequiredResponse(h);
			case error instanceof NotFoundError:
				return CollegeModel.collegeNotFoundResponse(h);
			default:
				return CollegeModel.internalServerErrorResponse(h);
		}
	}

	static collegeNameRequiredResponse(h) {
		return h.response({
			statusCode: 400,
			error: 'College name is required',
			message: 'Error: College name is required'
		}).code(400);
	}

	static collegeNotFoundResponse(h) {
		return h.response({
			statusCode: 404,
			error: 'College not found',
			message: 'Error: College not found'
		}).code(404);
	}

	static internalServerErrorResponse(h) {
		return h.response({
			statusCode: 500,
			error: 'Internal Server Error',
			message: 'An internal server error occurred'
		}).code(500);
	}

	static mapData(data) {
		let mappedData = null;
		if (data) {
			const name = data['College'];
			const inStateTuition = parseFloat(data['Tuition (in-state)']);
			const outOfStateTuition = parseFloat(data['Tuition (out-of-state)']);
			const roomAndBoard = parseFloat(data['Room & Board']);
			mappedData = {
				name,
				inStateTuition: (isNaN(inStateTuition) ? 0 : inStateTuition),
				outOfStateTuition: (isNaN(outOfStateTuition) ? 0 : outOfStateTuition),
				roomAndBoard: (isNaN(roomAndBoard) ? 0 : roomAndBoard)
			};
		}
		return mappedData;
	}

	static async loadColleges() {
		return new Promise((resolve, reject) => {
			const results = [];
			fs.createReadStream(path.join(__dirname, '../colleges.csv'))
				.pipe(csv())
				.on('data', (data) => {
					const mappedData = CollegeModel.mapData(data);
					if (mappedData) {
						results.push(mappedData);
					}
				})
				.on('end', () => {
					resolve(results);
				})
				.on('error', (error) => {
					reject(error);
				});
		});
	}

	static async loadCollege(name) {
		const colleges = await CollegeModel.loadColleges();
		const college = colleges.find(college => college.name === name);
		
		if(!college) {
			throw new NotFoundError();
		}

		return college;
	}

	static async getAllColleges(req, h) {
		try {
			const colleges = await CollegeModel.loadColleges();
			return {
				colleges
			};
		} catch (error) {
			return CollegeModel.handleError(h, error);
		}
	}

	static async getCollege(req, h) {
		try {
			const { name } = req.query;
	
			if (!name) {
				throw new MissingNameError();
			}
	
			const college = await CollegeModel.loadCollege(name);
			
			return {
				college
			};
		} catch (error) {
			return CollegeModel.handleError(h, error);
		}
	}

	static async getCollegeCost(req, h) {
		try {
			const { name, outOfState, roomAndBoard } = req.query;
	
			if (!name) {
				throw new MissingNameError();
			}

			const college = await CollegeModel.loadCollege(name);
	
			let totalCost = 0;
	
			if(roomAndBoard) {
				totalCost += college.roomAndBoard;
			}
	
			if (outOfState) {
				totalCost += college.outOfStateTuition;
			} else {
				totalCost += college.inStateTuition;
			}
			
			return {
				cost: parseFloat(totalCost)
			};
		} catch (error) {
			return CollegeModel.handleError(h, error);
		}
	}
}

module.exports = CollegeModel;