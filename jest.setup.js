
process.env.JWT_SECRET = "test-secret-key-for-jest-tests-minimum-32-characters";
process.env.JWT_EXPIRES_IN = "1h";
process.env.REFRESH_TOKEN_EXPIRES_IN = "7d";
process.env.DEFAULT_COD_EMPRESA = "1";
process.env.LOG_LEVEL = "error";

global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
