import os from "node:os";

export const serverConfig = {
    port: Number( process.env.PORT ) || 4000,
    workers: Number( process.env.WEB_CONCURRENCY ) || os.availableParallelism(),
    shutdownTimeoutMs: Number( process.env.SHUTDOWN_TIMEOUT_MS ) || 10_000,

    // Crash-loop protection: max restarts allowed inside the window
    maxRestarts: 5,
    restartWindowMs: 60_000,

    // Must exceed your upstream proxy/ALB idle timeout (ALB default: 60s)
    keepAliveTimeoutMs: 65_000,
    headersTimeoutMs: 66_000,
    requestTimeoutMs: 30_000,
} as const;