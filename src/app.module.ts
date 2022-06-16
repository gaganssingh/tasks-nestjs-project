import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TasksModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'dd38c64f-b686-4282-a3c0-97b933a064ef',
      database: 'tasks-dev',
      autoLoadEntities: true,
      synchronize: true, // 🚫 DON'T USE DURING PRODUCTION
    }),
    AuthModule,
  ],
})
export class AppModule {}
