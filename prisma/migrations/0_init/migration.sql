-- CreateTable
CREATE TABLE "logins" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "type" INTEGER NOT NULL,

    CONSTRAINT "logins_pkey" PRIMARY KEY ("id")
);

