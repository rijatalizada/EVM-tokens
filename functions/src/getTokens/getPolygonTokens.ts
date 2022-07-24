import polygonTokens from "../TokensList/polygoonTokens.json";
import OffChainOracleABI from "../ABI/OffChainOracle.json";
import { Token } from "../Types";
import { getEthPrice } from "../Price/getEthereumPrice";
import { BigNumber, ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider(
    "https://polygon-rpc.com"
);

const offChainAddress = "0x7F069df72b7A39bCE9806e3AfaF579E54D8CF2b9";

const offChainOracleContract = new ethers.Contract(
  offChainAddress,
  OffChainOracleABI,
  provider
);

const getTokens = async () => {
  const ethPrice = await getEthPrice();

  const newTokens = await Promise.allSettled(
    polygonTokens.map((s: Token) => getToken(ethPrice, s))
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
        address: token.address,
        decimals: token.decimals,
        name: token.name,
        symbol: token.symbol,
        chainID: token.chainId,
        priceUSD: +finalPrice * ethPrice,
        logoURI: token.logoURI,
      };
    }
  } catch (e) {
    throw new Error(e as any);
  }
};

export default getTokens;