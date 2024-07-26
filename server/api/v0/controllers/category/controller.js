import Joi from "joi";
import Async from "async";
import Boom from "boom";
import _ from "lodash";
import Path from "path";
import Config from "config";
import Response from "../../../../models/response";
import CategoryService from "../../services/category.services";
import jwt from "jsonwebtoken";
import makeRequest from "request";
import crypto from "crypto";
import fetch from 'node-fetch';

export class CategoryController {
    /**
   * @swagger
   * /category/addnewcategory:
   *   post:
   *     tags:
   *       - Category
   *     security:
   *       - tokenauth: [Authorization]
   *     description: Add New Category
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: name
   *         in: body
   *         description: Category Name.
   *         schema:
   *           $ref: '#/definitions/NewCategory'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  createNewCategory(request, response, next) {
    const validationSchema = {
      name: Joi.string().required().trim(),
      segment_id: Joi.string().required().trim(),
    };
    Async.auto(
      {
        validatedBody: (cb) => {
          Joi.validate(request.body, validationSchema, cb);
        }
      },
      (error, result) => {
        if (error) {
          return response.json(new Response(error, "Something went wrong!!",400));
          next();
        }else{
          let segment_ids = request.body.segment_id.split(',')
          let requestedData = []
          for (let index = 0; index < segment_ids.length; index++) {
            let element = segment_ids[index];
            requestedData.push({
              name: request.body.name,
              segment_id: element
            })
          }
          CategoryService.addNewSegmen(requestedData, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Category Not Added Successfully!!",400));
            } else {
              return response.json(new Response(null, "Category Added Successfully!!"));
            }
          })
        }
      }
    );
  }
    /**
   * @swagger
   * /category/modifycategory:
   *   put:
   *     tags:
   *       - Category
   *     security:
   *       - tokenauth: [Authorization]
   *     description: Update Category Name
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         in: body
   *         type: string
   *         description: Category ID.
   *         schema:
   *           $ref: '#/definitions/UpdateCategory'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  modifyCategory(request, response, next) {
    const validationSchema = ({
      name:  Joi.string().required(),
      id:  Joi.string().required()
    })
    Async.auto(
      {
        validatedBody: (cb) => {
          Joi.validate(request.body, validationSchema, cb);
        }
      },
      (error, result) => {
        if (error) {
          return response.json(new Response(error, "Invalid Request!!",400));
          next();
        }else{
          CategoryService.modifyCategory(request.body, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!",400));
            } else {
              if(user){
                return response.json(new Response(null,"Category Updated!!"));               
              }else{
                return response.json(new Response(null, "Invalid Request!!",400));
              }              
            }
          })          
        }
      }
    );
  }
    /**
   * @swagger
   * /category/activatedeactivate:
   *   put:
   *     tags:
   *       - Category
   *     security:
   *       - tokenauth: [Authorization]
   *     description: Deactivate Category
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         in: query
   *         required: true
   *         type: string
   *         description: Category ID.
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
        id:  Joi.string().required(),
        is_active:  Joi.boolean().required(),
      });
      Async.auto(
        {
          validatedBody: (cb) => {
            Joi.validate(request.query, validationSchema, cb);
          }
        },
        (error, result) => {
          if (error) {
            return response.json(new Response(error, "Invalid Request!!",400));
            next();
          }else{
            CategoryService.activateDeactivate(request.query, (err, user) => {
              if (err) {
                return response.json(new Response(err, "Invalid Request!!",400));
              } else {
                if(user){
                  return response.json(new Response(null,"Category Updated Successfully!!"));               
                }else{
                  return response.json(new Response(null, "Invalid Request!!",400));
                }              
              }
            })
          }
        }
      );
    }
    /**
   * @swagger
   * /category/getcategorybyid/{id}:
   *   get:
   *     tags:
   *       - Category
   *     security:
   *       - tokenauth: [Authorization]
   *     description: Get Category Info
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         type: string
   *         description: Category ID.
   *     responses:
   *       200:
   *         description: Returns success message
   */
  getCategoryByID(request, response, next) {
    const validationSchema = ({
      id:  Joi.string().required(),
    })
    Async.auto(
      {
        validatedBody: (cb) => {
          Joi.validate(request.params, validationSchema, cb);
        }
      },
      (error, result) => {
        if (error) {
          return response.json(new Response(error, "Invalid Request!!",400));
          next();
        }else{
          CategoryService.getCategoryByID(request.params, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!",400));
            } else {
              if(user){
                return response.json(new Response(user,"Category Info!!"));               
              }else{
                return response.json(new Response(null, "Invalid Request!!",400));
              }              
            }
          })
        }
      }
    );
  }
    /**
   * @swagger
   * /category/getcategorybysegmentid/{id}:
   *   get:
   *     tags:
   *       - Category
   *     security:
   *       - tokenauth: [Authorization]
   *     description: Get Category Info
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
  getCategoryBySegmentID(request, response, next) {
    const validationSchema = ({
      id:  Joi.string().required(),
    })
    Async.auto(
      {
        validatedBody: (cb) => {
          Joi.validate(request.params, validationSchema, cb);
        }
      },
      (error, result) => {
        if (error) {
          return response.json(new Response(error, "Invalid Request!!",400));
          next();
        }else{
          CategoryService.getCategoryBySegmentID(request.params, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!",400));
            } else {
              if(user){
                return response.json(new Response(user,"Category Info!!"));               
              }else{
                return response.json(new Response(null, "Invalid Request!!",400));
              }              
            }
          })
        }
      }
    );
  }
  
    /**
   * @swagger
   * /category/getcategorylist:
   *   get:
   *     tags:
   *       - Category
   *     security:
   *       - tokenauth: [Authorization]
   *     description: Get Category List
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Returns success message
   */ 
  getCategoryList(request, response, next) {
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
            return response.json(new Response(error, "Invalid Request!!",400));
            next();
          }else{
            CategoryService.getCategoryList(null, (err, user) => {
              if (err) {
                return response.json(new Response(err, "Invalid Request!!",400));
              } else {
                if(user){
                  return response.json(new Response(user,"Category List!!"));               
                }else{
                  return response.json(new Response(null, "Invalid Request!!",400));
                }              
              }
            })
          }
        }
      );
    }

}
export default new CategoryController();
