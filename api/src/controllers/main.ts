import { Request, Response, NextFunction } from 'express';

export const MainController = {
  // TODO: replace with a HTML response for the main app
  index: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message } = req.params;
      res.send('../static/index.html');
    } catch (err) {
      next(err);
    }
  }
};
