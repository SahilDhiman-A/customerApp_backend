import Joi from "joi";
import Async from "async";
import Boom from "boom";
import _ from "lodash";
import Path from "path";
import Config from "config";
import Response from "../../../../models/response";
import FAQService from "../../services/faq.services";
import jwt from "jsonwebtoken";
import makeRequest from "request";
import crypto from "crypto";
import fetch from 'node-fetch';
const apiAddress = Config.get("web");
const xlsx = require('xlsx');

export class FAQController {
  /**
 * @swagger
 * /faq/addnewfaq:
 *   post:
 *     tags:
 *       - FAQ
 *     security:
 *       - tokenauth: [Authorization]
 *     description: Add New FAQ
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: question
 *         in: formData
 *         required: true
 *         type: string
 *       - name: answer
 *         in: formData
 *         required: true
 *         type: string
 *       - name: category_id
 *         in: formData
 *         required: true
 *         type: string
 *       - name: link
 *         in: formData
 *         required: false
 *         type: string
 *       - name: image_url
 *         in: formData
 *         required: false
 *         type: string
 *       - name: video_url
 *         in: formData
 *         required: false
 *         type: string
 *       - name: video
 *         in: formData
 *         required: false
 *         type: file
 *       - name: image
 *         in: formData
 *         required: false
 *         type: file
 *     responses:
 *       200:
 *         description: Returns success message
 */
  createNewFAQ(request, response, next) {
    const validationSchema = {
      question: Joi.string().required().trim(),
      answer: Joi.string().required().trim(),
      category_id: Joi.string().required().trim(),
      link: Joi.string().optional().allow(null),
      image_url: Joi.string().optional().allow(null),
      video_url: Joi.string().optional().allow(null)
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
          let files = request.files
          for (let index = 0; index < files.length; index++) {
            let fileElement = files[index];
            if (fileElement.fieldname == 'video') {
              let finalUrl = apiAddress + "video?name=" + fileElement.filename
              request.body.video_url = finalUrl
              request.body.image_url = null
            }
            if (fileElement.fieldname == 'image') {
              let finalUrl = apiAddress + "image?image=" + fileElement.filename
              request.body.image_url = finalUrl
              request.body.video_url = null
            }
          }
          FAQService.addNewFAQ(request.body, (err, user) => {
            if (err) {
              return response.json(new Response(err, "FAQ Not Added Successfully!!", 400));
            } else {
              return response.json(new Response(null, "FAQ Added Successfully!!"));
            }
          })
        }
      }
    );
  }
  /**
 * @swagger
 * /faq/bulkuploadfaq:
 *   post:
 *     tags:
 *       - FAQ
 *     security:
 *       - tokenauth: [Authorization]
 *     description: Bulk Upload FAQ
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: file
 *         in: formData
 *         required: true
 *         type: file
 *     responses:
 *       200:
 *         description: Returns success message
 */
  bulkUploadFAQ(request, response, next) {
    const validationSchema = {};
    Async.auto(
      {
        validatedBody: (cb) => {
          Joi.validate({}, validationSchema, cb);
        }
      },
      (error, result) => {
        if (error) {
          return response.json(new Response(error, "Something went wrong!!", 400));
          next();
        } else {
          let files = request.files
          let xlsData = []
          for (let index = 0; index < files.length; index++) {
            let wb = xlsx.read(files[index].buffer, { type: "buffer" });
            let wsname = wb.SheetNames[0];
            let ws = wb.Sheets[wsname];
            xlsData = xlsx.utils.sheet_to_json(ws);
          }



          FAQService.bulkUploadFAQ(xlsData, (err, user) => {
            if (err) {
              return response.json(new Response(err, "FAQ Not Added Successfully!!", 400));
            } else {
              return response.json(new Response(null, "FAQ Added Successfully!!"));
            }
          })
        }
      }
    );
  }
  /**
 * @swagger
 * /faq/modifyfaq:
 *   put:
 *     tags:
 *       - FAQ
 *     security:
 *       - tokenauth: [Authorization]
 *     description: Update FAQ Name
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: question
 *         in: formData
 *         required: true
 *         type: string
 *       - name: answer
 *         in: formData
 *         required: true
 *         type: string
 *       - name: id
 *         in: formData
 *         required: true
 *         type: string
 *       - name: link
 *         in: formData
 *         required: false
 *         type: string
 *       - name: image_url
 *         in: formData
 *         required: false
 *         type: string
 *       - name: video_url
 *         in: formData
 *         required: false
 *         type: string
 *       - name: video
 *         in: formData
 *         required: false
 *         type: file
 *       - name: image
 *         in: formData
 *         required: false
 *         type: file
 *     responses:
 *       200:
 *         description: Returns success message
 */
  modifyFAQ(request, response, next) {
    const validationSchema = ({
      question: Joi.string().required().trim(),
      answer: Joi.string().required().trim(),
      link: Joi.string().optional().allow(null),
      image_url: Joi.string().optional().allow(null),
      video_url: Joi.string().optional().allow(null),
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
          let files = request.files
          for (let index = 0; index < files.length; index++) {
            let fileElement = files[index];
            if (fileElement.fieldname == 'video') {
              let finalUrl = apiAddress + "video?name=" + fileElement.filename
              request.body.video_url = finalUrl
              request.body.image_url = null
            }
            if (fileElement.fieldname == 'image') {
              let finalUrl = apiAddress + "image?image=" + fileElement.filename
              request.body.image_url = finalUrl
              request.body.video_url = null
            }
          }
          FAQService.modifyFAQ(request.body, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!", 400));
            } else {
              if (user) {
                return response.json(new Response(null, "FAQ Updated!!"));
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
 * /faq/activatedeactivate:
 *   put:
 *     tags:
 *       - FAQ
 *     security:
 *       - tokenauth: [Authorization]
 *     description: Deactivate FAQ
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: query
 *         required: true
 *         type: string
 *         description: FAQ ID.
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
          FAQService.activateDeactivate(request.query, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!", 400));
            } else {
              if (user) {
                return response.json(new Response(null, "FAQ Updated Successfully!!"));
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
 * /faq/viewincrement:
 *   put:
 *     tags:
 *       - FAQ
 *     security:
 *       - tokenauth: [Authorization]
 *     description: Deactivate FAQ
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: query
 *         required: true
 *         type: string
 *         description: FAQ ID.
 *     responses:
 *       200:
 *         description: Returns success message
 */
  viewIncrement(request, response, next) {
    const validationSchema = ({
      id: Joi.string().required()
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
          FAQService.viewIncrement(request.query, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!", 400));
            } else {
              if (user) {
                return response.json(new Response(null, "FAQ Updated Successfully!!"));
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
 * /faq/thumbsup:
 *   put:
 *     tags:
 *       - FAQ
 *     description: Add thumbs Up
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: can_id
 *         in: query
 *         required: true
 *         type: string
 *         description: Can ID.
 *       - name: faq_id
 *         in: query
 *         required: true
 *         type: string
 *         description: FAQ ID.
 *     responses:
 *       200:
 *         description: Returns success message
 */
  thumbsUp(request, response, next) {
    const validationSchema = ({
      can_id: Joi.string().required(),
      faq_id: Joi.string().required()
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
          FAQService.thumbsUp(request.query, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!", 400));
            } else {
              return response.json(new Response(null, "FAQ Feedback Captured!!"));
            }
          })
        }
      }
    );
  }
  /**
 * @swagger
 * /faq/thumbsdown:
 *   put:
 *     tags:
 *       - FAQ
 *     description: Add thumbs Up
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: thumbsDown
 *         in: body
 *         required: true
 *         type: string
 *         description: Thumbs Down.
 *         schema:
 *           $ref: '#/definitions/ThumbsDown'
 *     responses:
 *       200:
 *         description: Returns success message
 */
  thumbsDown(request, response, next) {
    const validationSchema = ({
      can_id: Joi.string().required(),
      faq_id: Joi.string().required(),
      reason: Joi.string().required()
    });
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
          FAQService.thumbsDown(request.body, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!", 400));
            } else {
              return response.json(new Response(null, "FAQ Feedback Captured!!"));
            }
          })
        }
      }
    );
  }
  /**
 * @swagger
 * /faq/getthumbscount:
 *   get:
 *     tags:
 *       - FAQ
 *     description: Add thumbs Up
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: can_id
 *         in: query
 *         required: true
 *         type: string
 *         description: Can ID.
 *       - name: faq_id
 *         in: query
 *         required: true
 *         type: string
 *         description: FAQ ID.
 *     responses:
 *       200:
 *         description: Returns success message
 */
  getThumbsCount(request, response, next) {
    const validationSchema = ({
      can_id: Joi.string().required(),
      faq_id: Joi.string().required()
    })
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
          FAQService.getThumbsCount(request.query, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!", 400));
            } else {
              return response.json(new Response(null, "FAQ Info!!", 200, user));
            }
          })
        }
      }
    );
  }
  /**
 * @swagger
 * /faq/getfaqbyid/{id}:
 *   get:
 *     tags:
 *       - FAQ
 *     security:
 *       - tokenauth: [Authorization]
 *     description: Get FAQ Info
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: FAQ ID.
 *       - name: action
 *         in: query
 *         type: string
 *         description: Action Type i.e download.
 *     responses:
 *       200:
 *         description: Returns success message
 */
  getFAQByID(request, response, next) {
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
          FAQService.getFAQByID(request.params, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!", 400));
            } else {
              if (user) {
                return response.json(new Response(user, "FAQ Info!!"));
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
 * /faq/getfaqbycategoryid/{id}:
 *   get:
 *     tags:
 *       - FAQ
 *     security:
 *       - tokenauth: [Authorization]
 *     description: Get FAQ Info
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Category ID.
 *       - name: searchKey
 *         in: query
 *         type: string
 *         description: Search Keyword.
 *     responses:
 *       200:
 *         description: Returns success message
 */
  getFAQByCategoryID(request, response, next) {
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
          let requestData = request.params
          requestData.question = request.query.searchKey
          FAQService.getFAQByCategoryID(requestData, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!", 400));
            } else {
              return response.json(new Response(user, "FAQ Info!!"));
            }
          })
        }
      }
    );
  }
  /**
 * @swagger
 * /faq/getfaqbysegmentid/{id}/{can_id}:
 *   get:
 *     tags:
 *       - FAQ
 *     description: Get FAQ Info
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Segment ID.
 *       - name: can_id
 *         in: path
 *         required: true
 *         type: string
 *         description: User Can ID.
 *       - name: searchKey
 *         in: query
 *         type: string
 *         description: Search Keyword.
 *     responses:
 *       200:
 *         description: Returns success message
 */
  getFAQBySegmentID(request, response, next) {
    //
    const validationSchema = ({
      id: Joi.string().required(),
      can_id: Joi.string().required(),
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
          let requestData = request.params
          requestData.question = request.query.searchKey
          if (requestData.question) {
            FAQService.addUserRecentSearch(requestData, (err, user1) => {
              if (err) {
                console.log("Hi")
                //return response.json(new Response(err, "Invalid Request!!", 400));
              } else {
                console.log("Hi")
                //return response.json(new Response(user, "FAQ Info!!"));
              }
            })
          }
          FAQService.getFAQBySegmentID(requestData, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!", 400));
            } else {
              return response.json(new Response(user, "FAQ Info!!"));
            }
          })
        }
      }
    );
  }
  /**
 * @swagger
 * /faq/getfaqbysegmentname/{name}:
 *   get:
 *     tags:
 *       - FAQ
 *     description: Get FAQ Info
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         type: string
 *         description: Segment Name.
 *       - name: searchKey
 *         in: query
 *         type: string
 *         description: Search Keyword.
 *     responses:
 *       200:
 *         description: Returns success message
 */
  getFAQBySegmentName(request, response, next) {
    const validationSchema = ({
      name: Joi.string().required(),
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
          let requestData = request.params
          requestData.question = request.query.searchKey
          FAQService.getFAQBySegmentName(requestData, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!", 400));
            } else {
              return response.json(new Response(user, "FAQ Info!!"));
            }
          })
        }
      }
    );
  }
  /**
 * @swagger
 * /faq/getfaqlist:
 *   get:
 *     tags:
 *       - FAQ
 *     security:
 *       - tokenauth: [Authorization]
 *     description: Get FAQ List
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: searchKey
 *         in: query
 *         type: string
 *         description: Search Keyword.
 *     responses:
 *       200:
 *         description: Returns success message
 */
  getFAQList(request, response, next) {
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
          let requestData = request.params
          requestData.question = request.query.searchKey
          FAQService.getFAQList(requestData, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!", 400));
            } else {
              return response.json(new Response(user, "FAQ List!!"));
            }
          })
        }
      }
    );
  }
  /**
 * @swagger
 * /faq/gettop5faqlist/{id}:
 *   get:
 *     tags:
 *       - FAQ
 *     security:
 *       - tokenauth: [Authorization]
 *     description: Get FAQ List
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Segment ID.
 *       - name: searchKey
 *         in: query
 *         type: string
 *         description: Search Keyword.
 *     responses:
 *       200:
 *         description: Returns success message
 */
  getTop5FAQList(request, response, next) {
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
          let requestData = request.params
          requestData.question = request.query.searchKey
          FAQService.getTop5FAQList(requestData, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!", 400));
            } else {
              return response.json(new Response(user, "FAQ List!!"));
            }
          })
        }
      }
    );
  }
  /**
 * @swagger
 * /faq/getrecentsearchlist/{can_id}:
 *   get:
 *     tags:
 *       - FAQ
 *     security:
 *       - tokenauth: [Authorization]
 *     description: Get Search Keyword List
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: can_id
 *         in: path
 *         required: true
 *         type: string
 *         description: Can ID.
 *     responses:
 *       200:
 *         description: Returns success message
 */
  getRecentSearchList(request, response, next) {
    const validationSchema = ({
      can_id: Joi.string().required(),
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
          let requestData = request.params
          FAQService.getUserRecentSearch(requestData, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!", 400));
            } else {
              return response.json(new Response(user, "Search Keyword List!!"));
            }
          })
        }
      }
    );
  }
}
export default new FAQController();
