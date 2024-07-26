import Joi from "joi";
import Async from "async";
import Boom from "boom";
import _ from "lodash";
import Path from "path";
import Config from "config";
import Response from "../../../../models/response";
import SegmentService from "../../services/segment.services";
import jwt from "jsonwebtoken";
import makeRequest from "request";
import crypto from "crypto";
import fetch from 'node-fetch';

export class SegmentController {
  /**
 * @swagger
 * /segment/addnewsegment:
 *   post:
 *     tags:
 *       - Segment
 *     security:
 *       - tokenauth: [Authorization]
 *     description: Add New Segment
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         in: body
 *         description: Segment Name.
 *         schema:
 *           $ref: '#/definitions/NewSegment'
 *     responses:
 *       200:
 *         description: Returns success message
 */
  createNewSegment(request, response, next) {
    const validationSchema = {
      name: Joi.string().required().trim(),
    };
    Async.auto(
      {
        validatedBody: (cb) => {
          Joi.validate(request.body, validationSchema, cb);
        }
      },
      (error, result) => {
        if (error) {
          return response.json(new Response(error, "Something went wrong!!", 400));
          next();
        } else {
          SegmentService.addNewSegmen(request.body, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Segment Not Added Successfully!!", 400));
            } else {
              return response.json(new Response(null, "Segment Added Successfully!!"));
            }
          })
        }
      }
    );
  }
  /**
 * @swagger
 * /segment/modifysegment:
 *   put:
 *     tags:
 *       - Segment
 *     security:
 *       - tokenauth: [Authorization]
 *     description: Update Segment Name
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: body
 *         type: string
 *         description: Segment ID.
 *         schema:
 *           $ref: '#/definitions/UpdateSegment'
 *     responses:
 *       200:
 *         description: Returns success message
 */
  modifySegment(request, response, next) {
    const validationSchema = ({
      name: Joi.string().required(),
      id: Joi.string().required()
    })
    Async.auto(
      {
        validatedBody: (cb) => {
          Joi.validate(request.body, validationSchema, cb);
        }
      },
      (error, result) => {
        if (error) {
          return response.json(new Response(error, "Invalid Request!!", 400));
          next();
        } else {
          SegmentService.modifySegment(request.body, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!", 400));
            } else {
              if (user) {
                return response.json(new Response(null, "Segment Updated!!"));
              } else {
                return response.json(new Response(null, "Invalid Request!!", 400));
              }
            }
          })
        }
      }
    );
  }
  /**
 * @swagger
 * /segment/activatedeactivate:
 *   put:
 *     tags:
 *       - Segment
 *     security:
 *       - tokenauth: [Authorization]
 *     description: Deactivate Segment
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: query
 *         required: true
 *         type: string
 *         description: Segment ID.
 *       - name: is_active
 *         in: query
 *         required: true
 *         type: boolean
 *         description: Status.
 *     responses:
 *       200:
 *         description: Returns success message
 */
  activateDeactivate(request, response, next) {
    const validationSchema = ({
      id: Joi.string().required(),
      is_active: Joi.boolean().required(),
    });
    Async.auto(
      {
        validatedBody: (cb) => {
          Joi.validate(request.query, validationSchema, cb);
        }
      },
      (error, result) => {
        if (error) {
          return response.json(new Response(error, "Invalid Request!!", 400));
          next();
        } else {
          SegmentService.activateDeactivate(request.query, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!", 400));
            } else {
              if (user) {
                return response.json(new Response(null, "Segment Updated Successfully!!"));
              } else {
                return response.json(new Response(null, "Invalid Request!!", 400));
              }
            }
          })
        }
      }
    );
  }
  /**
 * @swagger
 * /segment/getsegmentbyid/{id}:
 *   get:
 *     tags:
 *       - Segment
 *     security:
 *       - tokenauth: [Authorization]
 *     description: Get Segment Info
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Segment ID.
 *     responses:
 *       200:
 *         description: Returns success message
 */
  getSegmentByID(request, response, next) {
    const validationSchema = ({
      id: Joi.string().required(),
    })
    Async.auto(
      {
        validatedBody: (cb) => {
          Joi.validate(request.params, validationSchema, cb);
        }
      },
      (error, result) => {
        if (error) {
          return response.json(new Response(error, "Invalid Request!!", 400));
          next();
        } else {
          SegmentService.getSegmentByID(request.params, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!", 400));
            } else {
              if (user) {
                return response.json(new Response(user, "Segment Info!!"));
              } else {
                return response.json(new Response(null, "Invalid Request!!", 400));
              }
            }
          })
        }
      }
    );
  }

  /**
 * @swagger
 * /segment/getsegmentlist:
 *   get:
 *     tags:
 *       - Segment
 *     description: Get Segment List
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns success message
 */
  getSegmentList(request, response, next) {
    const validationSchema = ({
    })
    Async.auto(
      {
        validatedBody: (cb) => {
          Joi.validate({}, validationSchema, cb);
        }
      },
      (error, result) => {
        if (error) {
          return response.json(new Response(error, "Invalid Request!!", 400));
          next();
        } else {
          SegmentService.getSegmentList(null, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!", 400));
            } else {
              if (user) {
                return response.json(new Response(user, "Segment List!!"));
              } else {
                return response.json(new Response(null, "Invalid Request!!", 400));
              }
            }
          })
        }
      }
    );
  }

}
export default new SegmentController();
