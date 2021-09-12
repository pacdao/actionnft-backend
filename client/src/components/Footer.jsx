import * as React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import githubLogo from "assets/github.png";
import etherscanLogo from "assets/etherscan.png";
import discordLogo from "assets/discord.png";
import telegramLogo from "assets/telegram.png";
import twitterLogo from "assets/twitter.png";
const Footer = () => {
  return (
    <Grid container direction="column">
      <Grid item container justifyContent="center">
        <a
          href="https://github.com/PacDAO"
          target="_blank"
          rel="noreferrer"
          style={{ marginRight: "20px" }}
        >
          <img src={githubLogo} alt="Github" width="30" />
        </a>
        <a
          href="https://etherscan.io/address/0x63994b223f01b943eff986b1b379312508dc15f8"
          target="_blank"
          rel="noreferrer"
          style={{ marginRight: "20px" }}
        >
          <img src={etherscanLogo} alt="EtherScan" width="30" />
        </a>

        <a
          href="https://discord.gg/Y95mnqewpb"
          target="_blank"
          rel="noreferrer"
          style={{ marginRight: "20px" }}
        >
          <img src={discordLogo} alt="Discord" width="30" />
        </a>
        <a
          href="https://t.me/joinchat/VYYqN19O3Wc4OTZh"
          target="_blank"
          rel="noreferrer"
          style={{ marginRight: "20px" }}
        >
          <img src={telegramLogo} alt="Telegram" width="30" />
        </a>
        <a href="https://twitter.com/pacdao" target="_blank" rel="noreferrer">
          <img src={twitterLogo} alt="Twitter" width="30" />
        </a>
      </Grid>

      <Grid item xs={12} container justifyContent="center">
        <b>© 2021 PAC DAO</b>
      </Grid>
      <Grid item xs={12} style={{ padding: "1rem" }}>
        <Typography variant="caption">
          People Advocating for Crypto is a grassroots issue based activism DAO
          dedicated to furthering crypto adoption worldwide. PAC is not a
          Political Action Committee, and nothing expressed in PAC’s website or
          other public forums shall be construed as such. Further, this website
          and any other public PAC forums, including content such as proposals
          supported by PAC, the PAC Pro-Crypto Scorecard, and Bills and
          Campaigns discussed by PAC, are for informational purposes only. The
          Founding Member NFT is obtained by supporters of PAC “as is” and
          without warranties of any kind. PAC is not liable for any harm caused
          by participation therein, or by obtaining a Founding Member NFT. By
          obtaining the Founding Member NFT, you agree that you are not
          obtaining a security or investment instrument, you have undertaken
          your own review of laws applicable to you in your jurisdiction and
          confirm that your action is permissible under such applicable laws and
          you are obtaining the Founding Member NFT for your own account without
          intent to distribute the Founding Member NFT to third parties.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default Footer;
