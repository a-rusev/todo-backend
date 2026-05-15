# Testing Guide - Todo App Backend

## Overview
The backend includes comprehensive unit tests using **Vitest**, a modern testing framework with excellent ES module support.

## Test Setup

### Test Framework
- **Vitest** - Fast unit testing framework optimized for TypeScript/ES modules
- **Supertest** - HTTP assertion library for testing Express endpoints
- **Coverage Provider** - V8 for code coverage reporting

### Running Tests

```bash
# Run tests once
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# Run tests with UI dashboard
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Files

### 1. `__tests__/todos.test.ts` - API Endpoint Tests
Tests for all HTTP endpoints:

**GET /todos**
- Returns all todos from database
- Returns empty array when no todos exist

**POST /todos**
- Creates a new todo with default status "pending"
- Allows custom status when provided
- Returns 400 error when `name` is missing
- Returns 400 error when `name` is empty
- Returns 400 error when request body is empty

**PUT /todos/:id**
- Updates a todo's name
- Handles numeric ID conversion from URL params

**DELETE /todos/:id**
- Deletes a todo by ID
- Handles different ID values

### 2. `__tests__/schema.test.ts` - Database Schema Tests
Tests for the Drizzle ORM schema:

- Validates table structure
- Tests User type inference
- Tests NewUser type inference
- Verifies default values in schema

## Test Architecture

### Mocking Strategy
- Database calls are mocked using `vi.mock()` and `vi.fn()`
- Tests don't require a real database connection
- Drizzle ORM methods are mocked: `select()`, `insert()`, `update()`, `delete()`

### Test Structure
Each test suite follows this pattern:
```typescript
import { describe, it, beforeEach, expect, vi } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something', async () => {
    // Arrange
    const mockData = { /* ... */ };

    // Mock database call
    mockDb.method.mockReturnValue({
      chainedMethod: vi.fn().mockResolvedValue(mockData),
    });

    // Act
    const response = await request(app).get('/endpoint');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockData);
  });
});
```

## Coverage Report

Current test coverage:
- **Statements**: 100%
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%

## Configuration Files

### `vitest.config.ts`
- Configures Vitest for Node.js environment
- Sets up V8 coverage provider
- Excludes node_modules and generated files

### `tsconfig.json`
- Updated for ES module compatibility
- Includes Jest types for testing
- Module resolution configured for bundler compatibility

## Adding New Tests

To add tests for new endpoints:

1. Create a new test suite in `__tests__/todos.test.ts`
2. Mock the database calls using `vi.mock()`
3. Test both happy path and error cases
4. Use `request(app)` from supertest to make HTTP assertions

Example:
```typescript
it('should handle error case', async () => {
  // Mock error scenario
  mockDb.select.mockRejectedValue(new Error('DB Error'));

  const response = await request(app).get('/todos');

  expect(response.status).toBe(500);
});
```

## Best Practices

- Keep mocks as close as possible to real behavior
- Test both success and failure scenarios
- Use descriptive test names
- Group related tests with `describe()` blocks
- Clear mocks between tests with `beforeEach()`
- Verify both response status and body content
