import Express from "express";
import Mongoose from "mongoose";
import * as bodyParser from "body-parser";
import * as http from "http";
import * as path from "path";
const fs = require('fs')
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import useragent from "express-useragent";
import Config from "config";
import logger from "../helper/logger";
import uncaughtExceptions from "../helper/uncaughtExceptions";
import ErrorHandler from "../helper/errorHandler";
import makeRequest from "request";
import Boom from "boom";

const app = new Express();
const root = path.normalize(`${__dirname}/../..`);

class ExpressServer {
  constructor() {
    app.use(bodyParser.json());
    app.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );

    app.use(helmet());
    app.use(useragent.express());
    // app.use(Express.static(`${root}/views`));
    app.use(Express.static(`${root}/public/images`));
    app.use(Express.static(`${root}/build`));
    app.use(
      cors({
        allowedHeaders: ["Content-Type", "token", "authorization", "X-Source", "x-source"],
        exposedHeaders: ["token", "authorization"],
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
      })
    );
  }
  router(routes) {
    routes(app);
    return this;
  }

  configureSwagger(swaggerDefinition) {
    const options = {
      // swaggerOptions : { authAction :{JWT :{name:"JWT", schema :{ type:"apiKey", in:"header", name:"Authorization", description:""}, value:"Bearer <JWT>"}}},
      swaggerDefinition,
      apis: [
        path.resolve(`${root}/server/api/v0/controllers/**/*.js`),
        path.resolve(`${root}/api.yaml`),
      ],
    };

    console.log("option===>", options);

    function requireLogin(request, response, next) {
      // console.log('request rec',process.env.swaggerLogin)
      if (Date.now() - process.env.swaggerLogin < 15 * 60 * 1000 || true) {
        next();
      } else {
        console.log("else part\n\n");
        process.env.swaggerLogin = 0;
        response.sendFile(path.resolve(`${root}/views/login.html`));
      }
    }
    app.use(
      "/api-docs",
      requireLogin,
      swaggerUi.serve,
      swaggerUi.setup(swaggerJSDoc(options))
    );
    return this;
  }
  configureUI() {
    app.get('/video', function (req, res) {
      let query = req.query.name
      const internalPath = path.join(root, 'public/images', query)
      const stat = fs.statSync(internalPath)
      const fileSize = stat.size
      const range = req.headers.range

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1]
          ? parseInt(parts[1], 10)
          : fileSize - 1

        const chunksize = (end - start) + 1
        const file = fs.createReadStream(internalPath, { start, end })
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        }
        res.writeHead(206, head)
        file.pipe(res)
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        }
        res.writeHead(200, head)
        fs.createReadStream(internalPath).pipe(res)
      }
      // res.sendFile(path.join(root, 'public/images', query));
    });
    app.get('/image', function (req, res) {
      let query = req.query.image
      res.sendFile(path.join(root, 'public/images', query));
    });
    app.get('/*', function (req, res) {
      res.sendFile(path.join(root, 'build', 'index.html'));
    });

    return this;
  }
  handleError() {
    const errorHandler = new ErrorHandler({
      logger,
      shouldLog: true,
    });
    app.use(errorHandler.build());
    app.use(errorHandler.unhandledRequest());

    return this;
  }
  configureDb(dbUrl) {
    return new Promise((resolve, reject) => {
      Mongoose.connect(dbUrl, {
        // retry to connect for 60 times
        reconnectTries: 60,
        // wait 1 second before retrying
        reconnectInterval: 1000
      }, (err) => {
        if (err) {
          console.log(`Error in mongodb connection ${err.message}`);
          return reject(err);
        }
        console.log("Mongodb connection established");
        return resolve(this);
      });
    });
  }

  listen(port) {
    http.createServer(app).listen(port, () => {
      console.log(`secure app is listening @port ${port}`);
      logger.info(`secure app is listening @port ${port}`);
    });
    return app;
  }
}

export default ExpressServer;
