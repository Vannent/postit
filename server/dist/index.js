"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@mikro-orm/core");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const hello_1 = require("./resolvers/hello");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const redis_1 = __importDefault(require("redis"));
const main = async () => {
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
    orm.getMigrator().up();
    const app = (0, express_1.default)();
    const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    const redisClient = redis_1.default.createClient();
    app.use((0, express_session_1.default)({
        store: new RedisStore({ client: redisClient }),
        secret: "keyboard cat",
        resave: false,
    }));
    let apolloServer = null;
    const startServer = async () => {
        apolloServer = new apollo_server_express_1.ApolloServer({
            schema: await (0, type_graphql_1.buildSchema)({
                resolvers: [hello_1.HelloResolver, post_1.PostResolver, user_1.UserResolver],
                validate: false,
            }),
            context: () => ({ em: orm.em }),
        });
        await apolloServer.start();
        apolloServer.applyMiddleware({ app });
    };
    startServer();
    app.use((_, __, next) => {
        core_1.RequestContext.create(orm.em, next);
    });
    app.listen(4000, () => {
        console.log("Server started on localhost:4000");
    });
};
main().catch((err) => {
    console.error(err);
});
//# sourceMappingURL=index.js.map