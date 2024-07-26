//v7 imports
// import testRouter0 from "./api/v0/controllers/test/routes";
import notificationRouter0 from "./api/v0/controllers/notification/routes";
import userRouter0 from "./api/v0/controllers/user/routes";
import segmentRouter0 from "./api/v0/controllers/segment/routes";
import categoryRouter0 from "./api/v0/controllers/category/routes";
import faqRouter0 from "./api/v0/controllers/faq/routes";
import authenticationController0 from "./api/v0/controllers/authentication/controller";
/**
 *
 *
 * @export
 * @param {any} app
 */

export default function routes(app) {
  var unless = function (middleware, ...paths) {
    return function (req, res, next) {
      console.log(paths, req.path);
      const pathCheck = paths.some((path) => path === req.path);
      pathCheck ? next() : middleware(req, res, next);
    };
  };

  /*------------v7 routes--------------------*/
  // app.use(
  //   "/v0/test",
  //   unless(
  //     authenticationController0.verifyToken,
  //     "/getresponse"
  //   ),
  //   testRouter0
  // );
  app.use(
    "/v0/notification",
    // unless(
    //   authenticationController0.verifyToken,
    //   "/getresponse"
    // ),
    notificationRouter0
  );
  app.use(
    "/v0/user",
    // unless(
    //   authenticationController0.verifyToken,
    //   "/getresponse"
    // ),
    userRouter0
  );
  
  app.use(
    "/v0/segment",
    segmentRouter0
  );
  app.use(
    "/v0/category",
    categoryRouter0
  );
  app.use(
    "/v0/faq",
    faqRouter0
  );
  return app;
}
