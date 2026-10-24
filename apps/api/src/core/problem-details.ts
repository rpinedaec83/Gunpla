import { Request, Response } from 'express';
import { ProblemDetails } from '@gunpla/shared';

export function sendProblem(
  req: Request,
  res: Response,
  status: number,
  title: string,
  detail: string,
  typeSlug = 'error',
  invalidParams?: Array<{ name: string; reason: string }>
): Response {
  const problem: ProblemDetails = {
    type: `https://api.plamoscale.com/problems/${typeSlug}`,
    title,
    status,
    detail,
    instance: req.originalUrl || req.url,
    ...(invalidParams ? { invalidParams } : {})
  };

  return res
    .status(status)
    .setHeader('Content-Type', 'application/problem+json')
    .json(problem);
}
