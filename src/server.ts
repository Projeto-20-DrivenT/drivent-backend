import app, { init } from "@/app";
import { redisClient } from "./config/redis";

const port = +process.env.PORT || 4000;

init().then(() => {
  redisClient.connect();
  app.listen(port, () => {
    /* eslint-disable-next-line no-console */
    console.log(`Server is listening on port ${port}.`);
  });
});
