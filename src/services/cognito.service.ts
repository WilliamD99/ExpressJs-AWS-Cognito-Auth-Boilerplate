import { CognitoJwtVerifier } from 'aws-jwt-verify'
import AWS from 'aws-sdk'
import crypto from 'crypto'

import dotenv from 'dotenv'
dotenv.config()

class CognitoService {
    private config = {
        region: "ca-central-1"
    }
    private secretHash: string = process.env.AWS_COGNITO_SECRET_HASH
    private clientId: string = process.env.AWS_COGNITO_CLIENT_ID
    private cognitoIdentity;

    constructor() {
        this.cognitoIdentity = new AWS.CognitoIdentityServiceProvider(this.config)
    }

    public async signUp(username: string, password: string, userAttributes?: Array<any>) {
        const params = {
            ClientId: this.clientId,
            Password: password,
            Username: username,
            SecretHash: this.generateHash(username),
            UserAttributes: userAttributes
        }

        try {
            const data = await this.cognitoIdentity.signUp(params).promise()
            console.log(data)
            return true
        } catch (e) {
            console.log(e)
            return e
        }
    }

    public async signIn(username: string, password: string) {
        const params = {
            ClientId: this.clientId,
            AuthFlow: "USER_PASSWORD_AUTH",
            AuthParameters: {
                "USERNAME": username,
                "PASSWORD": password,
                "SECRET_HASH": this.generateHash(username)
            }
        }
        try {
            let data = await this.cognitoIdentity.initiateAuth(params).promise()
            console.log(data)
            return data.AuthenticationResult

        } catch (err) {
            console.log(err)
            return err
        }
    }
    // Verify User Account
    public async verify(username: string, code: string) {
        const params = {
            ClientId: this.clientId,
            Username: username,
            ConfirmationCode: code,
            SecretHash: this.generateHash(username),
        }

        try {
            const data = await this.cognitoIdentity.confirmSignUp(params).promise()
            console.log(data)

            return true
        } catch (err) {
            console.log(err)
            return false
        }
    }

    // Calling this API causes a message to be sent to the end user with a confirmation code that is required to change the user's password.
    public async forgotPasswordCode(username: string) {
        const params = {
            ClientId: this.clientId,
            Username: username,
            SecretHash: this.generateHash(username)
        }

        try {
            const data = await this.cognitoIdentity.forgotPassword(params).promise()

            console.log(data)
            return data
        } catch (err) {
            console.log(err)
            return false
        }
    }

    // Calling this will change the user password
    public async changePassword(username: string, code: string, password: string) {
        const params = {
            ClientId: this.clientId,
            ConfirmationCode: code,
            Username: username,
            Password: password,
            SecretHash: this.generateHash(username)
        }

        try {
            const data = await this.cognitoIdentity.confirmForgotPassword(params).promise()
            console.log(data)
            return data
        } catch (err) {
            console.log(err)
            return false
        }
    }

    // Get the user from the access token
    public async getUser(token: string) {
        const params = {
            AccessToken: token
        }

        try {
            const data = await this.cognitoIdentity.getUser(params).promise()
            console.log(data)
            return data
        } catch (err) {
            console.log(err)
            return false
        }
    }

    // Take in the refresh token and return a new token 
    public async refreshToken(username: string, token: string) {
        const params = {
            ClientId: this.clientId,
            AuthFlow: "REFRESH_TOKEN_AUTH",
            AuthParameters: {
                "REFRESH_TOKEN": token,
                "SECRET_HASH": this.generateHash(username)
            }
        }

        try {
            const data = await this.cognitoIdentity.initiateAuth(params).promise()
            console.log(data)
            return data.AuthenticationResult

        } catch (err) {
            console.log(err)
            return false
        }
    }

    public async verifyToken(token: string) {
        const verifier = CognitoJwtVerifier.create({
            userPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
            tokenUse: "access",
            clientId: process.env.AWS_COGNITO_CLIENT_ID
        })

        try {
            const payload = await verifier.verify(token)
            console.log(payload)
            return payload
        } catch (err) {
            console.log(err)
            return false
        }

    }

    private generateHash(username: string): string {
        return crypto.createHmac('SHA256', this.secretHash).update(username + this.clientId).digest('base64')
    }

}

export default CognitoService