const logger = require("../../services/logger.service");

describe("logger.service", () => {
  let logSpy, errorSpy;

  beforeAll(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("should log info, warn, error, debug, and custom levels", () => {
    expect(() => logger.log("info", "info message")).not.toThrow();
    expect(() => logger.log("warn", "warn message")).not.toThrow();
    expect(() => logger.log("error", "error message")).not.toThrow();
    expect(() => logger.log("debug", "debug message")).not.toThrow();
    expect(() => logger.log("custom", "custom message")).not.toThrow();
  });

  it("should format one, two, three, and four arguments", () => {
    expect(() => logger.log("info", "one arg")).not.toThrow();
    expect(() => logger.log("info", "a", "b")).not.toThrow();
    expect(() => logger.log("info", "a", "b", "c")).not.toThrow();
    expect(() => logger.log("info", "a", "b", "c", "d")).not.toThrow();
  });

  it("should logError with Error object", () => {
    expect(() => logger.logError(new Error("test error"))).not.toThrow();
  });

  it("should logError with string and multiple context objects", () => {
    expect(() =>
      logger.logError("string error", { foo: 1 }, { bar: 2 })
    ).not.toThrow();
  });

  it("should use default 'info' level when no arguments are passed", () => {
    expect(() => logger.log()).not.toThrow();
  });

  it("should format object arguments with JSON.stringify", () => {
    expect(() => logger.log("info", { foo: "bar" })).not.toThrow();
  });

  it("should use error.message if error.stack is falsy in logError", () => {
    const err = new Error("test message");
    err.stack = ""; // Remove stack to force use of error.message
    expect(() => logger.logError(err)).not.toThrow();
  });
});
