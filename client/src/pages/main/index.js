import * as React from "react";
import { ethers } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { makeStyles } from "@material-ui/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Grow from "@material-ui/core/Grow";

import { useEthersProvider } from "contexts/EthersContext";
//import PACFounderContract from "contracts/PACFounderContract";
import deploymentMap from "artifacts/deployments/map.json";
import { abbrAddress, TYPE } from "utils";
import MintComp from "./MintComp";
import pacImage from "assets/pacanim.gif";
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
  img: {
    height: "calc(100vh - 50vh)",
  },
  action: {
    marginBottom: "0.75rem",
    [theme.breakpoints.up("md")]: { marginBottom: "2rem" },
  },
}));

const address = deploymentMap['dev']['ActionNFT'][0]; 
const abi = getABI(address);

async function getABI(address) {
	const resp =await import(`artifacts/deployments/dev/${address}.json`);
	return resp
}
//const abi = import(`artifacts/deployments/dev/0x3194cBDC3dbcd3E11a07892e7bA5c3394048Cc87.json`);


function stateReducer(state, action) {
  switch (action.type) {
    case TYPE.pending: {
      return {
        ...state,
        status: TYPE.pending,
      };
    }
    case TYPE.success: {
      const newState = {
        ...state,
        status: TYPE.success,
        mintPrice: action.mintPrice,
        formMintPrice: action.formMintPrice,
      };
      if (action.totalSupply) {
        newState.totalSupply = action.totalSupply;
      }
      return newState;
    }
    case TYPE.error: {
      return {
        ...state,
        status: TYPE.error,
        error: action,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
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
    mintPrice: "",
    formMintPrice: "",
    totalSupply: "",
  });

  const getMinPrice = async () => {
    try {
      const the_abi = await abi;
      const contract = new ethers.Contract(address, the_abi.abi, provider);
      const minPrice = await contract.totalSupply();
      const parsedMinPrice = minPrice.toString();
      return formatUnits(parsedMinPrice, 18);
    } catch (error) {
	    console.log(error);
      throw error;
    }
  };

  const getTotalMinted = async () => {
    try {
      const contract = new ethers.Contract(address, abi, provider);
      const totalSupply = await contract.totalSupply();
      const parsedTotalSupply = totalSupply.toString();
      return parsedTotalSupply;
    } catch (error) {
      throw error;
    }
  };

  // onMount
  React.useEffect(() => {
    (async () => {
      try {
        const currentMintedPrice = await getMinPrice();
        const totalMintedSupply = await getTotalMinted();
        dispatch({
          type: TYPE.success,
          mintPrice: currentMintedPrice,
          formMintPrice: currentMintedPrice,
          totalSupply: totalMintedSupply,
        });
      } catch (error) {
        dispatch({ type: TYPE.error, error });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { formMintPrice, mintPrice, totalSupply } = state;

  return (
    <Grid className={classes.root} container>
      <Grid item xs={12} container justifyContent="center">
        <img
          className={classes.img}
          alt="PAC Crypto Activism NFT"
          src={pacImage}
          //src="https://pbs.twimg.com/media/E91wIcSXsAI3syG.jpg:large" //{spinny}
        />
      </Grid>
      <Grid item xs={12} container justifyContent="center">
        <div className={`${classes.div} ${classes.action}`}>
          <Grow
            in
            disableStrictModeCompat
            style={{ transformOrigin: "0 0 0 0" }}
            timeout={1000}
          >
            {account ? (
              <form>
                <MintComp
                  priceDispatch={dispatch}
                  formMintPrice={formMintPrice}
                  mintPrice={mintPrice}
                  getMinPrice={getMinPrice}
                  totalSupply={totalSupply}
                />
              </form>
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={connect}
                type="submit"
              >
                Connect your wallet
              </Button>
            )}
          </Grow>
        </div>
      </Grid>
      <Grid item container justifyContent="center">
        {abbrAccount && (
          <Typography
            variant="overline"
            display="block"
            gutterBottom
            style={{ marginBottom: "1rem" }}
          >
            Connected to {chainName} @ {abbrAccount}.
          </Typography>
        )}
      </Grid>
      <Grid item xs={12} className={classes.article}>
        <Typography variant="h6" component="h3">
          About
        </Typography>
        <Typography gutterBottom>
          The PAC DAO Founder Token is an ERC-721 NFT that doesn’t do anything
          or confer any special rights. It’s just a way to receive a memento of
          support for promoting a good cause. All proceeds are being used to
          fund the DAO, which is planning action campaigns in accordance with
          its mission: PAC is not actually a Political Action Committee, but an
          issue group that stands for People Advocating for Crypto.
        </Typography>
        <Typography gutterBottom>
          Since every NFT drop requires interesting tokenomics, PAC DAO has a
          fun way to reward early adopters. The initial mint price is very
          cheap, well below price of gas. However, the floor price increases by
          at least 7.5% after each mint, so early supporters get a nice
          discount. Additionally, the DAO address receives 10 additional tokens
          throughout the initial mint to distribute to the community as desired.
        </Typography>
        <Typography gutterBottom>
          The other aspect built into the minting mechanics is that anybody who
          likes can choose to raise the stakes by minting at any amount above
          the floor price. Should some whale choose to do this, the new floor
          price would raise accordingly, and the supply would be massively
          curtailed.
        </Typography>
        <Typography gutterBottom>
          Even if people just mint at floor price, the effective supply is
          effectively scarce.
        </Typography>
        <center style={{ padding: "1rem" }}>
          <img
            style={{ width: "100%", height: "auto" }}
            src={chartImage}
            alt="pac doa founder token chart"
          />
        </center>
        <Typography gutterBottom>
          In reality these numbers could be higher if whales choose to
          accelerate the floor price. These are the{" "}
          <a
            href="https://github.com/PacDAO/founder-token"
            target="_blank"
            rel="noreferrer"
          >
            experimental results derived from the Brownie tests
          </a>{" "}
          included in the GitHub repository. If you’re technical, it’s a great
          idea to read through it to understand the mechanics, or check out the
          token deployed at{" "}
          <a href="https://etherscan.io/address/0x63994b223f01b943eff986b1b379312508dc15f8">
            {abbrAddress("0x63994b223f01b943eff986b1b379312508dc15f8")}
          </a>
        </Typography>
        <Typography>
          Assuming everybody just mints at floor price, the badge will be
          cheaper than gas for about the first 50 coins. By NFT 100, the token
          will cost about half an ETH. By 200, only millionaires will be able to
          afford it. By 300, only billionaires will be able to afford it. The
          theoretical cap is some number shortly thereafter when overflow errors
          would prevent minting. Practically, it would be a pleasant surprise if
          a hundred get minted.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default Main;
