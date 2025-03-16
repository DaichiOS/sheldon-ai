// Mock for GitHub provider
const GithubProvider = jest.fn((options) => ({
  id: 'github',
  name: 'GitHub',
  type: 'oauth',
  ...options
}));

module.exports = GithubProvider;
module.exports.default = GithubProvider; 