const csv = require('csv-parser')
const fs = require('fs')
const path = require('path');

class CollegeModel {
	static async loadColleges() {
		return new Promise((resolve, reject) => {
			const results = [];
			fs.createReadStream(path.join(__dirname, '../colleges.csv'))
				.pipe(csv())
				.on('data', (data) => results.push(data))
				.on('end', () => {
					resolve(results);
				})
				.on('error', (error) => {
					reject(error);
				});
		})
	}

	static async getAllColleges(req, h) {
		try {
			const colleges = await CollegeModel.loadColleges();
			return {
				colleges
			};
		} catch (error) {
			return h.response({
				statusCode: 500,
				error: 'Internal Server Error',
				message: 'An internal server error occurred'
			}).code(500);
		}
	}

	static async getCollege(req, h) {
		try {
			const { name } = req.query;
	
			if (!name) {
				return h.response({
					statusCode: 400,
					error: 'College name is required',
					message: 'Error: College name is required'
				}).code(400);
			}
	
			const colleges = await CollegeModel.loadColleges();
			const college = colleges.find(college => college.College === name);
	
			if(!college) {
				return h.response({
					statusCode: 404,
					error: 'College not found',
					message: 'Error: College not found'
				}).code(404);
			}
			
			return {
				college
			};
		} catch (error) {
			return h.response({
				statusCode: 500,
				error: 'Internal Server Error',
				message: 'An internal server error occurred'
			}).code(500);
		}
	}

	static async getCollegeCost(req, h) {
		try {
			const { name, outOfState, roomAndBoard } = req.query;
	
			if (!name) {
				return h.response({
					statusCode: 400,
					error: 'College name is required',
					message: 'Error: College name is required'
				}).code(400);
			}
	
			const colleges = await CollegeModel.loadColleges();
			const college = colleges.find(college => college.College === name);
	
			if(!college) {
				return h.response({
					statusCode: 404,
					error: 'College not found',
					message: 'Error: College not found'
				}).code(404);
			}
	
			let totalCost = 0;
	
			if(roomAndBoard) {
				const roomAndBoardCost = parseFloat(college['Room & Board']);
				totalCost += (isNaN(roomAndBoardCost) ? 0 : roomAndBoardCost);
			}
	
			if (outOfState) {
				const outOfStateCost = parseFloat(college['Tuition (out-of-state)']);
				totalCost += isNaN(outOfStateCost) ? 0 : outOfStateCost;
			} else {
				const inStateCost = parseFloat(college['Tuition (in-state)']);
				totalCost += isNaN(inStateCost) ? 0 : inStateCost;
			}
			
			return {
				cost: parseFloat(totalCost)
			};
		} catch (error) {
			return h.response({
				statusCode: 500,
				error: 'Internal Server Error',
				message: 'An internal server error occurred'
			}).code(500);
		}
	}
}

module.exports = CollegeModel;