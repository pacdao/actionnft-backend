import { Grid } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { TYPE } from "utils";

const Alerts = ({ status, blockHash, message }) => {
  return (
    <Grid item xs={12} container justifyContent="center">
      <Grid item md={8}>
        {status === TYPE.pending && message && (
          <Alert
            severity="info"
            style={{
              backgroundColor: "lightblue",
              marginBottom: "1rem",
            }}
          >
            {message}
          </Alert>
        )}

        {status === TYPE.success && blockHash && (
          <Alert severity="success" style={{ backgroundColor: "lightGreen", marginBottom: "1rem" }}>
            {message || "Success"}, {blockHash}
          </Alert>
        )}

        {status === TYPE.error && (
          <Alert severity="error" style={{ backgroundColor: "lightsalmon", marginBottom: "1rem" }}>
            {message || "Somethings wrong"}
          </Alert>
        )}
      </Grid>
    </Grid>
  );
};

export default Alerts;
