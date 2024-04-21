import express, { Request, Response } from 'express'
import AuthMiddleware from '../middlewares/auth.middleware';
import RateLimiterMiddleware from '../middlewares/rateLimiter.middleware';

class ProtectedController {
    public path = "/protected"
    public router = express.Router()
    private authMiddleware;
    private rateLimiterMiddleware;

    constructor() {
        this.authMiddleware = new AuthMiddleware()
        this.rateLimiterMiddleware = new RateLimiterMiddleware(1, 5)
        this.initRoutes()
    }

    private initRoutes() {
        // this.router.use(this.authMiddleware.verifyToken)
        this.router.use(this.rateLimiterMiddleware.rateLimiterFunc)
        this.router.get("/test", this.home)
    }

    home(req: Request, res: Response) {
        res.send("This is a secret")
    }
}

export default ProtectedController