import { User } from "../entities/User";
import { MyContext } from "../types";
import { Arg, Ctx, Field, Mutation, ObjectType, Resolver } from "type-graphql";
import bcrypt from "bcrypt";

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("username", () => String) username: string,
    @Arg("password", () => String) password: string,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "Username needs to be longer than two characters.",
          },
        ],
      };
    }

    if (password.length < 8) {
      return {
        errors: [
          {
            field: "password",
            message: "Password needs to be at least eight characters long.",
          },
        ],
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = em.create(User, {
      username,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      if (err.code === "23505" || err.detail.includes("already exists")) {
        return {
          errors: [
            {
              field: "username",
              message: "Username is already taken.",
            },
          ],
        };
      }
    }
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("username", () => String) username: string,
    @Arg("password", () => String) password: string,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {
      username,
    });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "Could not find that username.",
          },
        ],
      };
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect password.",
          },
        ],
      };
    }
    return {
      user,
    };
  }
}
