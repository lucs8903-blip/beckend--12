import { NextFunction, Request, Response } from 'express';

export class ProdutoController {
  public createProduct = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.status(501).json({ message: 'Produtos não fazem parte deste modelo de dados.' });
  };
}