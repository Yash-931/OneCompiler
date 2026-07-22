import express from "express"
import { Queue } from "bullmq"
import { createBullBoard } from "@bull-board/api"
import { ExpressAdapter } from "@bull-board/express"
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter"
import cors from "cors"
import { prisma } from "@repo/db"

const app = express()
app.use(express.json())
app.use(cors())

const codingQueue = new Queue("code-submissions")

const expressAdapter = new ExpressAdapter()
expressAdapter.setBasePath("/admin/queues")

createBullBoard({
    queues: [new BullMQAdapter(codingQueue)],
    serverAdapter: expressAdapter
})

app.use("/admin/queues", expressAdapter.getRouter())

app.post("/submission", async (req, res) => {
    const code = req.body.code
    const language = req.body.language

    console.log("Storing submission in db")
    const submission = await prisma.submissions.create({
        data: {
            code: code,
            language: language
        }
    })
    console.log("Submission stored in db")

    await codingQueue.add("user-code", {code: code, language: language})
    return res.status(200).json({
        message: "Processing..."
    })
})

app.listen(3000)