import * as React from "react";
import { useEthersProvider } from "contexts/EthersContext";
import Alert from "@material-ui/lab/Alert";
import Container from "@material-ui/core/Container";
import Main from "pages/main";
import Header from "components/Header";
import Footer from "components/Footer";
import { Grid, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "1rem 0",
    [theme.breakpoints.up("md")]: {
      padding: "2rem 0",
    },
  },
}));

function App() {
  const classes = useStyles();
  const { chainId, provider } = useEthersProvider();

  const isCorrectChain = React.useMemo(() => {
    // TODO: change to correct network once it is ready
    return chainId !== null && chainId === 4;
  }, [chainId]);

  return (
    <React.Fragment>
      <Header />
      <Container maxWidth="lg" className={classes.root}>
        {!provider && (
          <Grid container justifyContent="center">
            <Alert severity="error">
              Please install{" "}
              <a href="https://metamask.io/" target="_blank" rel="noreferrer">
                Metamask
              </a>{" "}
              first.
            </Alert>
          </Grid>
        )}
        {provider && !isCorrectChain && (
          <Grid container justifyContent="center">
            <Alert severity="error">
              Please switch to Ethereum mainnet.
            </Alert>
          </Grid>
        )}
        {provider && isCorrectChain && <Main />}
      </Container>
      <Footer />
    </React.Fragment>
  );
}

export default App;
