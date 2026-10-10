
import "dotenv/config"; // must stay first so env vars are loaded before config is read
import { startCluster } from "./cluster/index";

startCluster();