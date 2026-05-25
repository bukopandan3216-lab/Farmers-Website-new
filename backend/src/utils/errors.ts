class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const createError = (
  statusCode: number,
  message: string,
  errors?: Record<string, string[]>
): ApiError => {
  return new ApiError(statusCode, message, errors);
};

export default ApiError;
