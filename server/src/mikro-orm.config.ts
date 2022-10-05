import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    glob: "!(*.d).{js,ts}",
  },
  dbName: "postit",
  user: "postgres",
  password: "1234",
  debug: !__prod__,
  type: "postgresql",
  entities: [Post],
} as Parameters<typeof MikroORM.init>[0];
