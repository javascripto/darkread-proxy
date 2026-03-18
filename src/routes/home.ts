import { Request, Response } from 'express';
import { HttpStatus } from '../http-status';

export function homeHandler(req: Request, res: Response): void {
  const qs = req.url.slice(req.path.length);
  res.redirect(HttpStatus.MovedPermanently, `/darkread${qs}`);
}
