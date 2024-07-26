export class AuthorizationController {
    authorizeUser(request, response, next) {
        console.log("in authorize user")
        if(!request.decoded.userId){
            return response.status(401).json({
                message : "Unauthorized.UserId not found",
                statusCode : 401
            })
        }
        let role = request.decoded.role;
        if(role == "student"){
            next();
        }else{
            return response.status(401).json({
                message : "Unauthorized",
                statusCode : 401
            })
        }
    }

    authorizeRoles(request, response, next, roles) {

        if(roles && roles.length && roles.includes(request.decoded.role)){
            next();
        }else{
            return response.status(401).json({
                message : "Unauthorized",
                statusCode : 401
            })
        }
    }
}

export default new AuthorizationController();
