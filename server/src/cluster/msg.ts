// IPC messages sent from the primary to workers
export const SHUTDOWN_MESSAGE = { cmd: "shutdown" } as const;

export type PrimaryMessage = typeof SHUTDOWN_MESSAGE;