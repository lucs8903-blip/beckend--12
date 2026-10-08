import { LoginInput, AuthService, RegisterInput } from '../services/auth.service';
import { Request, Response } from 'express';

export class AuthController {
  private authService = new AuthService();

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.register(req.body as RegisterInput);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível cadastrar o usuário';
      res.status(message === 'E-mail já cadastrado' ? 409 : 400).json({ message });
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.login(req.body as LoginInput);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível autenticar';
      res.status(401).json({ message });
    }
  };

  public me = async (req: Request, res: Response): Promise<void> => {
    try {
      res.json(await this.authService.me(req.user!.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Usuário não encontrado';
      res.status(404).json({ message });
    }
  };
}