# Tasks Manager

A REST Api built using NestJS, TypeORM and PostgreSQL

### SETUP

- Docker - PostgreSQL - pgAdmin4 Setup:
  - Rename `example.docker-compose.yml` to `docker-compose.yml`.
  - Add database, user and connection information inside the `docker-compose.yml` file.
  - Run `docker-compose up`
  - Access pgAdmin4 at `http://localhost:5050`
- NestJS - TypeORM Setup to connect to postgres
  - Install deps: `npm i typeorm @nestjs/typeorm pg`
  - Configure TypeORM and point it to the db: `app.module.ts`
    ```
    @Module({
      imports: [
        TasksModule,
        TypeOrmModule.forRoot({
          type: "postgres",
          host: "localhost",
          port: 5432,
          username: "postgres",
          password: "dd38c64f-b686-4282-a3c0-97b933a064ef",
          database: "tasks-dev",
          autoLoadEntities: true,
          synchronize: true // 🚫 DON'T USE DURING PRODUCTION
        })
      ],
    })
    ```
