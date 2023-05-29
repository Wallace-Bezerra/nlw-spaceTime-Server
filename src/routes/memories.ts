import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";

export async function memoriesRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request) => {
    await request.jwtVerify();
  });

  app.get("/memories", async (request) => {
    const memories = await prisma.memory.findMany({
      where: {
        userId: request.user.sub,
      },
      orderBy: { date: "desc" },
    });
    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt:
          memory.content.length >= 118
            ? memory.content.substring(0, 118).concat("...")
            : memory.content,
        date: memory.date,
        // createdAt: memory.createdAt,
      };
    });
  });

  app.get("/memories/:id", async (request, reply) => {
    // const { id } = request.params;
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = paramsSchema.parse(request.params);
    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    });
    if (!memory.isPublic && memory.userId !== request.user.sub) {
      return reply.status(401).send();
    }
    return memory;
  });

  app.post("/memories", async (request) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
      date: z.string(),
    });
    const { content, coverUrl, isPublic, date } = bodySchema.parse(
      request.body
    );
    const newMemory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: request.user.sub,
        date,
      },
    });
    return newMemory;
  });

  app.put("/memories/:id", async (request, reply) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
      date: z.string(),
    });
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = paramsSchema.parse(request.params);
    const { content, coverUrl, isPublic, date } = bodySchema.parse(
      request.body
    );
    let UpdateMemory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    });
    if (UpdateMemory.userId !== request.user.sub) {
      return reply.status(401).send();
    }
    UpdateMemory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        isPublic,
        date,
      },
    });
    return UpdateMemory;
  });

  app.delete("/memories/:id", async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = paramsSchema.parse(request.params);
    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    });
    if (memory.userId !== request.user.sub) {
      return reply.status(401).send();
    }
    await prisma.memory.delete({
      where: {
        id,
      },
    });
  });
}
