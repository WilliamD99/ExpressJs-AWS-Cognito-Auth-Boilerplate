import { Request, Response } from 'express'
import { RateLimiterMemory } from 'rate-limiter-flexible'

class RateLimiterMiddleware {
    private rateLimiter;

    constructor(points: number = 10, duration: number = 1) {
        this.rateLimiter = new RateLimiterMemory({
            keyPrefix: "middleware",
            points: points, // x request
            duration: duration, // per y seconds by IP
        })
    }

    public rateLimiterFunc = (req: Request, res: Response, next: Function) => {
        this.rateLimiter.consume(req.ip).then(() => {
            next();
        }).catch(() => {
            res.status(429).send('Too Many Requests');
        });
    }
}

export default RateLimiterMiddleware