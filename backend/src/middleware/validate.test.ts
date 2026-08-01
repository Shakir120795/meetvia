import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validate } from './validate';

describe('validate middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockReq = { body: {} };
    mockRes = { status: statusMock } as any;
    mockNext = jest.fn();
  });

  const testSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
  });

  it('should call next() when validation passes', () => {
    mockReq.body = { name: 'John', email: 'john@example.com' };

    validate(testSchema)(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('should return 400 with error details when validation fails', () => {
    mockReq.body = { name: '', email: 'invalid' };

    validate(testSchema)(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: expect.any(String),
        field: expect.any(String),
        code: 'VALIDATION_ERROR',
      },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return the first error field when multiple fields fail', () => {
    mockReq.body = {};

    validate(testSchema)(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
        }),
      })
    );
  });
});
