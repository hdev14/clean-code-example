import { PrismaClient } from "@prisma/client";

let con: PrismaClient;

export default function getCon() {
  if (con) {
    return con;
  }

  return new PrismaClient();
}