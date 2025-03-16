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
