import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";

import CognitoService from "../services/cognito.service";

class AuthController {
  public path = "/auth";
  public router = express.Router();

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post("/signup", this.validateBody("signup"), this.signup);
    this.router.post("/signin", this.validateBody("signin"), this.signin);
    this.router.post("/verify", this.validateBody("verify"), this.verify);
    this.router.post("/refresh", this.validateBody("refresh"), this.refresh);
    this.router.post(
      "/verify-token",
      this.validateBody("verify-token"),
      this.verifyToken
    );
    this.router.post(
      "/forgot",
      this.validateBody("forgot"),
      this.forgotPasswordCode
    );
    this.router.post(
      "/confirm-forgot",
      this.validateBody("confirmForgot"),
      this.confirmForgotPassword
    );
    this.router.post("/get-user", this.validateBody("getUser"), this.getUser);
    this.router.post(
      "/update-user",
      this.validateBody("updateUser"),
      this.updateUser
    );
  }

  signup(req: Request, res: Response) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(422).json({ errors: result.array() });
    }

    const { username, password, ...attributes } = req.body;
    // Need to add the rest of the attributes to an array
    let userAttributes = [];
    Object.keys(attributes).forEach((key: string) =>
      userAttributes.push({ Name: key, Value: attributes[key] })
    );

    const cognito = new CognitoService();
    cognito.signUp(username, password, userAttributes).then((success) => {
      if (success) return res.status(200).send(success);
      else res.status(500).send(success);
    });
  }

  signin(req: Request, res: Response) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(422).json({ errors: result.array() });
    }

    const { username, password } = req.body;

    const cognito = new CognitoService();
    cognito.signIn(username, password).then((success) => {
      if (success) res.status(200).send(success);
      else res.status(401).send(success);
    });
  }
  // Verify User Account
  verify(req: Request, res: Response) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(422).json({ errors: result.array() });
    }

    const { username, code } = req.body;

    const cognito = new CognitoService();
    cognito.verify(username, code).then((success) => {
      if (success) res.status(200).send(true);
      else res.status(500).send(false);
    });
  }

  // Get a new token from a valid refresh token
  refresh(req: Request, res: Response) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(422).json({ error: result.array() });
    }

    const { username, token } = req.body;

    const cognito = new CognitoService();
    cognito.refreshToken(username, token).then((success) => {
      if (success) res.status(200).send(success);
      else res.status(500).end();
    });
  }

  verifyToken(req: Request, res: Response) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(422).json({ errors: result.array() });
    }

    const { token } = req.body;

    const cognito = new CognitoService();
    cognito.verifyToken(token).then((success) => {
      if (success) res.status(200).send(success);
      else res.status(401).send(false);
    });
  }

  // This will send an email to the user with the confirmation code to reset the pw
  forgotPasswordCode(req: Request, res: Response) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(422).json({ errors: result.array() });
    }

    const { username } = req.body;

    const cognito = new CognitoService();
    cognito.forgotPasswordCode(username).then((success) => {
      if (success) res.status(200).send(success);
      else res.status(401).send(false);
    });
  }

  // Calling this will change the user password
  confirmForgotPassword(req: Request, res: Response) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(422).json({ errors: result.array() });
    }

    const { username, password, confirmationCode } = req.body;

    const cognito = new CognitoService();
    cognito
      .changePassword(username, confirmationCode, password)
      .then((success) => {
        if (success) res.status(200).send(true);
        else res.status(401).send(false);
      });
  }

  // Get the user from the access token
  getUser(req: Request, res: Response) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(422).json({ errors: result.array() });
    }

    const { token } = req.body;

    const cognito = new CognitoService();
    cognito.getUser(token).then((success) => {
      if (success) res.status(200).send(success);
      else res.status(404).send(false);
    });
  }

  // Update user attributes
  updateUser(req: Request, res: Response) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(422).json({ errors: result.array() });
    }

    const { token, attr } = req.body;

    const cognito = new CognitoService();
    cognito.updateUserAttributes(token, attr).then((success) => {
      if (success) res.status(200).send(success);
      else res.status(401).send(false);
    });
  }

  private validateBody(type: string) {
    switch (type) {
      case "signup":
        return [
          body("username").notEmpty().isLength({ min: 6 }),
          body("email").notEmpty().normalizeEmail().isEmail(),
          body("password").isString().isLength({ min: 8 }),
        ];
      case "signin":
        return [
          body("username").notEmpty().isLength({ min: 6 }),
          body("password").isString().isLength({ min: 8 }),
        ];
      case "verify":
        return [
          body("username").notEmpty().isLength({ min: 6 }),
          body("code").isString().isLength({ min: 6, max: 6 }),
        ];
      case "refresh":
        return [
          body("username").notEmpty().isLength({ min: 6 }),
          body("token").notEmpty(),
        ];
      case "verify-token":
        return [body("token").notEmpty()];
      case "forgot":
        return [body("username").notEmpty().isLength({ min: 6 })];
      case "confirmForgot":
        return [
          body("username").notEmpty().isLength({ min: 6 }),
          body("password").isString().isLength({ min: 8 }),
          body("confirmationCode").notEmpty(),
        ];
      case "getUser":
        return [body("token").notEmpty()];
      case "updateUser":
        return [body("token").notEmpty(), body("attr").isArray()];
    }
  }
}

export default AuthController;
