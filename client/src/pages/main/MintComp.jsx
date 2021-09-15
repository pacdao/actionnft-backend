import * as React from "react";
import { ethers } from "ethers";
import { makeStyles } from "@material-ui/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Grow from "@material-ui/core/Grow";

import { TYPE } from "utils";
import ProgressBtn from "components/ProgressBtn";
import { useEthersProvider } from "contexts/EthersContext";
//import PACFounderContract from "contracts/PACFounderContract";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import Alert from "@material-ui/lab/Alert";
import { Grid, Tab, Tabs } from "@material-ui/core";
import contractMap from "artifacts/deployments/map.json";
import { TabContext, TabPanel } from "@material-ui/lab";
import pacImageCommon from "assets/commonNFT.png";
import pacImageRare from "assets/rareNFT.png";

const useStyles = makeStyles(() => ({
  img: {
    height: "calc(100vh - 55vh)",
  },
  textfield: {
    "& .MuiOutlinedInput-root": {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
  },
  "@keyframes animateBtn": {
    "0%": { backgroundPosition: "0 0" },
    "50%": { backgroundPosition: "300% 0" },
    "100%": { backgroundPosition: "0 0" },
  },
  mintBtn: {
    "&::after": {
      position: "absolute",
      content: '""',
      width: "calc(100% + 4px)",
      height: "calc(100% + 4px)",
      borderRadius: "3px",
      backgroundSize: "400%",
      filter: "blur(5px)",
      zIndex: "-1",
      animation: "$animateBtn 15s infinite",
      background:
        "linear-gradient(45deg, #ff00b8, #ff6464, #B4A81E, #A67EBF, #FF22D2, #E5D599, #FFC219, #F07C19, #E32551)",
    },
    "&.disabled::after": {
      background: "none",
    },
    "&.MuiButton-root": {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
  },
}));

function stateReducer(state, { type, payload }) {
  switch (type) {
    case TYPE.pending: {
      return {
        ...state,
        ...payload,
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

const address = contractMap["dev"]["ActionNFT"][0];
const address2 = contractMap["dev"]["ActionNFTRare"][0];
const abi = getABI(address);
const abi2 = getABI(address2);

async function getABI(address) {
  const resp = await import(`artifacts/deployments/dev/${address}.json`);
  return resp;
}

const MintComp = ({
  contract,
  formCommonPrice,
  formRarePrice,
  formTopBidders,
  mintPrice,
  totalSupply,
  quantity,
  dispatch: priceDispatch,
  getCommonPrice,
  dispatchSuccess,
}) => {
  const classes = useStyles();
  const { account, signer } = useEthersProvider();

  const [state, dispatch] = React.useReducer(stateReducer, {
    status: null,
    error: null,
    blockHash: null,
    tabValue: 0,
  });

  function handleChange(evt) {
    const { value } = evt.target;
    priceDispatch({
      type: TYPE.success,
      payload: {
        totalSupply: totalSupply,
        mintPrice: mintPrice,
        formCommonPrice: value,
      },
    });
  }
  async function bid(evt) {
    evt.preventDefault();
    try {
      if (Number(formCommonPrice) < Number(mintPrice)) {
        throw new Error("Your amount cannot be less than minimum amount");
      }
      const eth = parseUnits(formCommonPrice, "ether");
      const wei = formatUnits(eth, "wei");
      const _abi2 = await abi2;
      const contract2 = new ethers.Contract(address2, _abi2.abi, signer);
      const txResp = await contract2.bidRare({
        value: wei.toString(),
      });
      dispatch({ type: TYPE.pending });
      const { blockHash } = await txResp.wait();
      const updatedMintPrice = await getCommonPrice();
      priceDispatch({
        type: TYPE.success,
        payload: {
          mintPrice: updatedMintPrice,
          formCommonPrice: updatedMintPrice,
        },
      });

      dispatch({ type: TYPE.success, payload: { blockHash } });
    } catch (error) {
      dispatch({
        type: TYPE.error,
        payload: {
          error: error.message || "Somethings wrong",
        },
      });
    }
  }

  async function pay(evt) {
    evt.preventDefault();
    try {
      if (Number(formCommonPrice) < Number(mintPrice)) {
        throw new Error("Your amount cannot be less than minimum amount");
      }
      const eth = parseUnits(formCommonPrice, "ether");
      const wei = formatUnits(eth, "wei");
      const _abi = await abi;
      const _abi2 = await abi2;
      const contract = new ethers.Contract(address, _abi.abi, signer);
      const contract2 = new ethers.Contract(address2, _abi2.abi, signer);
      const txResp = await contract.mintCommon({
        value: wei.toString(),
      });
      dispatch({ type: TYPE.pending });
      const { blockHash } = await txResp.wait();
      const updatedMintPrice = await getCommonPrice();
      priceDispatch({
        type: TYPE.success,
        payload: {
          mintPrice: updatedMintPrice,
          formCommonPrice: updatedMintPrice,
        },
      });
      dispatch({ type: TYPE.success, payload: { blockHash } });
    } catch (error) {
      dispatch({
        type: TYPE.error,
        payload: {
          error: error.message || "Somethings wrong",
        },
      });
    }
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} container justifyContent="center">
        <Grid item md={6}>
          {state.status === TYPE.pending && (
            <Alert
              severity="info"
              style={{
                backgroundColor: "lightblue",
                marginBottom: "1rem",
              }}
            >
              Please be patient, this will take a bit of time.
            </Alert>
          )}

          {state.status === TYPE.success && state.blockHash && (
            <Alert severity="success" style={{ backgroundColor: "lightGreen", marginBottom: "1rem" }}>
              Success, {state.blockHash}
            </Alert>
          )}

          {state.status === TYPE.error && (
            <Alert severity="error" style={{ backgroundColor: "lightsalmon", marginBottom: "1rem" }}>
              {state.error}
            </Alert>
          )}
        </Grid>
      </Grid>

      <Grid container>
        <TabContext value={state.tabValue}>
          <Grid item xs={12} container justifyContent="center" alignItems="stretch">
            <Tabs
              centered
              indicatorColor="primary"
              value={state.tabValue}
              onChange={(evt, newTabValue) => {
                dispatch({
                  type: TYPE.success,
                  payload: {
                    tabValue: newTabValue,
                  },
                });
              }}
              aria-label="mint tabs"
            >
              <Tab label="Common" />
              <Tab label="Rare" />
            </Tabs>
          </Grid>
          <Grid item xs={12}>
            <TabPanel value={0} index={0}>
              <Grid item xs={12} container justifyContent="center">
                <Grow in disableStrictModeCompat style={{ transformOrigin: "0 0 0 0" }} timeout={1000}>
                  <img
                    className={classes.img}
                    alt="PAC Crypto Activism NFT"
                    src={pacImageCommon}
                    //src="https://pbs.twimg.com/media/E91wIcSXsAI3syG.jpg:large" //{spinny}
                  />
                </Grow>
              </Grid>
              <Grid item xs={12}>
                <Grid container justifyContent="center" alignItems="stretch">
                  <TextField
                    className={classes.textfield}
                    label="Your ETH amount"
                    variant="outlined"
                    onChange={() => {}}
                    disabled
                    value={formCommonPrice}
                  />
                  <TextField
                    className={classes.textfield}
                    label="Quantity"
                    variant="outlined"
                    onChange={async ({ target: { value } }) => {
                      try {
                        dispatchSuccess({
                          quantity: value,
                        });
                        if (value) {
                          const [minPrice] = await contract.getCostMany(value);
                          const parsedValue = formatUnits(minPrice.toString(), 18);
                          dispatchSuccess({ formCommonPrice: parsedValue });
                        }
                      } catch (error) {
                        console.log(error);
                        throw error;
                      }
                    }}
                    disabled={!account}
                    value={quantity}
                  />

                  <ProgressBtn
                    className={classes.mintBtn}
                    variant="contained"
                    color="primary"
                    size="large"
                    loading={state.status === TYPE.pending}
                    handleClick={pay}
                    disabled={!account || state.status === TYPE.pending}
                    type="submit"
                  >
                    Mint
                  </ProgressBtn>
                </Grid>
              </Grid>
              <Grid item container xs={12} justifyContent="center">
                <Grid item md={6} xs={12} container direction="column" justifyContent="center" alignItems="center">
                  <Typography display="block" style={{ margin: "1rem 0" }} gutterBottom>
                    Mint NFT now for <b>{mintPrice} ETH</b>*
                    <br />
                    Total minted so far <b>{totalSupply}</b>
                  </Typography>

                  <Typography display="block" variant="caption" style={{ maxWidth: "70%" }}>
                    * The price will increase by 20% after every mint so mint early. You can mint several at a time as
                    well. Current price is ({mintPrice} ETH).
                  </Typography>
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel value={1} index={1}>
              <Grid item xs={12} container justifyContent="center">
                <Grow in disableStrictModeCompat style={{ transformOrigin: "0 0 0 0" }} timeout={1000}>
                  <img
                    className={classes.img}
                    alt="PAC Crypto Activism NFT"
                    src={pacImageRare}
                    //src="https://pbs.twimg.com/media/E91wIcSXsAI3syG.jpg:large" //{spinny}
                  />
                </Grow>
              </Grid>
              <Grid item xs={12}>
                <Grid container justifyContent="center" alignItems="stretch">
                  <TextField
                    className={classes.textfield}
                    label="Your Bid"
                    variant="outlined"
                    onChange={({ target: { value } }) => {
                      dispatchSuccess({ formRarePrice: value });
                    }}
                    disabled={!account}
                    value={formRarePrice}
                  />
                  <ProgressBtn
                    className={classes.mintBtn}
                    variant="contained"
                    color="primary"
                    size="large"
                    loading={state.status === TYPE.pending}
                    handleClick={bid}
                    disabled={!account || state.status === TYPE.pending}
                    type="submit"
                  >
                    Bid
                  </ProgressBtn>
                </Grid>
              </Grid>
              <Grid item container xs={12} justifyContent="center">
                <Grid item md={6} xs={12} container direction="column" justifyContent="center" alignItems="center">
                  <Typography display="block" style={{ margin: "1rem 0" }} gutterBottom>
                    Top 5 bidders take it home!{" "}
                    <b>
                      {formTopBidders} {formRarePrice} ETH
                    </b>
                    *
                    <br />
                  </Typography>

                  <Typography display="block" variant="caption" style={{ maxWidth: "70%" }}>
                    *You can mint at, or above, the current minimum amount ({mintPrice} ETH). The new minimum is always
                    set to be higher than the previous mint price. A whale could set a high floor at any point they
                    like, so mint early!
                  </Typography>
                </Grid>
              </Grid>
            </TabPanel>
          </Grid>
        </TabContext>
      </Grid>
    </Grid>
  );
};

export default MintComp;
