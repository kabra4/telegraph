import winston, { format } from "winston";

export class Logger {
    private static instance: Logger;
    private logger: winston.Logger;

    private constructor() {
        this.logger = winston.createLogger({
            level: "info",
            format: format.combine(
                format.timestamp(),
                format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} ${level}: ${message}`;
                })
            ),
            transports: [
                new winston.transports.File({
                    filename: "./logs/error.log",
                    level: "error",
                }),
                new winston.transports.File({ filename: "./logs/combined.log" }),
                new winston.transports.Console(),
            ],
        });
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public info(message: string): void {
        this.logger.log("info", message);
    }

    public error(error: unknown): void {
        let message = "";
        if (error instanceof Error) {
            message = error.message;
        } else {
            message = JSON.stringify(error);
        }
        this.logger.log("error", message);
    }
}
