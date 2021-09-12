import React from "react";
import ReactDOM from "react-dom";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import EthersProvider from "contexts/EthersContext";
import ErrorBoundary from "components/ErrorBoundary";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import theme from "theme";

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <ErrorBoundary>
      <EthersProvider>
        <App />
      </EthersProvider>
    </ErrorBoundary>
  </ThemeProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
