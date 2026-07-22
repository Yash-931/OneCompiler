import { Job, Worker } from "bullmq";

const worker = new Worker(
  "code-submissions",
  async (job: Job) => {
    console.log(job.data);
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  },
);
