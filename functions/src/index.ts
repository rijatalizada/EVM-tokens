import * as functions from "firebase-functions";
import getEthereumTokens from "./getTokens/getEthereunTokens";
import getOptimismTokens from "./getTokens/getOptimismTokens";
import getPolygonTokens from "./getTokens/getPolygonTokens";
import getArbitrumTokens from "./getTokens/getArbitrumTokens";
import getBinanceTokens from "./getTokens/getBinanceTokens";
import getAvaxTokens from "./getTokens/getAvaxTokens";
import getGnosisTokens from "./getTokens/getGnosisTokens";

export const ethTokens = functions.https.onRequest(
  async (request, response) => {
    const tokens = await getEthereumTokens();
    response.send(tokens);
  }
);

export const optimismTokens = functions.https.onRequest(
  async (request, response) => {
    const tokens = await getOptimismTokens();
    response.send(tokens);
  }
);

export const polygonTokens = functions.https.onRequest(
  async (request, response) => {
    const tokens = await getPolygonTokens();
    response.send(tokens);
  }
);

export const arbitrumTokens = functions.https.onRequest(
  async (request, response) => {
    const tokens = await getArbitrumTokens();
    response.send(tokens);
  }
);

export const binanceTokens = functions.https.onRequest(
  async (request, response) => {
    const tokens = await getBinanceTokens();
    response.send(tokens);
  }
);

export const avaxTokens = functions.https.onRequest(
  async (request, response) => {
    const tokens = await getAvaxTokens();
    response.send(tokens);
  }
);

export const gnosisTokens = functions.https.onRequest(
  async (request, response) => {
    const tokens = await getGnosisTokens();
    response.send(tokens);
  }
);