import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { WebSocketAdapter } from './infrastructure/websocket/websocket.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // Add cookie parser middleware
  app.use(cookieParser());

  // Use custom WebSocket adapter
  app.useWebSocketAdapter(new WebSocketAdapter(app));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
