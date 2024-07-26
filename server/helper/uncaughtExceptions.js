import Config from "config";
import logger from "./logger";

export class UncaughtException {
  constructor() {
    if (process.env.NODE_ENV === "production") {
      process.on("uncaughtException", function(er) {
        console.error("=>>>>>>>>>>>>>>>", er.stack);
        const mailOptions = {
          from: Config.get("mailFrom"),
          to: Config.get("adminEmail"),
          subject: `PRODUCTION | ERROR | ${er.message}`,
          text: er.stack
        };
        
      });
    }
  }
}
export default new UncaughtException();
