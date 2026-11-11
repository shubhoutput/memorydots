import {
  defineServer,
  monitor,
  playground,
} from "colyseus";

import cors from "cors";

const server = defineServer({
  rooms: {},
  express: (app) => {
    app.use(cors({ origin: "http://localhost:3000" }));

    if (process.env.NODE_ENV !== "production") {
      app.use("/monitor", monitor());
      app.use("/", playground());
    }
  },
});

export default server;
