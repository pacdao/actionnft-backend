import { makeStyles } from "@material-ui/styles";
import { COLOR } from "theme";

const styles = makeStyles((theme) => ({
  img: {
    height: "auto",
    width: "100%",
    [theme.breakpoints.up("md")]: {
      height: "calc(100vh - 55vh)",
      width: "auto",
    },
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
  table: {
    "&.MuiPaper-root": {
      color: "white",
      backgroundColor: COLOR.YELLOW,
    },
    "&.MuiPaper-outlined": {
      borderBottom: `1px solid ${COLOR.TEXT_YELLOW}`,
    },
    "& .MuiTableCell-root": {
      borderBottom: `1px solid ${COLOR.TEXT_YELLOW}`,
    },
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

export default styles;
