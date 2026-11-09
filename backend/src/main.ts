import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody: true makes req.rawBody available — payment webhook signature
  // verification needs the exact unparsed bytes (see payment-provider.interface.ts).
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Graceful shutdown — Render sends SIGTERM on redeploy. Enabling this lets
  // NestJS drain in-flight requests before the process exits instead of
  // cutting them dead. Pairs with PrismaService/RedisService onModuleDestroy.
  app.enableShutdownHooks();

  app.use(helmet());
  app.setGlobalPrefix('api/v1', { exclude: ['health'] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Restrict CORS origins in production; allow dev/local origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:8081', 'http://127.0.0.1:3000'];

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true,
    credentials: true,
  });

  // Swagger is useful in dev/staging but should not be exposed in production
  // to avoid advertising the full API surface to unknown callers.
  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('BOOKDECK API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
