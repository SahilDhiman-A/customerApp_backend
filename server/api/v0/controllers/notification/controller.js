import Joi from "joi";
import Async from "async";
import Boom from "boom";
import _ from "lodash";
import Path from "path";
import Config from "config";
import NotificationHelper from "../../../../helper/notification";
import Response from "../../../../models/response";
import BulkUploadStatus from "../../../../models/bulkUploadStatus";
import NotificationService from "../../services/notification.services";
import makeRequest from "request";
import FileUpload from "../../../../helper/fileUploader";
//import FileUpload from "../../../../helper/fileUploader";

export class NotificationController {
  /**
 * @swagger
 * /notification/testnotification:
 *   get:
 *     tags:
 *       - Notification
 *     description: Test Notification.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: X-Source
 *         in: header
 *         required: true
 *         type: string
 *         description: Source Name.
 *       - name: device_token
 *         in: query
 *         required: true
 *         type: string
 *         description: Device Token.
 *     responses:
 *       200:
 *         description: Returns success message
 */
  testNotification(request, response, next) {
    const validationSchema = ({
      device_token: Joi.string().required()
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
          NotificationService.testNotification(request.query, (err, result) => {
            if (err) {
              return response.json(new Response(null, err, 400));
              next();
            } else {
              return response.json(new Response(null, "Notification Successfully!!"));
            }
          })
        }
      }
    );
  }
  /**
* @swagger
* /notification/addnewnotification:
*   post:
*     tags:
*       - Notification
*     description: Add New Notification to Users from Admin Pannel.
*     produces:
*       - multipart/form-data
*     parameters:
*       - name: X-Source
*         in: header
*         required: true
*         type: string
*         description: Source Name.
*       - name: image_url
*         in: formData
*         type: file
*         description: The file to upload.
*       - name: pdf_url
*         in: formData
*         type: file
*         description: The file to upload.
*       - name: title
*         in: formData
*         type: string
*         description: Title.   
*       - name: detailed_description
*         in: formData
*         type: string
*         description: Description.   
*       - name: type
*         in: formData
*         type: string
*         description: Notification Type.   
*       - name: sort_description
*         in: formData
*         type: string
*         description: Short Description.   
*       - name: video_url
*         in: formData
*         type: string
*         description: Video Url.   
*       - name: user_file
*         in: formData
*         type: file
*         description: The file to upload.
*     responses:
*       200:
*         description: Returns success message
*/
  addNewNotification(request, response, next) {
    const validationSchema = ({
      // device_tokens: Joi.array().required(),
      user_file: Joi.string().optional(),
      pdf_url: Joi.string().optional(),
      image_url: Joi.string().optional(),
      video_url: Joi.string().optional(),
      title: Joi.string().optional(),
      sort_description: Joi.string().optional(),
      detailed_description: Joi.string().optional(),
      type: Joi.string().optional()
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
          // let finalUrl = ''
          let img_url = ""
          let pdf_url = ""
          let user_file = ""
          let xlsData = []
          if (request.files && request.files.length) {
            let files = request.files
            for (let index = 0; index < files.length; index++) {
              // let element = files[index];
              let requestedFile = files[index];
              if (requestedFile.fieldname == "image_url") {
                let fileData = requestedFile.buffer
                let base64data = new Buffer.from(fileData, 'binary');
                var d = new Date();
                let fileName = d.getTime() + '.' + requestedFile.mimetype.split('image/')[1]
                img_url = FileUpload.uploadFile(fileName, base64data)
                img_url = `https://storage.googleapis.com/digitalmallofasia/${fileName}`
              }
              if (requestedFile.fieldname == "pdf_url") {
                let fileData = requestedFile.buffer
                let base64data = new Buffer.from(fileData, 'binary');
                var d = new Date();
                let fileName = d.getTime() + '.pdf'
                pdf_url = FileUpload.uploadFile(fileName, base64data)
                pdf_url = `https://storage.googleapis.com/digitalmallofasia/${fileName}`
              }
              if (requestedFile.fieldname == "user_file") {
                let fileData = requestedFile.buffer
                let base64data = new Buffer.from(fileData, 'binary');
                // let base64data1 = base64data.toString()
                var d = new Date();
                let fileName = d.getTime() + '.' + requestedFile.originalname
                user_file = FileUpload.uploadFile(fileName, base64data)
                user_file = `https://storage.googleapis.com/digitalmallofasia/${fileName}`
                const xlsx = require('xlsx');
                let wb = xlsx.read(base64data.buffer, { type: "buffer" });
                let wsname = wb.SheetNames[0];
                let ws = wb.Sheets[wsname];
                xlsData = xlsx.utils.sheet_to_json(ws);
                // let XLSX = require('xlsx'); 
                // let workbook = XLSX.readFile(user_file); 
                // let sheet_name_list = workbook.SheetNames; 
                // console.log(XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])) 
                //gk
                let _bulkUploadStatus = new BulkUploadStatus()
                _bulkUploadStatus.model.findOneAndUpdate(
                  { file_url: user_file },
                  { file_url: user_file, status: 'inprogress' },
                  { upsert: true },
                  (err, result) => {
                    if (err) {
                      return done(err);
                    }
                  })
                console.log(xlsData)
              }
            }

          }
          let canIDs = []
          for (let index = 0; index < xlsData.length; index++) {
            const element = xlsData[index];
            canIDs.push(element.canID)
          }
          const axios = require('axios');
          axios({
            method: 'post',
            url: 'https://custappmw.spectra.co/index.php',
            data: {
              "Action": "getDeviceToken",
              "Authkey": "AdgT68HnjC8U5S3TkehEqlkd4",
              "canId": canIDs
            }
          })
            .then(function (response1) {
              console.log(response);
              let canData = response1.data.response
              let request_data = request.body
              request_data.image_url = img_url
              request_data.pdf_url = pdf_url
              request_data.user_file = user_file
              if (user_file)
                request_data.xls_data = canData
              NotificationService.addNewNotification(request_data, (err, result) => {
                if (err) {
                  let _bulkUploadStatus = new BulkUploadStatus()
                  _bulkUploadStatus.model.findOneAndUpdate(
                    { file_url: user_file },
                    { status: "failed" },
                    (err, result) => {
                      if (err) {
                        return done(err);
                      }
                    })
                  return response.json(new Response(null, err, 400));
                  next();
                } else {
                  return response.json(new Response(null, "File Uploaded Successfully!!"));
                }
              })

            })
            .catch(function (error) {
              let _bulkUploadStatus = new BulkUploadStatus()
              _bulkUploadStatus.model.findOneAndUpdate(
                { file_url: user_file },
                { status: "failed" },
                (err, result) => {
                  if (err) {
                    return done(err);
                  }
                })
              return response.json(new Response(null, error, 400));
            });
        }
      }
    );
  }
  /**
* @swagger
* /notification/dynamicnotificationsent:
*   post:
*     tags:
*       - Notification
*     description: Sent Dynamic Notification to Users.
*     produces:
*       - application/json
*     parameters:
*       - name: X-Source
*         in: header
*         required: true
*         type: string
*         description: Source Name.
*       - name: Notification Content
*         in: body
*         required: true
*         schema:
*          $ref: '#/definitions/DynamicNotification'
*          description: Add Problem into the Admin.
*     responses:
*       200:
*         description: Returns success message
*/
  dynamicNotificationSent(request, response, next) {
    const validationSchema = ({
      device_tokens: Joi.array().required(),
      can_id: Joi.string().required(),
      pdf_url: Joi.string().optional(),
      image_url: Joi.string().optional(),
      notification_info: Joi.object({
        title: Joi.string().required(),
        sort_description: Joi.string().optional(),
        detailed_description: Joi.string().optional(),
        type: Joi.string().optional()
      }).required(),
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
          let tokenLength = request.body.device_tokens
          if (tokenLength.length) {
            NotificationService.sendDynamicPushNotification(request.body, (err, result) => {
              if (err) {
                return response.json(new Response(null, err, 400));
                next();
              } else {
                return response.json(new Response(null, "Notification Successfully!!"));
              }
            })
          } else {
            return response.json(new Response(null, "No token available", 400));
          }

        }
      }
    );
  }

  /**
* @swagger
* /notification/getallnotifications:
*   get:
*     tags:
*       - Notification
*     description: Get All Notifications List.
*     parameters:
*       - name: X-Source
*         in: header
*         required: true
*         type: string
*         description: Source Name.
*       - name: can_id
*         in: query
*         required: true
*         type: string
*         description: Can ID.
*       - name: skip
*         in: query
*         required: true
*         type: number
*         description: skip.
*       - name: limit
*         in: query
*         required: true
*         type: number
*         description: limit.
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Returns success message
*/
  getAllNotifications(request, response, next) {
    // .get("/getallnotifications?",controller.)
    const validationSchema = ({
      can_id: Joi.string().optional(),
      limit: Joi.number().optional(),
      skip: Joi.number().optional(),
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
          let user_query = request.query
          user_query.is_archieved = false
          NotificationService.getAllNotifications(user_query, (err, result, total_count) => {
            if (err) {
              return response.json(new Response(null, err, 400));
              next();
            } else {
              return response.json(new Response(result, "Notification List!!", 200, total_count));
            }
          })
        }
      }
    );
  }
  /**
* @swagger
* /notification/getnotificationsanalytics:
*   get:
*     tags:
*       - Notification
*     description: Get All Notifications List.
*     parameters:
*       - name: X-Source
*         in: header
*         required: true
*         type: string
*         description: Source Name.
*       - name: refrence_id
*         in: query
*         required: true
*         type: string
*         description: Refrence Id.
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Returns success message
*/
  getNotificationsAnalytics(request, response, next) {
    // .get("/getallnotifications?",controller.)
    const validationSchema = ({
      refrence_id: Joi.string().optional(),
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
          let user_query = request.query
          user_query.is_archieved = false
          NotificationService.getNotificationsAnalytics(user_query, (err, result) => {
            if (err) {
              return response.json(new Response(null, err, 400));
              next();
            } else {
              return response.json(new Response(result, "Notification List!!"));
            }
          })
        }
      }
    );
  }
  /**
* @swagger
* /notification/getallnotificationslist:
*   get:
*     tags:
*       - Notification
*     description: Get All Notifications List.
*     parameters:
*       - name: X-Source
*         in: header
*         required: true
*         type: string
*         description: Source Name.
*       - name: skip
*         in: query
*         required: true
*         type: number
*         description: skip.
*       - name: limit
*         in: query
*         required: true
*         type: number
*         description: limit.
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Returns success message
*/
  getAllNotificationsList(request, response, next) {
    // .get("/getallnotifications?",controller.)
    const validationSchema = ({
      // can_id: Joi.string().optional()
      limit: Joi.number().optional(),
      skip: Joi.number().optional()
    });
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
          let user_query = request.query
          user_query.is_archieved = false
          NotificationService.getAllNotificationsList(user_query, (err, result, totalCount) => {
            if (err) {
              return response.json(new Response(null, err, 400));
              next();
            } else {
              return response.json(new Response(result, "Notification List!!", 200, totalCount));
            }
          })
        }
      }
    );
  }
  /**
* @swagger
* /notification/getnotificationsbyid:
*   get:
*     tags:
*       - Notification
*     description: Get All Notifications List.
*     parameters:
*       - name: X-Source
*         in: header
*         required: true
*         type: string
*         description: Source Name.
*       - name: _id
*         in: query
*         required: true
*         type: string
*         description: Notification ID.
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Returns success message
*/
  getNotificationsByID(request, response, next) {
    // .get("/getallnotifications?",controller.)
    const validationSchema = ({
      _id: Joi.string().optional()
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
          let user_query = request.query
          user_query.is_archieved = false
          NotificationService.getAllNotificationsByID(user_query, (err, result) => {
            if (err) {
              return response.json(new Response(null, err, 400));
              next();
            } else {
              return response.json(new Response(result, "Notification List!!"));
            }
          })
        }
      }
    );
  }
  /**
* @swagger
* /notification/getbulkuploadstatus:
*   get:
*     tags:
*       - Notification
*     description: Get All Notifications List.
*     parameters:
*       - name: X-Source
*         in: header
*         required: true
*         type: string
*         description: Source Name.
*       - name: file_url
*         in: query
*         required: true
*         type: string
*         description: File Path.
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Returns success message
*/
  getBulkUploadStatus(request, response, next) {
    // .get("/getallnotifications?",controller.)
    const validationSchema = ({
      file_url: Joi.string().required()
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
          let user_query = request.query
          NotificationService.getBulkUploadStatus(user_query, (err, result) => {
            if (err) {
              return response.json(new Response(null, err, 400));
              next();
            } else {
              return response.json(new Response(result, "Notification List!!"));
            }
          })
        }
      }
    );
  }
  /**
* @swagger
* /notification/getallarchievenotifications:
*   get:
*     tags:
*       - Notification
*     description: Get All Archieve Notifications List.
*     produces:
*       - application/json
*     parameters:
*       - name: X-Source
*         in: header
*         required: true
*         type: string
*         description: Source Name.
*       - name: can_id
*         in: query
*         required: true
*         type: string
*         description: Can ID.
*       - name: skip
*         in: query
*         required: true
*         type: number
*         description: skip.
*       - name: limit
*         in: query
*         required: true
*         type: number
*         description: limit.
*     responses:
*       200:
*         description: Returns success message
*/
  getAllArchieveNotifications(request, response, next) {
    // .get("/getallarchievenotifications?",controller.)
    const validationSchema = ({
      can_id: Joi.string().optional(),
      limit: Joi.number().optional(),
      skip: Joi.number().optional(),
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
          let user_query = request.query
          user_query.is_archieved = true
          NotificationService.getAllNotifications(user_query, (err, result, total_count) => {
            if (err) {
              return response.json(new Response(null, err, 400));
              next();
            } else {
              return response.json(new Response(result, "Notification List!!", 200, total_count));
            }
          })
        }
      }
    );
  }
  /**
* @swagger
* /notification/searchnotification:
*   get:
*     tags:
*       - Notification
*     description: Sent Dynamic Notification to Users.
*     produces:
*       - application/json
*     parameters:
*       - name: X-Source
*         in: header
*         required: true
*         type: string
*         description: Source Name.
*       - name: can_id
*         in: query
*         required: true
*         type: string
*         description: Can ID.
*       - name: search_keyword
*         in: query
*         required: true
*         type: string
*         description: Search Keyword.
*     responses:
*       200:
*         description: Returns success message
*/
  searchNotification(request, response, next) {
    // .get("/searchnotification?",controller.)

    const validationSchema = ({
      can_id: Joi.string().required(),
      search_keyword: Joi.string().optional()
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
          let user_query = request.query
          // user_query.is_archieved = true
          NotificationService.searchNotifications(user_query, (err, result) => {
            if (err) {
              return response.json(new Response(null, err, 400));
              next();
            } else {
              return response.json(new Response(result, "Notification List!!"));
            }
          })
        }
      }
    );
  }

  /**
* @swagger
* /notification/deletenotifications:
*   delete:
*     tags:
*       - Notification
*     description: Sent Dynamic Notification to Users.
*     produces:
*       - application/json
*     parameters:
*       - name: X-Source
*         in: header
*         required: true
*         type: string
*         description: Source Name.
*       - name: _id
*         in: query
*         required: true
*         type: string
*         description: Notification IDs with comma seprated values.
*     responses:
*       200:
*         description: Returns success message
*/
  deleteNotifications(request, response, next) {
    // .delete("/deletemultiplenotifications?",controller.)
    const validationSchema = ({
      _id: Joi.string().required()
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
          let user_query = request.query
          NotificationService.deleteNotification(user_query, (err, result) => {
            if (err) {
              return response.json(new Response(null, err, 400));
              next();
            } else {
              return response.json(new Response(null, "Notification List Updated!!"));
            }
          })
        }
      }
    );
  }
  /**
* @swagger
* /notification/archievenotifications:
*   put:
*     tags:
*       - Notification
*     description: Sent Dynamic Notification to Users.
*     produces:
*       - application/json
*     parameters:
*       - name: X-Source
*         in: header
*         required: true
*         type: string
*         description: Source Name.
*       - name: _id
*         in: query
*         required: true
*         type: string
*         description: Notification IDs with comma seprated values.
*     responses:
*       200:
*         description: Returns success message
*/
  archieveNotifications(request, response, next) {
    // .put("/archieveonenotification?",controller.)
    const validationSchema = ({
      _id: Joi.string().required()
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
          let user_query = request.query
          NotificationService.archieveNotification(user_query, (err, result) => {
            if (err) {
              return response.json(new Response(null, err, 400));
              next();
            } else {
              return response.json(new Response(null, "Notification List Updated!!"));
            }
          })
        }
      }
    );
  }
  /**
* @swagger
* /notification/readnotifications:
*   put:
*     tags:
*       - Notification
*     description: Sent Dynamic Notification to Users.
*     produces:
*       - application/json
*     parameters:
*       - name: X-Source
*         in: header
*         required: true
*         type: string
*         description: Source Name.
*       - name: _id
*         in: query
*         required: true
*         type: string
*         description: Notification IDs with comma seprated values.
*     responses:
*       200:
*         description: Returns success message
*/
  readNotifications(request, response, next) {
    const validationSchema = ({
      _id: Joi.string().required()
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
          let user_query = request.query
          NotificationService.readNotification(user_query, (err, result) => {
            if (err) {
              return response.json(new Response(null, err, 400));
              next();
            } else {
              return response.json(new Response(null, "Notification List Updated!!"));
            }
          })
        }
      }
    );
  }
}
export default new NotificationController();
