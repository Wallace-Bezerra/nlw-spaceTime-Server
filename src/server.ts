import "dotenv/config";
import fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import { memoriesRoutes } from "./routes/memories";
import { auth } from "./routes/auth";
import { uploadRoutes } from "./routes/upload";
import { resolve } from "path";
import { publicRouter } from "./routes/public";

const app = fastify();
app.register(cors, { origin: true });
app.register(multipart);
app.register(jwt, {
  secret: "spacetime",
});
app.register(require("@fastify/static"), {
  root: resolve(__dirname, "../uploads"),
  prefix: "/uploads",
});
app.register(auth);
app.register(memoriesRoutes);
app.register(publicRouter);
app.register(uploadRoutes);
app.listen({ port: 3333 }).then(() => {
  console.log("Rodando ...");
});
// app.listen({ port: 3333, host: "192.168.100.103" }).then(() => {
//   console.log("Rodando ...");
// });
