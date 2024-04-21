import express from 'express'
import { Application } from 'express'

class App {
    public app: Application
    public port: number

    constructor(appInit: { port: number, middlewares: any, controllers: any }) {
        this.app = express()
        this.port = appInit.port

        this.middlewares(appInit.middlewares)
        this.routes(appInit.controllers)
    }

    public listen() {
        this.app.disable("x-powered-by") // Reduce fingerprinting

        this.app.listen(this.port, () => {
            console.log(`Running on ${this.port}`)
        })
    }

    private routes(controllers: any) {
        controllers.forEach((ele: any) => {
            this.app.use(ele.path, ele.router)
        })
    }

    private middlewares(middlewares: any) {
        middlewares.forEach((ele: any) => {
            this.app.use(ele)
        })
    }
}

export default App