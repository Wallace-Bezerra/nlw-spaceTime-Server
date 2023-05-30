import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { s3 } from "../config/aws";

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
    const uploadS3 = await s3.upload({
      Bucket: "nlwspacetimewallace",
      Key: filename,
      ACL: "public-read",
      Body: upload.file,
    });
    const fileUrl = (await uploadS3.promise()).Location;
    return { fileUrl };
  });
  app.delete("/upload/:id", async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string(),
    });
    const { id } = paramsSchema.parse(request.params);
    console.log(id);
    s3.deleteObject(
      {
        Bucket: "nlwspacetimewallace",
        Key: id,
      },
      (err, data) => {
        if (err) {
          console.error("Erro ao excluir a imagem:", err);
        } else {
          console.log("Imagem excluída com sucesso.");
        }
      }
    );
    return reply.status(200).send("Arquivo Deletado");
  });
}
