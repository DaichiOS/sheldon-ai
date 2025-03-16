// Mock for next-auth
const nextAuth = jest.fn(() => ({
  handlers: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
  signIn: jest.fn(),
  signOut: jest.fn(),
  auth: jest.fn(),
}));

module.exports = nextAuth;
module.exports.default = nextAuth;

// Mock providers
module.exports.GithubProvider = jest.fn(() => ({
  id: 'github',
  name: 'GitHub',
  type: 'oauth',
})); 