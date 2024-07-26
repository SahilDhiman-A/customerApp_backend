import multer from 'multer';
import Boom from 'boom';
import path from 'path';
import Config from "config";

const fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const root = path.normalize(`${__dirname}/../..`);
const gcs = new Storage({
    projectId: 'affle-projects',
    keyFilename: path.resolve(`${root}/config/affle-projects-c657a0711edd.json`)
});
const bucket = gcs.bucket('digitalmallofasia');
var stream = require('stream');

// const ID = AWSKeys.ID;
// const SECRET = AWSKeys.SECRET;
// const BUCKET_URL = AWSKeys.BUCKET_URL;
// const BUCKET_NAME = AWSKeys.BUCKET_NAME;
// const s3 = new AWS.S3({
//   accessKeyId: ID,
//   secretAccessKey: SECRET
// });

export class FileUploader {
    constructor() {
        this.uploadFile = this.uploadFile.bind(this);
    }
    /**
     * @param  {} fileName
     * @param  {} base64data
     */
    uploadFile(fileName,base64data) {
          //Define file & file name.
          var bufferStream = new stream.PassThrough();
          bufferStream.end(Buffer.from(base64data, 'base64'));

          var file = bucket.file(fileName);
          //Pipe the 'bufferStream' into a 'file.createWriteStream' method.
          bufferStream.pipe(file.createWriteStream({
              
              public: true,
              validation: "md5"
            }))
            .on('error', function(err) {
                console.log("Error")})
            .on('finish', function(data) {
                console.log("finish")
                return `https://storage.googleapis.com/digitalmallofasia/${fileName}`
              // The file upload is complete.
            });
        // const params = {
        //     Bucket: BUCKET_NAME,
        //     Key: fileName,
        //     Body: base64data
        //   };
        //   s3.upload(params, function(err, data) {
        //       if (err) {
        //           throw err;
        //       }
        //       console.log(`File uploaded successfully. ${data.Location}`);
        //   });
        //   return `${BUCKET_URL}${fileName}`

        // bucket.upload('/home/gaurav/Downloads/archive.mp4', function(err, file) {
        //     if (err) throw new Error(err);
        //     let url= `https://storage.googleapis.com/ejobbing-images/archive.mp4`
        // });
    }
}


export default new FileUploader(10);