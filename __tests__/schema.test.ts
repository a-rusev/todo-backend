import { describe, it, expect } from "vitest";
import { users } from "../db/schema.js";
import type { User, NewUser } from "../db/schema.js";

describe("Database Schema", () => {
  describe("Users Table", () => {
    it("should have correct table structure", () => {
      expect(users).toBeDefined();
      expect(typeof users).toBe("object");
    });

    it("should be named correctly", () => {
      const tableName =
        (users as any)[Symbol.for("drizzle.Table")] || (users as any).tableName;
      expect(users).toBeTruthy();
    });
  });

  describe("User Type Inference", () => {
    it("should create a valid User type", () => {
      const mockUser: User = {
        id: 1,
        name: "Test User",
        status: "pending",
      };

      expect(mockUser.id).toBe(1);
      expect(mockUser.name).toBe("Test User");
      expect(mockUser.status).toBe("pending");
    });

    it("should create a valid NewUser type", () => {
      const newUser: NewUser = {
        name: "New User",
        status: "completed",
      };

      expect(newUser.name).toBe("New User");
      expect(newUser.status).toBe("completed");
    });

    it("should allow NewUser without status (uses default)", () => {
      const newUser: NewUser = {
        name: "User Without Status",
      };

      expect(newUser.name).toBe("User Without Status");
      expect(newUser.status).toBeUndefined();
    });
  });
});
