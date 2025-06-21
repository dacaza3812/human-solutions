import { PrismaClient } from "@prisma/client"

// Declare a global variable for PrismaClient to prevent multiple instances in development
declare global {
  var prismadbGlobal: PrismaClient | undefined
}

const prismadb = global.prismadbGlobal || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  global.prismadbGlobal = prismadb
}

export default prismadb
