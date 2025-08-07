import * as functions from "firebase-functions";
import next from "next";

const app = next({
  dev: false,
  conf: {
    distDir: "../.next",  // Use the build output from root
  },
});

const handle = app.getRequestHandler();

exports.nextAppSSR = functions.https.onRequest(async (req, res) => {
  try {
    await app.prepare();
    return handle(req, res);
  } catch (err) {
    console.error("Error handling request:", err);
    res.status(500).send("Internal Server Error");
  }
});