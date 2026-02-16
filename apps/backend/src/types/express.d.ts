export {};

declare global {
  namespace Express {
    interface Request {
      user?: import('../middleware/auth.js').UserContext;
    }
  }
}
