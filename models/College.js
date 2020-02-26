const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

class CollegeModel {
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
		const name = data['College'];
		const inStateTuition = parseFloat(data['Tuition (in-state)']);
		const outOfStateTuition = parseFloat(data['Tuition (out-of-state)']);
		const roomAndBoard = parseFloat(data['Room & Board']);
		return {
			name,
			inStateTuition: (isNaN(inStateTuition) ? 0 : inStateTuition),
			outOfStateTuition: (isNaN(outOfStateTuition) ? 0 : outOfStateTuition),
			roomAndBoard: (isNaN(roomAndBoard) ? 0 : roomAndBoard)
		};
	}

	static async loadColleges() {
		return new Promise((resolve, reject) => {
			const results = [];
			fs.createReadStream(path.join(__dirname, '../colleges.csv'))
				.pipe(csv())
				.on('data', (data) => results.push(CollegeModel.mapData(data)))
				.on('end', () => {
					resolve(results);
				})
				.on('error', (error) => {
					reject(error);
				});
		});
	}

	static async loadCollege(h, name) {
		const colleges = await CollegeModel.loadColleges();
		const college = colleges.find(college => college.name === name);

		if(!college) {
			return CollegeModel.collegeNotFoundResponse(h);
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
			return CollegeModel.internalServerErrorResponse(h);
		}
	}

	static async getCollege(req, h) {
		try {
			const { name } = req.query;
	
			if (!name) {
				return CollegeModel.collegeNameRequiredResponse(h);
			}
	
			const college = await CollegeModel.loadCollege(h, name);
			
			return {
				college
			};
		} catch (error) {
			return CollegeModel.internalServerErrorResponse(h);
		}
	}

	static async getCollegeCost(req, h) {
		try {
			const { name, outOfState, roomAndBoard } = req.query;
	
			if (!name) {
				return CollegeModel.collegeNameRequiredResponse(h);
			}

			const college = await CollegeModel.loadCollege(h, name);
	
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
			return CollegeModel.internalServerErrorResponse(h);
		}
	}
}

module.exports = CollegeModel;