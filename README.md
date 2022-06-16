# Tasks Manager

A REST Api built using NestJS, TypeORM and PostgreSQL

### Tech Stack:

- NestJS
- TypeORM
- PostgreSQL
- Bcrypt for hashing passwords
- Passportjs for JWT management

### SETUP - Database system:

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

### SETUP - JWT Integration using Passportjs:

- Install dependencies: `npm i @nestjs/jwt @nestjs/passport passport passport-jwt @types/passport-jwt`
- Add passportjs and jwt imports to `auth.module.ts`
  ```
  @Module({
    imports: [
      PassportModule.register({ defaultStrategy: 'jwt' }),  // 🟢 This
      JwtModule.register({  // 🟢 This
        secret: 'secretcode',
        signOptions: {
          expiresIn: 3600, // 1 hour
        },
      }),
      TypeOrmModule.forFeature([User]),
    ],
    providers: [AuthService],
    controllers: [AuthController],
  })
  export class AuthModule {}
  ```
- Add JwtService to `auth.service.ts`:
  ```
  @Injectable()
  export class AuthService {
    constructor(
      @InjectRepository(User)
      private userRepository: Repository<User>,
      private jwtService: JwtService // 🟢 This
    ) {}
  ```
- Create the JwtStrategy in `jwt.strategy.ts`:

  ```
  @Injectable()
  export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
      @InjectRepository(User)
      private userRepository: Repository<User>,
    ) {
      super({
        secretOrKey: 'secretcode',
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      });
    }

    async validate(jwtPayload: JwtPayload): Promise<User> {
      const { username } = jwtPayload;

      const user: User = await this.userRepository.findOne({
        where: { username },
      });
      if (!user) {
        throw new UnauthorizedException();
      }

      return user;
    }
  }
  ```

- Add further imports and providers
  ```
  @Module({
    imports: [
      PassportModule.register({ defaultStrategy: 'jwt' }),
      JwtModule.register({
        secret: 'secretcode',
        signOptions: {
          expiresIn: 3600, // 1 hour
        },
      }),
      TypeOrmModule.forFeature([User]),
    ],
    providers: [AuthService, JwtStrategy], // 🟢 This
    controllers: [AuthController],
    exports: [JwtStrategy, PassportModule] // 🟢 This
  })
  export class AuthModule {}
  ```
- Create a guard that grabs user from the request body `get-user.decorator.ts`:

  ```
  export const GetUser = createParamDecorator(
    (_data: never, ctx: ExecutionContext): User => {
      // Grab the request body
      const request = ctx.switchToHttp().getRequest();

      return request.user;
    },
  );
  ```

- Import the AuthModule to the target module
  Inside `tasks.module.ts`
  ```
  @Module({
    imports: [TypeOrmModule.forFeature([Task]), AuthModule], // 🟢 This
    controllers: [TasksController],
    providers: [TasksService],
  })
  export class TasksModule {}
  ```
- Apply the guard to the target controller/route:
  Inside `tasks.controller.ts`

  ```
  @Controller('tasks')
  @UseGuards(AuthGuard()) // 🟢 This
  export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  getTasks(@Query() filterDto: GetTasksFilterDto): Promise<Task[]> {
    return this.tasksService.getTasks(filterDto);
  }
  ```

### SETUP - Environment Variables:

- Install dependencies `npm i @nestjs/config cross-env @hapi/joi`, `npm i -D @types/hapi__joi`
- Define validation schema inside `src/config.schema.ts`:

  ```
  import * as Joi from '@hapi/joi';

  export const configValidationSchema = Joi.object({
    STAGE: Joi.string().required(),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
  });
  ```

- Define env variables:
  ```
  DB_HOST=localhost
  DB_PORT=5432
  DB_USERNAME=postgres
  DB_PASSWORD=dd38c64f-b686-4282-a3c0-97b933a064ef
  DB_DATABASE=tasks-dev
  JWT_SECRET=9716da1d-bf67-411a-81d2-c1802f800233
  ```
- Import ConfigModule inside `app.module.ts`:
  ```
  @Module({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: [`.env.stage.${process.env.STAGE}`],
        validationSchema: configValidationSchema,
      }),
      .
      .
      .
  ```
- Replace TypeOrmModule.forRoot with TypeOrmModule.forRootAsync inside `app.module.ts`:
  ```
  TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
  ```
- Update scripts in `package.json`:
  ```
  "start:dev": "cross-env STAGE=dev nest start --watch",
  "start:debug": "cross-env STAGE=dev nest start --debug --watch",
  "start:prod": "cross-env STAGE=prod node dist/main",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "test": "cross-env STAGE=dev jest",
  ```
- To use the JWT_SECRET env var:
  - Replace JwtModule.register() with JwtModule.registerAsync() inside `auth.module.ts`:
    ```
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: 3600, // 1 hour
        },
      }),
    }),
    ```
  - Consume the env var inside `jwt.strategy.ts`:
    ```
    @Injectable()
    export class JwtStrategy extends PassportStrategy(Strategy) {
      constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private configService: ConfigService,
      ) {
        super({
          secretOrKey: configService.get('JWT_SECRET'),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
      }
    ```
