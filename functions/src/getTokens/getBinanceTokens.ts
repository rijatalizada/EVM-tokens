import binanceTokens from "../TokensList/binanceTokens.json";
import OffChainOracleABI from "../ABI/OffChainOracle.json";
import { Token } from "../Types";
import { getEthPrice } from "../Price/getEthereumPrice";
import { BigNumber, ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider(
    "https://binance.nodereal.io"
);

const offChainAddress = "0xfbD61B037C325b959c0F6A7e69D8f37770C2c550";

const offChainOracleContract = new ethers.Contract(
  offChainAddress,
  OffChainOracleABI,
  provider
);

const getTokens = async () => {
  const ethPrice = await getEthPrice();

  const newTokens = await Promise.allSettled(
    binanceTokens.map((s: Token) => getToken(ethPrice, s))
  );

  return newTokens
    .filter((s) => s.status === "fulfilled" && s.value.priceUSD != 0)
    .map((s) => (s as any).value);
};

const getToken = async (ethPrice: number, token: Token) => {
  try {
    const rate = await offChainOracleContract.getRateToEth(
      token.address.toLowerCase(),
      true
    );
    const numerator = BigNumber.from(10).pow(token.decimals);
    const denominator = BigNumber.from(10).pow(18); // eth decimals
    const price = BigNumber.from(rate).mul(numerator).div(denominator);
    const finalPrice = (+price / Math.pow(10, 18)).toString();

    if (+finalPrice == 0) {
      return {
        address: token.address,
        decimals: token.decimals,
        name: token.name,
        symbol: token.symbol,
        chainId: token.chainId,
        priceUSD: 0,
        logoURI: token.logoURI,
      };
    } else {
      return {
        address: token.address,
        decimals: token.decimals,
        name: token.name,
        symbol: token.symbol,
        chainId: token.chainId,
        priceUSD: +finalPrice * ethPrice,
        logoURI: token.logoURI,
      };
    }
  } catch (e) {
    throw new Error(e as any);
  }
};

export default getTokens;
