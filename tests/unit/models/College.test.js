const CollegeModel = require('../../../models/College');

const mockColleges = [
	{
		name: 'Adelphi University',
		inStateTuition: 38657,
		outOfStateTuition: 0,
		roomAndBoard: 15527
	},
	{
		name: 'Agnes Scott College',
		inStateTuition: 54007,
		outOfStateTuition: 0,
		roomAndBoard: 12449
	},
	{
		name: 'Albany College of Pharmacy',
		inStateTuition: 34154,
		outOfStateTuition: 0,
		roomAndBoard: 11274
	},
	{
		name: 'A Fake College',
		inStateTuition: 54007.87,
		outOfStateTuition: 34154.54,
		roomAndBoard: 11274.43
	}
];

let mockResponseInstance;
let mockHInstance;
let mockReq;

beforeEach(() => {
	function mockResponse() {}
	mockResponse.prototype.code = jest.fn();

	mockResponseInstance = new mockResponse();

	function mockH() {}
	mockH.prototype.response = jest.fn().mockReturnValue(mockResponseInstance);
	mockHInstance = new mockH();

	mockReq = {
		query: {
			name: 'Adelphi University',
			outOfState: true,
			roomAndBoard: true
		}
	};
});

describe('CollegeModel', () => {
	describe('collegeNameRequiredResponse', () => {
		it('sets correct response', () => {
			CollegeModel.collegeNameRequiredResponse(mockHInstance);

			expect(mockHInstance.response).toHaveBeenCalled();
			expect(mockHInstance.response).toHaveBeenCalledTimes(1);
			expect(mockHInstance.response).toHaveBeenNthCalledWith(1, {
				statusCode: 400,
				error: 'College name is required',
				message: 'Error: College name is required'
			});

			expect(mockResponseInstance.code).toHaveBeenCalled();
			expect(mockResponseInstance.code).toHaveBeenCalledTimes(1);
			expect(mockResponseInstance.code).toHaveBeenNthCalledWith(1, 400);
		});
	});

	describe('collegeNotFoundResponse', () => {
		it('sets correct response', () => {
			CollegeModel.collegeNotFoundResponse(mockHInstance);

			expect(mockHInstance.response).toHaveBeenCalled();
			expect(mockHInstance.response).toHaveBeenCalledTimes(1);
			expect(mockHInstance.response).toHaveBeenNthCalledWith(1, {
				statusCode: 404,
				error: 'College not found',
				message: 'Error: College not found'
			});

			expect(mockResponseInstance.code).toHaveBeenCalled();
			expect(mockResponseInstance.code).toHaveBeenCalledTimes(1);
			expect(mockResponseInstance.code).toHaveBeenNthCalledWith(1, 404);
		});
	});

	describe('internalServerErrorResponse', () => {
		it('sets correct response', () => {
			CollegeModel.internalServerErrorResponse(mockHInstance);

			expect(mockHInstance.response).toHaveBeenCalled();
			expect(mockHInstance.response).toHaveBeenCalledTimes(1);
			expect(mockHInstance.response).toHaveBeenNthCalledWith(1, {
				statusCode: 500,
				error: 'Internal Server Error',
				message: 'An internal server error occurred'
			});

			expect(mockResponseInstance.code).toHaveBeenCalled();
			expect(mockResponseInstance.code).toHaveBeenCalledTimes(1);
			expect(mockResponseInstance.code).toHaveBeenNthCalledWith(1, 500);
		});
	});

	describe('loadCollege', () => {
		it('calls loadColleges', async () => {
			CollegeModel.loadColleges = jest.fn().mockResolvedValue(mockColleges);

			const name = 'A Fake College';

			await CollegeModel.loadCollege(mockHInstance, name);

			expect(CollegeModel.loadColleges).toHaveBeenCalled();
			expect(CollegeModel.loadColleges).toHaveBeenCalledTimes(1);
		});

		it('handles unfound college', async () => {
			CollegeModel.loadColleges = jest.fn().mockResolvedValue(mockColleges);

			const original = CollegeModel.collegeNotFoundResponse;
			CollegeModel.collegeNotFoundResponse = jest.fn();

			const name = 'Some College';

			await CollegeModel.loadCollege(mockHInstance, name);

			expect(CollegeModel.collegeNotFoundResponse).toHaveBeenCalled();
			expect(CollegeModel.collegeNotFoundResponse).toHaveBeenCalledTimes(1);

			CollegeModel.collegeNotFoundResponse = original;
		});

		it('returns college correctly', async () => {
			CollegeModel.loadColleges = jest.fn().mockResolvedValue(mockColleges);

			const name = 'A Fake College';

			const college = await CollegeModel.loadCollege(mockHInstance, name);

			expect(college).toEqual({
				name: 'A Fake College',
				inStateTuition: 54007.87,
				outOfStateTuition: 34154.54,
				roomAndBoard: 11274.43
			});
		});
	});

	describe('getAllColleges', () => {
		it('calls loadColleges', async () => {
			CollegeModel.loadColleges = jest.fn().mockResolvedValue(mockColleges);

			await CollegeModel.getAllColleges(mockReq, mockHInstance);

			expect(CollegeModel.loadColleges).toHaveBeenCalled();
			expect(CollegeModel.loadColleges).toHaveBeenCalledTimes(1);
		});
		
		it('returns colleges', async () => {
			CollegeModel.loadColleges = jest.fn().mockResolvedValue(mockColleges);

			const result = await CollegeModel.getAllColleges(mockReq, mockHInstance);

			expect(result).toEqual({ colleges: mockColleges });
		});
		
		it('handles errors', async () => {
			CollegeModel.loadColleges = jest.fn().mockRejectedValue('ERROR');

			const original = CollegeModel.internalServerErrorResponse;
			CollegeModel.internalServerErrorResponse = jest.fn();

			await CollegeModel.getAllColleges(mockReq, mockHInstance);

			expect(CollegeModel.internalServerErrorResponse).toHaveBeenCalled();
			expect(CollegeModel.internalServerErrorResponse).toHaveBeenCalledTimes(1);

			CollegeModel.internalServerErrorResponse = original;
		});
	});
	
	describe('getCollege', () => {
		it('handles missing name', async () => {
			CollegeModel.loadColleges = jest.fn().mockResolvedValue(mockColleges);

			const original = CollegeModel.collegeNameRequiredResponse;
			CollegeModel.collegeNameRequiredResponse = jest.fn();

			mockReq.query.name = '';

			await CollegeModel.getCollege(mockReq, mockHInstance);

			expect(CollegeModel.collegeNameRequiredResponse).toHaveBeenCalled();
			expect(CollegeModel.collegeNameRequiredResponse).toHaveBeenCalledTimes(1);

			CollegeModel.collegeNameRequiredResponse = original;
		});

		it('calls loadCollege', async () => {
			const original = CollegeModel.loadCollege;
			CollegeModel.loadCollege = jest.fn();

			mockReq.query.name = 'A Fake College';

			await CollegeModel.getCollege(mockReq, mockHInstance);

			expect(CollegeModel.loadCollege).toHaveBeenCalled();
			expect(CollegeModel.loadCollege).toHaveBeenCalledTimes(1);
			expect(CollegeModel.loadCollege).toHaveBeenNthCalledWith(1, {}, 'A Fake College');

			CollegeModel.loadCollege = original;
		});

		it('correctly returns college', async () => {
			CollegeModel.loadColleges = jest.fn().mockResolvedValue(mockColleges);

			mockReq.query.name = 'A Fake College';

			const result = await CollegeModel.getCollege(mockReq, mockHInstance);
			expect(result.college).toEqual({
				name: 'A Fake College',
				inStateTuition: 54007.87,
				outOfStateTuition: 34154.54,
				roomAndBoard: 11274.43
			});
		});
		
		it('handles errors', async () => {
			CollegeModel.loadColleges = jest.fn().mockRejectedValue('ERROR');

			const original = CollegeModel.internalServerErrorResponse;
			CollegeModel.internalServerErrorResponse = jest.fn();

			await CollegeModel.getCollege(mockReq, mockHInstance);

			expect(CollegeModel.internalServerErrorResponse).toHaveBeenCalled();
			expect(CollegeModel.internalServerErrorResponse).toHaveBeenCalledTimes(1);

			CollegeModel.internalServerErrorResponse = original;
		});
	});
	
	describe('getCollegeCost', () => {
		it('handles missing name', async () => {
			CollegeModel.loadColleges = jest.fn().mockResolvedValue(mockColleges);

			const original = CollegeModel.collegeNameRequiredResponse;
			CollegeModel.collegeNameRequiredResponse = jest.fn();

			mockReq.query.name = '';

			await CollegeModel.getCollegeCost(mockReq, mockHInstance);

			expect(CollegeModel.collegeNameRequiredResponse).toHaveBeenCalled();
			expect(CollegeModel.collegeNameRequiredResponse).toHaveBeenCalledTimes(1);

			CollegeModel.collegeNameRequiredResponse = original;
		});

		it('calls loadCollege', async () => {
			const original = CollegeModel.loadCollege;
			CollegeModel.loadCollege = jest.fn();

			mockReq.query.name = 'A Fake College';

			await CollegeModel.getCollegeCost(mockReq, mockHInstance);

			expect(CollegeModel.loadCollege).toHaveBeenCalled();
			expect(CollegeModel.loadCollege).toHaveBeenCalledTimes(1);
			expect(CollegeModel.loadCollege).toHaveBeenNthCalledWith(1, {}, 'A Fake College');

			CollegeModel.loadCollege = original;
		});

		it('correctly calculates out-of-state', async () => {
			CollegeModel.loadColleges = jest.fn().mockResolvedValue(mockColleges);

			mockReq.query.name = 'A Fake College';
			mockReq.query.outOfState = true;
			mockReq.query.roomAndBoard = false;

			const result = await CollegeModel.getCollegeCost(mockReq, mockHInstance);
			expect(result.cost).toBe(34154.54);
		})

		it('correctly calculates out-of-state + room & board tuition', async () => {
			CollegeModel.loadColleges = jest.fn().mockResolvedValue(mockColleges);

			mockReq.query.name = 'A Fake College';
			mockReq.query.outOfState = true;
			mockReq.query.roomAndBoard = true;

			const result = await CollegeModel.getCollegeCost(mockReq, mockHInstance);
			expect(result.cost).toBe(45428.97);
		});

		it('correctly calculates in-state', async () => {
			CollegeModel.loadColleges = jest.fn().mockResolvedValue(mockColleges);

			mockReq.query.name = 'A Fake College';
			mockReq.query.outOfState = false;
			mockReq.query.roomAndBoard = false;

			const result = await CollegeModel.getCollegeCost(mockReq, mockHInstance);
			expect(result.cost).toBe(54007.87);
		});

		it('correctly calculates in-state + room & board tuition', async () => {
			CollegeModel.loadColleges = jest.fn().mockResolvedValue(mockColleges);

			mockReq.query.name = 'A Fake College';
			mockReq.query.outOfState = false;
			mockReq.query.roomAndBoard = true;

			const result = await CollegeModel.getCollegeCost(mockReq, mockHInstance);
			expect(result.cost).toBe(65282.3);
		});
		
		it('handles errors', async () => {
			CollegeModel.loadColleges = jest.fn().mockRejectedValue('ERROR');

			const original = CollegeModel.internalServerErrorResponse;
			CollegeModel.internalServerErrorResponse = jest.fn();

			await CollegeModel.getCollegeCost(mockReq, mockHInstance);

			expect(CollegeModel.internalServerErrorResponse).toHaveBeenCalled();
			expect(CollegeModel.internalServerErrorResponse).toHaveBeenCalledTimes(1);

			CollegeModel.internalServerErrorResponse = original;
		});
	});
});