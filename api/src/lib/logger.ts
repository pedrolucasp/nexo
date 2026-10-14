import pino from "pino";

// Pretty only on a TTY: in a container stdout is a pipe, so emit plain
// single-line JSON that the log collector can parse
const pretty = process.env.NODE_ENV !== "production" && process.stdout.isTTY;

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  ...(pretty && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        singleLine: false,
        messageFormat: "{if levelLabel}{levelLabel} - {end}{msg}",
      },
    },
  }),
});
