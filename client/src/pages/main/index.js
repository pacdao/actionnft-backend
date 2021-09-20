import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { Button, Grid, Tab, Tabs, Typography } from "@material-ui/core";
import { TabContext, TabPanel } from "@material-ui/lab";

import { useEthersProvider } from "contexts/EthersContext";
import { abbrAddress } from "utils";
import MintCommonComp from "components/Mint/MintCommonComp";
import MintRareComp from "components/Mint/MintRareComp";

export async function getABI(address, networkId) {
  const resp = await import(`artifacts/deployments/${networkId}/${address}.json`);
  return resp;
}

const useStyles = makeStyles((theme) => ({
  root: {},
  div: { display: "flex", justifyContent: "center" },
  action: {
    marginBottom: "0.75rem",
    [theme.breakpoints.up("md")]: { marginBottom: "2rem" },
  },
}));

const Main = () => {
  const classes = useStyles();
  const { account, chainName, connect } = useEthersProvider();

  const abbrAccount = React.useMemo(() => {
    if (account) {
      return abbrAddress(account);
    }
  }, [account]);

  const [tabValue, setTabValue] = React.useState(1);

  return (
    <Grid className={classes.root} container>
      <Grid item xs={12} container justifyContent="center">
        <div className={`${classes.div} ${classes.action}`}>
          {account ? (
            <form>
              <Grid container spacing={2}>
                <Grid container>
                  <TabContext value={tabValue}>
                    <Grid item xs={12} container justifyContent="center" alignItems="stretch">
                      <Tabs
                        centered
                        indicatorColor="primary"
                        value={tabValue}
                        onChange={(_, newTabValue) => setTabValue(newTabValue)}
                        aria-label="mint tabs"
                      >
                        <Tab label="Common" />
                        <Tab label="Rare" />
                      </Tabs>
                    </Grid>
                    <Grid item xs={12}>
                      <TabPanel value={0} index={0}>
                        <MintCommonComp />
                      </TabPanel>
                      <TabPanel value={1} index={1}>
                        <MintRareComp />
                      </TabPanel>
                    </Grid>
                  </TabContext>
                </Grid>
              </Grid>
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
    </Grid>
  );
};

export default Main;
