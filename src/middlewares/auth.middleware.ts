import { CognitoJwtVerifier } from 'aws-jwt-verify'
import { Request, Response } from 'express'

class AuthMiddleware {
    constructor() {
        this.setUp()
    }

    async verifyToken(req: Request, res: Response, next) {
        const token = req.header("Auth")

        const verifier = CognitoJwtVerifier.create({
            userPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
            tokenUse: "access",
            clientId: process.env.AWS_COGNITO_CLIENT_ID
        })

        try {
            const payload = await verifier.verify(token)
            if (!payload) res.status(500).end()
            next()
        } catch (err) {
            console.log(err)
            res.status(401).send(false)
        }
    }

    setUp() {

    }
}

export default AuthMiddleware