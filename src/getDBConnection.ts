import { PrismaClient } from "@prisma/client";

let connection: PrismaClient;

export default function getDBConnection() {
  if (connection) {
    return connection;
  }

  connection = new PrismaClient();

  return connection;
}