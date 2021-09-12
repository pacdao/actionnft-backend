import * as React from "react";
import { ethers } from "ethers";
import { makeStyles } from "@material-ui/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import { TYPE } from "utils";
import ProgressBtn from "components/ProgressBtn";
import { useEthersProvider } from "contexts/EthersContext";
//import PACFounderContract from "contracts/PACFounderContract";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import Alert from "@material-ui/lab/Alert";
import { Grid } from "@material-ui/core";
import contractMap from "artifacts/deployments/map.json";

const useStyles = makeStyles(() => ({
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

function stateReducer(state, action) {
  switch (action.type) {
    case TYPE.pending: {
      return {
        ...state,
        status: TYPE.pending,
        txReceiptHash: null,
      };
    }
    case TYPE.success: {
      return {
        ...state,
        status: TYPE.success,
        blockHash: action.blockHash,
      };
    }
    case TYPE.error: {
      return {
        ...state,
        status: TYPE.error,
        error: action.error,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

const address = contractMap['dev']['ActionNFT'][0]; 
const abi = getABI(address);

async function getABI(address) {
	const resp =await import(`artifacts/deployments/dev/${address}.json`);
	return resp
}
const MintComp = ({
  formMintPrice,
  priceDispatch,
  mintPrice,
  getMinPrice,
  totalSupply,
}) => {
  const classes = useStyles();
  const { account, signer } = useEthersProvider();

  const [state, dispatch] = React.useReducer(stateReducer, {
    status: null,
    error: null,
    blockHash: null,
  });

  function handleChange(evt) {
    const { value } = evt.target;
    priceDispatch({
      type: TYPE.success,
      mintPrice: mintPrice,
      formMintPrice: value,
    });
  }

  async function pay(evt) {
    evt.preventDefault();
    try {
      if (Number(formMintPrice) < Number(mintPrice)) {
        throw new Error("Your amount cannot be less than minimum amount");
      }
      const eth = parseUnits(formMintPrice, "ether");
      const wei = formatUnits(eth, "wei");
      const _abi = await abi;
      const contract = new ethers.Contract(address, _abi.abi, signer);
      const txResp = await contract.mint_common({
        value: wei.toString(),
      });
      dispatch({ type: TYPE.pending });
      const { blockHash } = await txResp.wait();
      const updatedMintPrice = await getMinPrice();
      priceDispatch({
        type: TYPE.success,
        mintPrice: updatedMintPrice,
        formMintPrice: updatedMintPrice,
      });
      dispatch({ type: TYPE.success, blockHash });
    } catch (error) {
      dispatch({
        type: TYPE.error,
        error: error.message || "Somethings wrong",
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
            <Alert
              severity="success"
              style={{ backgroundColor: "lightGreen", marginBottom: "1rem" }}
            >
              Success, {state.blockHash}
            </Alert>
          )}

          {state.status === TYPE.error && (
            <Alert
              severity="error"
              style={{ backgroundColor: "lightsalmon", marginBottom: "1rem" }}
            >
              {state.error}
            </Alert>
          )}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container justifyContent="center" alignItems="stretch">
          <TextField
            className={classes.textfield}
            label="Your ETH amount"
            variant="outlined"
            onChange={handleChange}
            disabled={!account}
            value={formMintPrice}
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
        <Grid
          item
          md={6}
          xs={12}
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <Typography display="block" style={{ margin: "1rem 0" }} gutterBottom>
            Minimum amount to mint NFT <b>{mintPrice} ETH</b>*
            <br />
            Total minted so far <b>{totalSupply}</b>
          </Typography>

          <Typography
            display="block"
            variant="caption"
            style={{ maxWidth: "70%" }}
          >
            *You can mint at, or above, the current minimum amount ({mintPrice}{" "}
            ETH). The new minimum is always set to be higher than the previous
            mint price. A whale could set a high floor at any point they like,
            so mint early!
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default MintComp;
