import { type NextFunction, type Request, type Response } from 'express';

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status = err instanceof HttpError ? err.status : 500;
  const message =
    err instanceof HttpError
      ? err.message
      : 'Something went wrong. Please try again.';

  if (status >= 500) {
    console.error('Unhandled server error', err);
  }

  res.status(status).json({ message });
}

