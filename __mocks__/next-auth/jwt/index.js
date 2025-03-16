// Mock for next-auth/jwt
module.exports = {
  // Add any functions from next-auth/jwt that your code uses
  getToken: jest.fn(),
  decode: jest.fn(),
  encode: jest.fn(),
};

// Export the JWT type
module.exports.JWT = {}; 