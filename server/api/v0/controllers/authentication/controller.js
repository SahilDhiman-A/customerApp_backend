import Joi from "joi";
import Async from "async";
import Response from "../../../../models/response";
import jwt from "jsonwebtoken";
import Config from "config";
import moment from "moment";

export class AuthenticationController {
    verifyToken(request, response, next) {
        var token = request.headers['x-access-token'] || request.headers['authorization'];
        if (token) {
            if (token.startsWith('Bearer ')) {
                token = token.slice(7, token.length); // Remove Bearer from string
            }
            jwt.verify(token, Config.get("jwtsecret"), function(err, decoded) {      
                if(err) {
                    console.log("verify-token jwt.verify : ",err);
                    return response.status(401).json({
                        data : err,
                        message : "Failed to authenticate token",
                        statusCode : 401
                    })
                }else {
                    request.decoded = decoded;  
                    next();
                }
            });
        } else {
            return response.status(403).json({
                data : {},
                message : "No token provided.",
                statusCode : 403
            })
        }
    }
}

export default new AuthenticationController();
