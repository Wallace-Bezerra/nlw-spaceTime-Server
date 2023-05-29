import { randomUUID } from "node:crypto";
import { extname, resolve } from "node:path";
import { FastifyInstance } from "fastify";
import { createWriteStream, unlink } from "node:fs";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { z } from "zod";

const pump = promisify(pipeline);
export async function uploadRoutes(app: FastifyInstance) {
  app.post("/upload", async (request, reply) => {
    const upload = await request.file({
      limits: {
        fileSize: 52_428_800, // 5mb
      },
    });
    if (!upload) {
      return reply.status(400).send();
    }
    const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/;
    const isValidFileFormat = mimeTypeRegex.test(upload.mimetype);
    if (!isValidFileFormat) {
      return reply.status(400).send("Formato de mídia invalido");
    }
    const fileId = randomUUID();
    const extension = extname(upload.filename);
    const filename = fileId.concat(extension);

    const writeStream = createWriteStream(
      resolve(__dirname, "../../uploads/", filename)
    );
    await pump(upload.file, writeStream);
    const fullUrl = request.protocol.concat("://").concat(request.hostname);
    const fileUrl = new URL(`/uploads/${filename}`, fullUrl).toString();
    return { fileUrl };
  });
  app.delete("/upload/:id", async (request, reply) => {
    // const upload = await request.file();
    const paramsSchema = z.object({
      id: z.string(),
    });
    const { id } = paramsSchema.parse(request.params);
    unlink(`./uploads/${id}`, (err) => {
      if (err) {
        return reply.status(400);
      }
    });
    return reply.status(200).send("Arquivo Deletado");
  });
}
