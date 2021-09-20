import * as React from "react";
import AppBar from "@material-ui/core/AppBar";
import logo from "assets/logo2x.png";

import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  appBar: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    "&.MuiAppBar-colorPrimary": {
      backgroundColor: "rgba(0,0,0,0) !important",
    },
  },
  img: {
    width: "50px",
    marginTop: "0.5rem",
    [theme.breakpoints.up("md")]: {
      width: "100px",
      marginTop: "1rem",
    },
  },
}));

const Header = () => {
  const classes = useStyles();
  return (
    <AppBar elevation={0} position="static" className={classes.appBar}>
      <a href="https://www.pac.xyz/" target="_blank" rel="noreferrer">
          <img alt="PAC Crypto Activism" src={logo} className={classes.img} />
        </a>
    </AppBar>
  );
};

export default Header;
