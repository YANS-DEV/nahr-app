import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "admin" | "chief" | "staff";
    restaurantId: string;
  }


  interface Session {
    user: {
      id: string;
      role: "admin" | "chief" | "staff";
      restaurantId: string;
    } & DefaultSession["user"];
  }


}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: "admin" | "chief" | "staff";
    restaurantId: string;
  }
}