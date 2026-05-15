import { describe, it, beforeEach, expect, vi } from "vitest";
import request from "supertest";
import { app } from "../index.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

vi.mock("../db/index.js");

describe("Todo API Endpoints", () => {
  const mockDb = db as ReturnType<typeof vi.mocked>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /todos", () => {
    it("should return all todos", async () => {
      const mockTodos = [
        { id: 1, name: "Test Todo 1", status: "pending" },
        { id: 2, name: "Test Todo 2", status: "completed" },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockResolvedValue(mockTodos),
      } as any);

      const response = await request(app).get("/todos");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTodos);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it("should return empty array when no todos exist", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockResolvedValue([]),
      } as any);

      const response = await request(app).get("/todos");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("POST /todos", () => {
    it("should create a new todo with default status", async () => {
      const newTodo = { id: 1, name: "New Todo", status: "pending" };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([newTodo]),
        }),
      } as any);

      const response = await request(app)
        .post("/todos")
        .send({ name: "New Todo" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(newTodo);
      expect(mockDb.insert).toHaveBeenCalledWith(users);
    });

    it("should create a todo with custom status", async () => {
      const newTodo = { id: 1, name: "New Todo", status: "completed" };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([newTodo]),
        }),
      } as any);

      const response = await request(app)
        .post("/todos")
        .send({ name: "New Todo", status: "completed" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(newTodo);
    });

    it("should return 400 when name is missing", async () => {
      const response = await request(app)
        .post("/todos")
        .send({ status: "pending" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "name is required" });
    });

    it("should return 400 when name is empty", async () => {
      const response = await request(app).post("/todos").send({ name: "" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "name is required" });
    });

    it("should return 400 when body is empty", async () => {
      const response = await request(app).post("/todos").send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "name is required" });
    });
  });

  describe("PUT /todos/:id", () => {
    it("should update a todo name", async () => {
      const updatedTodo = { id: 1, name: "Updated Todo", status: "pending" };

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedTodo]),
          }),
        }),
      } as any);

      const response = await request(app)
        .put("/todos/1")
        .send({ name: "Updated Todo" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedTodo);
      expect(mockDb.update).toHaveBeenCalledWith(users);
    });

    it("should handle numeric ID conversion", async () => {
      const updatedTodo = { id: 42, name: "Updated", status: "pending" };

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedTodo]),
          }),
        }),
      } as any);

      const response = await request(app)
        .put("/todos/42")
        .send({ name: "Updated" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedTodo);
    });
  });

  describe("DELETE /todos/:id", () => {
    it("should delete a todo", async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      const response = await request(app).delete("/todos/1");

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      expect(mockDb.delete).toHaveBeenCalledWith(users);
    });

    it("should handle delete for different IDs", async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      const response = await request(app).delete("/todos/99");

      expect(response.status).toBe(204);
      expect(mockDb.delete).toHaveBeenCalledWith(users);
    });
  });
});
