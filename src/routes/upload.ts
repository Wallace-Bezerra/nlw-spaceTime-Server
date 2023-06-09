import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { FastifyInstance } from "fastify";
import { z } from "zod";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../config/firebase";

export async function uploadRoutes(app: FastifyInstance) {
  app.post("/upload", async (request, reply) => {
    const upload = await request.file({
      limits: {
        fileSize: 52_428_800, // 50mb
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

    const storageRef = ref(storage, `uploads/${filename}`);
    await uploadBytesResumable(storageRef, await upload.toBuffer());
    const fileUrl = await getDownloadURL(storageRef);
    return { fileUrl };
  });

  app.delete("/upload/:id", async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string(),
    });
    const { id } = paramsSchema.parse(request.params);
    console.log(id);
    const deleteRef = ref(storage, `uploads/${id}`);
    await deleteObject(deleteRef);
    return reply.status(200).send("Arquivo Deletado");
  });
}
