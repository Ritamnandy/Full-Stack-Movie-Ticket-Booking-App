import cluster from "node:cluster";
import { runPrimary } from "./primary";
import { runWorker } from "./worker";

export function startCluster (): void
{
    if ( cluster.isPrimary )
    {
        runPrimary();
    } else
    {
        void runWorker();
    }
}
