import * as React from "react";
import { ethers } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { makeStyles } from "@material-ui/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import { useEthersProvider } from "contexts/EthersContext";
//import PACFounderContract from "contracts/PACFounderContract";
import deploymentMap from "artifacts/deployments/map.json";
import { abbrAddress, TYPE } from "utils";
import MintComp from "./MintComp";
import chartImage from "assets/chart.png";
import { COLOR } from "theme";

const useStyles = makeStyles((theme) => ({
  root: {},
  article: {
    color: COLOR.TEXT_YELLOW,
    backgroundColor: "black",
    padding: "2rem",
  },
  div: { display: "flex", justifyContent: "center" },
  action: {
    marginBottom: "0.75rem",
    [theme.breakpoints.up("md")]: { marginBottom: "2rem" },
  },
}));

const address = deploymentMap["4"]["ActionNFT"][0];
const address2 = deploymentMap["4"]["ActionNFTRare"][0];

function stateReducer(state, { type, payload }) {
  switch (type) {
    case TYPE.pending: {
      return {
        ...state,
        status: TYPE.pending,
      };
    }
    case TYPE.success: {
      return {
        ...state,
        ...payload,
        status: TYPE.success,
      };
    }
    case TYPE.error: {
      return {
        ...state,
        error: payload.error,
        status: TYPE.error,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${type}`);
    }
  }
}

const Main = () => {
  const classes = useStyles();
  const { account, chainName, connect, provider } = useEthersProvider();

  const abbrAccount = React.useMemo(() => {
    if (account) {
      return abbrAddress(account);
    }
  }, [account]);

  const [state, dispatch] = React.useReducer(stateReducer, {
    status: null,
    error: null,
    contract: null,
    contract2: null,
    abi: null,
    abi2: null,
    mintPrice: "",
    formCommonPrice: "",
    formRarePrice: "",
    formTopBidders: "",
    totalSupply: "",
    quantity: "",
  });

  const dispatchSuccess = (payload) => {
    dispatch({
      type: TYPE.success,
      payload,
    });
  };

  const getCommonPrice = React.useCallback(async () => {
    try {
      const minPrice = await state.contract.commonPrice();
      return formatUnits(minPrice.toString(), 18);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }, [state.contract]);

  const getCommonPriceMultiple = React.useCallback(
    async ({ target: { value } }) => {
      try {
        const minPrice = await state.contract.getCostMany(value);
        return formatUnits(minPrice.toString(), 18);
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    [state.contract]
  );

  const getTopBidders = React.useCallback(async () => {
    try {
      const topBidders = await state.contract2.topBidders(0);
      console.log("topBidders", topBidders);
      return "HELLO";
      return topBidders;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }, [state.contract]);

  const getRarePrice = React.useCallback(async () => {
    try {
      const bidPrice = await state.contract2.bidPrice();
      return formatUnits(bidPrice.toString(), 18);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }, [state.contract2]);

  const getTotalMinted = React.useCallback(async () => {
    try {
      const totalSupply = await state.contract.totalSupply();
      const parsedTotalSupply = totalSupply.toString();
      return parsedTotalSupply;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }, [state.contract]);

  async function getABI(address) {
    const resp = await import(`artifacts/deployments/4/${address}.json`);
    return resp;
  }

  React.useEffect(() => {
    if (state.contract2) {
      (async () => {
        try {
          const [currentCommonPrice, totalMintedSupply, currentRarePrice, currentTopBidders] = await Promise.all([
            getCommonPrice(),
            getTotalMinted(),
            getRarePrice(),
            getTopBidders(),
          ]);

          dispatchSuccess({
            mintPrice: currentCommonPrice,
            formCommonPrice: currentCommonPrice,
            formRarePrice: currentRarePrice,
            formTopBidders: currentTopBidders,
            totalSupply: totalMintedSupply,
          });
        } catch (error) {
          console.log("USEEFFECT API ERROR", error);
        }
      })();
    }
  }, [state.contract, dispatch, getCommonPrice, getTotalMinted, getRarePrice, getTopBidders]);

  // onMount
  React.useEffect(() => {
    (async () => {
      try {
        const _abi = await getABI(address);
        const abi = _abi.abi;
        const _abi2 = await getABI(address2);
        const abi2 = _abi2.abi;
        const contract = new ethers.Contract(address, abi, provider);
        const contract2 = new ethers.Contract(address2, abi2, provider);

        dispatchSuccess({
          abi: _abi.abi,
          contract,
          abi2,
          contract2,
        });
      } catch (error) {
        dispatch({ type: TYPE.error, error });
      }
    })();
  }, [provider]);

  if (!state.contract) {
    return null;
  }

  const { contract, formCommonPrice, formRarePrice, quantity, formTopBidders, mintPrice, totalSupply } = state;

  return (
    <Grid className={classes.root} container>
      <Grid item xs={12} container justifyContent="center">
        <div className={`${classes.div} ${classes.action}`}>
          {account ? (
            <form>
              <MintComp
                contract={contract}
                formCommonPrice={formCommonPrice}
                formRarePrice={formRarePrice}
                formTopBidders={formTopBidders}
                mintPrice={mintPrice}
                totalSupply={totalSupply}
                quantity={quantity}
                dispatch={dispatch}
                dispatchSuccess={dispatchSuccess}
                getCommonPrice={getCommonPrice}
              />
            </form>
          ) : (
            <Button variant="contained" color="primary" size="large" onClick={connect} type="submit">
              Connect your wallet
            </Button>
          )}
        </div>
      </Grid>
      <Grid item container justifyContent="center">
        {abbrAccount && (
          <Typography variant="overline" display="block" gutterBottom style={{ marginBottom: "1rem" }}>
            Connected to {chainName} @ {abbrAccount}.
          </Typography>
        )}
      </Grid>
      <Grid item xs={12} className={classes.article}>
        <Typography variant="h6" component="h3">
          About
        </Typography>
        <Typography gutterBottom>
          The PAC DAO Founder Token is an ERC-721 NFT that doesn’t do anything or confer any special rights. It’s just a
          way to receive a memento of support for promoting a good cause. All proceeds are being used to fund the DAO,
          which is planning action campaigns in accordance with its mission: PAC is not actually a Political Action
          Committee, but an issue group that stands for People Advocating for Crypto.
        </Typography>
        <Typography gutterBottom>
          Since every NFT drop requires interesting tokenomics, PAC DAO has a fun way to reward early adopters. The
          initial mint price is very cheap, well below price of gas. However, the floor price increases by at least 7.5%
          after each mint, so early supporters get a nice discount. Additionally, the DAO address receives 10 additional
          tokens throughout the initial mint to distribute to the community as desired.
        </Typography>
        <Typography gutterBottom>
          The other aspect built into the minting mechanics is that anybody who likes can choose to raise the stakes by
          minting at any amount above the floor price. Should some whale choose to do this, the new floor price would
          raise accordingly, and the supply would be massively curtailed.
        </Typography>
        <Typography gutterBottom>
          Even if people just mint at floor price, the effective supply is effectively scarce.
        </Typography>
        <center style={{ padding: "1rem" }}>
          <img style={{ width: "100%", height: "auto" }} src={chartImage} alt="pac doa founder token chart" />
        </center>
        <Typography gutterBottom>
          In reality these numbers could be higher if whales choose to accelerate the floor price. These are the{" "}
          <a href="https://github.com/PacDAO/founder-token" target="_blank" rel="noreferrer">
            experimental results derived from the Brownie tests
          </a>{" "}
          included in the GitHub repository. If you’re technical, it’s a great idea to read through it to understand the
          mechanics, or check out the token deployed at{" "}
          <a href="https://etherscan.io/address/0x63994b223f01b943eff986b1b379312508dc15f8">
            {abbrAddress("0x63994b223f01b943eff986b1b379312508dc15f8")}
          </a>
        </Typography>
        <Typography>
          Assuming everybody just mints at floor price, the badge will be cheaper than gas for about the first 50 coins.
          By NFT 100, the token will cost about half an ETH. By 200, only millionaires will be able to afford it. By
          300, only billionaires will be able to afford it. The theoretical cap is some number shortly thereafter when
          overflow errors would prevent minting. Practically, it would be a pleasant surprise if a hundred get minted.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default Main;
