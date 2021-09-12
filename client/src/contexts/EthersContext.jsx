import * as React from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import LinearProgress from "@material-ui/core/LinearProgress";

const EthersContext = React.createContext({});

// TODO: convert to use reducer
const EthersProvider = ({ ...props }) => {
  const [state, setState] = React.useState({
    account: null,
    chainId: null,
    chainName: null,
    provider: null,
    signer: null,
    loaded: false,
  });

  React.useEffect(() => {
    (async function () {
      try {
        const foundProvider = await detectEthereumProvider();

        if (foundProvider && foundProvider === window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();
          const chain = await provider.getNetwork();
          const signer = provider.getSigner();
          setState({
            chainId: chain && chain.chainId ? chain.chainId : null,
            chainName: chain && chain.name ? chain.name : null,
            account:
              Array.isArray(accounts) && accounts.length > 0
                ? accounts[0]
                : null,
            provider,
            signer,
            loaded: true,
          });

          window.ethereum.on("accountsChanged", () => {
            window.location.reload();
          });

          window.ethereum.on("chainChanged", () => {
            window.location.reload();
          });
        } else {
          // unable to find provider
          setState({ ...state, loaded: true });
        }
      } catch (error) {
        console.log({ error });
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function connect() {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .catch((err) => {
          if (err.code === 4001) {
            // EIP-1193 userRejectedRequest error
            // If this happens, the user rejected the connection request.
            console.log("Please connect to MetaMask.");
          } else {
            console.error(err);
          }
        });
    }
  }

  const { loaded, ...rest } = state;

  if (!loaded) {
    return <LinearProgress />;
  }

  return (
    <EthersContext.Provider
      value={{
        connect,
        ...rest,
      }}
      {...props}
    />
  );
};

const useEthersProvider = () => {
  const context = React.useContext(EthersContext);
  return context;
};

export { EthersProvider as default, useEthersProvider };
