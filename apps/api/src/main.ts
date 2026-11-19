import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { loadConfig } from "./config";

async function bootstrap() {
  const config = loadConfig();
  if (process.env.NODE_ENV === "production" && !process.env.AUTH_PEPPER) {
    throw new Error("AUTH_PEPPER must be set in production");
  }
  const app = await NestFactory.create(AppModule.register());
  app.use(cookieParser());
  app.setGlobalPrefix("v1", { exclude: ["health/(.*)"] });
  app.enableShutdownHooks();
  await app.listen(config.port);
  console.log(`Mouna API listening on http://localhost:${config.port}`);
}

void bootstrap();
