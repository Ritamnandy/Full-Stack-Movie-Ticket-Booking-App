

import { Queue } from "bullmq";
import { connection } from "../redis/redis.connect";
import { QUEUE_NAME, SECOND_QUEUE_NAME } from "../constants";

const defaultJobOptions = {
    attempts: 3,
    backoff: {
        type: "exponential",
        delay: 5000
    },
    removeOnComplete: { count: 1000 }, // keep last 1000, don't grow forever
    removeOnFail: { count: 1000 }
}

const FirstQueue = new Queue( QUEUE_NAME, {
    connection: {
        url: connection.url
    },
    defaultJobOptions
} )

const SecondQueue = new Queue( SECOND_QUEUE_NAME, {
    connection: {
        url: connection.url
    },
    defaultJobOptions
} )

export { FirstQueue, SecondQueue }