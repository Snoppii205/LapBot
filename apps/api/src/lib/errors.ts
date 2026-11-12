export class AppError extends Error {
  statusCode: number;
  code: string;
  fieldErrors?: Record<string, string>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export const badRequest = (code: string, message: string) => new AppError(400, code, message);
export const conflict = (code: string, message: string) => new AppError(409, code, message);
export const notFound = (message = 'Không tìm thấy dữ liệu.') =>
  new AppError(404, 'NOT_FOUND', message);
