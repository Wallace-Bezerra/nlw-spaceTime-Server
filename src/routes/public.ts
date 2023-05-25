import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function publicRouter(app: FastifyInstance) {
  app.get("/public/:id", async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = paramsSchema.parse(request.params);
    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    });
    if (!memory.isPublic) {
      return reply.status(400).send({ error: "Memoria não é publica" });
    }
    return memory;
  });
}
