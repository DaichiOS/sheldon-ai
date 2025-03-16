# Authentication Tests

This directory contains tests for the authentication system.

## Test Structure

The tests in this directory focus on the authentication functionality defined in `src/auth.ts`, including:

- JWT token handling
- Session management
- Token refresh mechanism
- Error handling

## Writing Auth Tests

When writing tests for authentication, follow these principles:

1. **Test one behavior at a time**: Each test should verify a single aspect of the authentication system.
2. **Use the Arrange-Act-Assert pattern**:

   - Arrange: Set up the test data and mocks
   - Act: Call the function being tested
   - Assert: Verify the results

3. **Mock external dependencies**: Use Jest's mocking capabilities to simulate GitHub API responses.

4. **Test both success and failure cases**: Ensure your authentication system handles errors gracefully.

## Example Test Structure

```typescript
import { functionToTest } from "../../src/auth";

describe("Authentication Feature", () => {
  test("should behave in a certain way when conditions are met", () => {
    // Arrange
    const testInput = {
      /* test data */
    };

    // Act
    const result = functionToTest(testInput);

    // Assert
    expect(result).toEqual(/* expected output */);
  });
});
```

## Running Tests

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Test Coverage

Aim for comprehensive test coverage of the authentication system, including:

- Initial token creation during sign-in
- Token refresh when expired
- Handling missing refresh tokens
- Handling API errors during refresh
- Session data availability to components

## Setting Up Mocks for NextAuth.js

When testing authentication with NextAuth.js, you'll need to set up proper mocks to avoid ESM import errors and provide test implementations.

### Why Mocks Are Needed

NextAuth.js uses ES Modules syntax, but Jest runs in CommonJS mode by default. This causes the error:

```
SyntaxError: Cannot use import statement outside a module
```

### Mock Directory Structure

Create the following directory structure:

```
__mocks__/
├── next-auth/
│   ├── index.js             # Main NextAuth module mock
│   ├── jwt/
│   │   └── index.js         # JWT functions mock
│   └── providers/
│       └── github.js        # GitHub provider mock
```

### Mock Implementation Examples

#### `__mocks__/next-auth/index.js`

```javascript
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
  id: "github",
  name: "GitHub",
  type: "oauth",
}));
```

#### `__mocks__/next-auth/jwt/index.js`

```javascript
// Mock for next-auth/jwt
module.exports = {
  getToken: jest.fn(),
  decode: jest.fn(),
  encode: jest.fn(),
};

// Export the JWT type
module.exports.JWT = {};
```

#### `__mocks__/next-auth/providers/github.js`

```javascript
// Mock for GitHub provider
const GithubProvider = jest.fn((options) => ({
  id: "github",
  name: "GitHub",
  type: "oauth",
  ...options,
}));

module.exports = GithubProvider;
module.exports.default = GithubProvider;
```

### Using Mocks in Tests

In your test files, add these lines to use the mocks:

```typescript
// Mock the modules
jest.mock("next-auth", () => ({}));
jest.mock("next-auth/jwt", () => ({}));
```

### Handling Type Issues

When testing with TypeScript, you might encounter type compatibility issues. Use type assertions to bypass these:

```typescript
// Example of using type assertion to bypass type checking
const result = await jwtCallback({
  token: mockToken,
  account: mockAccount as any,
  user: mockUser,
});
```

This approach allows you to test the behavior of your authentication functions without worrying about the exact types expected by NextAuth.js.
