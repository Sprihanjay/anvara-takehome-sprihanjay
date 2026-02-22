import { Router, type Request, type Response, type IRouter } from 'express';

const router: IRouter = Router();

// POST /api/newsletter/subscribe - Subscribe to newsletter
router.post('/subscribe', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'Invalid email address' });
    return;
  }
  // This is a dummy endpoint, so we just return success
  res.json({ success: true, message: 'Thanks for subscribing!' });
});

export default router;
