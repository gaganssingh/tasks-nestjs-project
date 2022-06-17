import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './transform.interceptor';

async function bootstrap() {
  const logger = new Logger();

  const app = await NestFactory.create(AppModule);

  // ENABLE CORS
  // ⚠️NOT SUITABLE FOR REAL APPS⚠️
  // ⚠️REAL APPS MUST BE PROVIDES PROPER CORS CONFIGS⚠️
  app.enableCors();

  // Validation Pipe
  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalInterceptors(new TransformInterceptor());

  const PORT = process.env.PORT;
  await app.listen(PORT);
  logger.log(`Application listening on port ${PORT}`);
}
bootstrap();
