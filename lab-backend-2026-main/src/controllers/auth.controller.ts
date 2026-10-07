import { AuthService, LoginInput } from "@/services/auth.service";
import { NextFunction, Request, Response } from "express";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password }  = req.body as LoginInput;
      const { token, user } = await this.authService.login({ email, password });
      res.json({ token, user });
    } catch (error) {
      res.status(401).json(error);
    }
  };

  public me = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.authService.me(req.user!.id);
      res.json(user);
    } catch (error) {
      res.status(404).json(error);
    }
  }
}