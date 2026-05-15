import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { eq } from "drizzle-orm";
import { db } from "./db/index.js";
import { users } from "./db/schema.js";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = Number(process.env.PORT ?? 3005);

// GET all todos
app.get("/todos", async (_req: Request, res: Response) => {
  const allTodos = await db.select().from(users);
  res.json(allTodos);
});

// POST create a todo
app.post("/todos", async (req: Request, res: Response) => {
  if (!req.body.name) {
    return res.status(400).json({ error: "name is required" });
  }
  const [todo] = await db
    .insert(users)
    .values({ name: req.body.name, status: req.body.status ?? "pending" })
    .returning();
  res.status(201).json(todo);
});

// PUT update a todo's name
app.put("/todos/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  const [todo] = await db
    .update(users)
    .set({ name })
    .where(eq(users.id, Number(id)))
    .returning();
  res.json(todo);
});

// DELETE a todo
app.delete("/todos/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  await db.delete(users).where(eq(users.id, Number(id)));
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
