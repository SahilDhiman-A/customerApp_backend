var request = require("request");
var base_url = "http://localhost:3001/"

describe("Test Server", function() {
  describe("GET /", function() {
    it("returns status code 200", function(done) {
      request.get(base_url + 'v0/test/getresponse' , function(error, response, body) {
        expect(response.statusCode).toBe(200);
        done();
      });
    });

    it("returns Test Executed Successfully", function(done) {
      request.get(base_url + 'v0/test/getresponse', function(error, response, body) {
        let res = JSON.parse(body)
        expect(res.message).toBe("Test Executed Successfully!!");
        done();
      });
    });
  });
});