const CollegeModel = require('../../../models/College');

const mockColleges = [
	{
		'College': 'Adelphi University',
		'Tuition (in-state)': '38657',
		'Tuition (out-of-state)': '',
		'Room & Board': '15527'
	},
	{
		'College': 'Agnes Scott�College',
		'Tuition (in-state)': '54007',
		'Tuition (out-of-state)': '',
		'Room & Board': '12449'
	},
	{
		'College': 'Albany College of Pharmacy',
		'Tuition (in-state)': '34154',
		'Tuition (out-of-state)': '',
		'Room & Board': '11274'
	},
	{
		'College': 'A Fake College',
		'Tuition (in-state)': '54007.87',
		'Tuition (out-of-state)': '34154.54',
		'Room & Board': '11274.43'
	}
];

let mockResponseInstance;
let mockHInstance;
let mockReq;

beforeEach(() => {
	function mockResponse() {};
	mockResponse.prototype.code = jest.fn();

	mockResponseInstance = new mockResponse();

	function mockH() {};
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

		it('calls loadColleges', async () => {
			CollegeModel.loadColleges = jest.fn().mockResolvedValue(mockColleges);

			await CollegeModel.getCollege(mockReq, mockHInstance);

			expect(CollegeModel.loadColleges).toHaveBeenCalled();
			expect(CollegeModel.loadColleges).toHaveBeenCalledTimes(1);
		});

		it('handles unfound college', async () => {
			CollegeModel.loadColleges = jest.fn().mockResolvedValue(mockColleges);

			const original = CollegeModel.collegeNotFoundResponse;
			CollegeModel.collegeNotFoundResponse = jest.fn();

			mockReq.query.name = 'Some College';

			await CollegeModel.getCollege(mockReq, mockHInstance);

			expect(CollegeModel.collegeNotFoundResponse).toHaveBeenCalled();
			expect(CollegeModel.collegeNotFoundResponse).toHaveBeenCalledTimes(1);

			CollegeModel.collegeNotFoundResponse = original;
		});

		it('correctly returns college', async () => {
			CollegeModel.loadColleges = jest.fn().mockResolvedValue(mockColleges);

			mockReq.query.name = 'A Fake College';

			const result = await CollegeModel.getCollege(mockReq, mockHInstance);
			expect(result.college).toEqual({
				'College': 'A Fake College',
				'Tuition (in-state)': '54007.87',
				'Tuition (out-of-state)': '34154.54',
				'Room & Board': '11274.43'
			});
		})
		
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

		it('calls loadColleges', async () => {
			CollegeModel.loadColleges = jest.fn().mockResolvedValue(mockColleges);

			await CollegeModel.getCollegeCost(mockReq, mockHInstance);

			expect(CollegeModel.loadColleges).toHaveBeenCalled();
			expect(CollegeModel.loadColleges).toHaveBeenCalledTimes(1);
		});

		it('handles unfound college', async () => {
			CollegeModel.loadColleges = jest.fn().mockResolvedValue(mockColleges);

			const original = CollegeModel.collegeNotFoundResponse;
			CollegeModel.collegeNotFoundResponse = jest.fn();

			mockReq.query.name = 'Some College';

			await CollegeModel.getCollegeCost(mockReq, mockHInstance);

			expect(CollegeModel.collegeNotFoundResponse).toHaveBeenCalled();
			expect(CollegeModel.collegeNotFoundResponse).toHaveBeenCalledTimes(1);

			CollegeModel.collegeNotFoundResponse = original;
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
		})

		it('correctly calculates in-state', async () => {
			CollegeModel.loadColleges = jest.fn().mockResolvedValue(mockColleges);

			mockReq.query.name = 'A Fake College';
			mockReq.query.outOfState = false;
			mockReq.query.roomAndBoard = false;

			const result = await CollegeModel.getCollegeCost(mockReq, mockHInstance);
			expect(result.cost).toBe(54007.87);
		})

		it('correctly calculates in-state + room & board tuition', async () => {
			CollegeModel.loadColleges = jest.fn().mockResolvedValue(mockColleges);

			mockReq.query.name = 'A Fake College';
			mockReq.query.outOfState = false;
			mockReq.query.roomAndBoard = true;

			const result = await CollegeModel.getCollegeCost(mockReq, mockHInstance);
			expect(result.cost).toBe(65282.3);
		})
		
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