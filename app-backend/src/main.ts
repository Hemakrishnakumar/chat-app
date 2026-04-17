import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { WebSocketAdapter } from './infrastructure/websocket/websocket.adapter';
import * as webpush from 'web-push';


async function bootstrap() {
  console.log( process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY)
    webpush.setVapidDetails(
    'mailto:krish.jayavarapu@gmail.com',
    'BCCKdWlm-U56vXr4hMT8DctwetauMi6z_GSSyr-LgkZtBuf-aIRaWIm6eW9EAAITJp3gc1Qj5r1huoIhz397B7I',
    process.env.VAPID_PRIVATE_KEY!,
  );

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
