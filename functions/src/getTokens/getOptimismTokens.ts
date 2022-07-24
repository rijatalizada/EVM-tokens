import optimismTokens from "../TokensList/optimismTokens.json";
import OffChainOracleABI from "../ABI/OffChainOracle.json";
import { Token } from "../Types";
import { getEthPrice } from "../Price/getEthereumPrice";
import { BigNumber, ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider(
  "https://optimistic.etherscan.io"
);

const offChainAddress = "0x11DEE30E710B8d4a8630392781Cc3c0046365d4c";

const offChainOracleContract = new ethers.Contract(
  offChainAddress,
  OffChainOracleABI,
  provider
);

const getTokens = async () => {
  const ethPrice = await getEthPrice();

  const newTokens = await Promise.allSettled(
    optimismTokens.map((s: Token) => getToken(ethPrice, s))
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
        ...token,
        priceUSD: 0,
      };
    } else {
      return {
        ...token,
        priceUSD: +finalPrice * ethPrice,
      };
    }
  } catch (e) {
    throw new Error(e as any);
  }
};

export default getTokens;
