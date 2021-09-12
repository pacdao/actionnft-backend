import * as React from "react";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import makeStyles from "@material-ui/styles/makeStyles";
import { COLOR } from "theme";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "inherit",
    position: "relative",
  },
  btn: {
    backgroundColor: "green",
    "&:hover": {
      backgroundColor: "yellow",
    },
  },
  btnProgress: {
    color: COLOR.YELLOW,
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

const ProgressBtn = ({ loading, handleClick, children, ...props }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Button {...props} onClick={handleClick}>
        {children}
      </Button>
      {loading && (
        <CircularProgress size={24} className={classes.btnProgress} />
      )}
    </div>
  );
};

export default ProgressBtn;
