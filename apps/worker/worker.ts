import { Job, Worker } from "bullmq";
import { spawn } from "child_process";
import fs from "fs";
import { prisma } from "@repo/db";
import { exitCode } from "process";

const worker = new Worker(
  "code-submissions",
  async (job: Job) => {
    const id = job.data.id;
    const language = job.data.language;
    const code = job.data.code;

    //run users code and show it on the UI (prefer to run the code in a sandbox environment)
    let finalOutput = "";

    if (language === "js") {
      const filePath = __dirname + "/codes/a.js";
      fs.writeFileSync(filePath, code);

      const response = spawn("node", [filePath]);
      response.stdout.on("data", (data) => {
        console.log(data.toString());
      });

      await new Promise<void>((resolve) => {
        response.on("exit", async (exitCode) => {
          await prisma.submissions.update({
            where: { id: id },
            data: {
              output: finalOutput.toString(),
              status: exitCode === 0 ? "SUCCESS" : "FAILURE",
            },
          });
          resolve();
        });
      });
    }

    if (language === "py") {
      const filePath = __dirname + "/codes/a.py";
      fs.writeFileSync(filePath, code);
      const response = spawn("python3", [filePath]);

      response.stdout.on("data", async (data) => {
        console.log(data.toString());
      });

      await new Promise<void>((resolve) => {
        response.on("exit", async (exitCode) => {
          await prisma.submissions.update({
            where: { id: id },
            data: {
              output: finalOutput.toString(),
              status: exitCode === 0 ? "SUCCESS" : "FAILURE"
            },
          });
          resolve();
        });
      });
    }

    if (language === "cpp") {
      const filePath = __dirname + "/codes/a.cpp";
      fs.writeFileSync(filePath, code);
      console.log(filePath);
      spawn("g++", [filePath, "-o", "./codes/out"]);
      await new Promise((r) => setTimeout(r, 2000));

      const response = spawn("./codes/out");
      response.stdout.on("data", (data) => {
        finalOutput += data.toString();
        console.log(data.toString());
      });

      await new Promise<void>((resolve) => {
        response.on("exit", async (exitCode) => {
          await prisma.submissions.update({
            where: { id: id },
            data: {
              output: finalOutput.toString(),
              status: exitCode === 0 ? "SUCCESS" : "FAILURE"
            },
          });
          resolve();
        });
      });
    }
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  },
);
