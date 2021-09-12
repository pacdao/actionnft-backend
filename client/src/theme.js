import { unstable_createMuiStrictModeTheme as createTheme } from "@material-ui/core/styles";

export const COLOR = {
  YELLOW: "#ffe331",
  TEXT_YELLOW: "#7d6f12",
};

const theme = createTheme({
  overrides: {
    MuiCssBaseline: {
      "@global": {
        body: {
          backgroundColor: COLOR.YELLOW,
        },
        a: {
          color: COLOR.YELLOW,
        },
      },
    },
    MuiButton: {
      containedPrimary: {
        color: COLOR.YELLOW,
      },
    },
  },
  palette: {
    backgroundColor: COLOR.YELLOW,
    primary: {
      light: "#676767",
      main: "#3d3d3d",
      dark: "#171717",
      contrastText: "#ffffff",
    },
    secondary: {
      light: "#ffff6a",
      main: COLOR.YELLOW,
      dark: "#c8b100",
      contrastText: "#000000",
    },
  },
});

export default theme;
