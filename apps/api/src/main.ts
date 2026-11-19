import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { loadConfig } from "./config";

async function bootstrap() {
  const config = loadConfig();
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("v1", { exclude: ["health/(.*)"] });
  app.enableShutdownHooks();
  await app.listen(config.port);
  console.log(`Mouna API listening on http://localhost:${config.port}`);
}

void bootstrap();
