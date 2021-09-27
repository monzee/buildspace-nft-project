import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState, useMemo } from "react";
import { ethers } from "ethers";
import MyEpicNFT from "./MyEpicNFT.json";


const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TOTAL_MINT_COUNT = 50;
const ETH = window.ethereum;
const RINKEBY_ID = "0x4";
const CONTRACT_ADDRESS = "0x6b83553fbf4D05ee24d3815Bf2B2eBC4c28f8F0D";
const OPENSEA_LINK = `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/`;


function App() {
  const [status, setStatus] = useState([]);
  const [able, authorized, network] = status;

  async function checkConnection() {
    if (!ETH) {
      setStatus([false]);
      return;
    }
    let accounts = await ETH.request({ method: "eth_accounts" });
    if (!accounts.length) {
      setStatus([true, false]);
    }
    else {
      let chain = await ETH.request({ method: "eth_chainId" });
      setStatus([true, true, chain]);
    }
  }

  async function connect() {
    if (able && !authorized) {
      try {
        await ETH.request({ method: "eth_requestAccounts" });
        let chain = await ETH.request({ method: "eth_chainId" });
        setStatus([true, true, chain]);
      }
      catch (e) {
        console.error(e);
      }
    }
  }

  const api = useMemo(() => {
    if (!able || !authorized || network !== RINKEBY_ID) {
      return null;
    }
    const provider = new ethers.providers.Web3Provider(ETH);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, MyEpicNFT.abi, signer);
    return {
      async mint() {
        try {
          let txn = await contract.makeAnEpicNFT();
          let receipt = await txn.wait();
          for (let emitted of receipt.events) {
            if (emitted.event === "NewEpicNFTMinted") {
              return emitted.args.tokenId.toNumber();
            }
          }
        }
        catch (e) {
          console.error(e);
        }
      },

      async count() {
        try {
          return await contract.getMintedCount();
        }
        catch (e) {
          console.error(e);
          return 0;
        }
      },
    };
  }, [able, authorized, network]);

  useEffect(() => {
    checkConnection();
    if (ETH) {
      ETH.on("chainChanged", checkConnection);
      return () => ETH.removeListener("chainChanged", checkConnection);
    }
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {!status.length ? null : !able ? (
            <NoMetaMask />
          ) : !authorized ? (
            <NotConnected connect={connect} />
          ) : network !== RINKEBY_ID ? (
            <WrongNetwork />
          ) : (
            <MintClient api={api} />
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >
            built on @{TWITTER_HANDLE}
          </a>
        </div>
      </div>
    </div>
  );
};


function NoMetaMask() {
  return (
    <h4>Please install <strong>MetaMask</strong> to proceed</h4>
  );
}


function WrongNetwork() {
  return (
    <section className="sub-text">
      <h1>⚠️ Wrong network!</h1>
      <p>Please switch to the <strong>Rinkeby</strong> testnet to proceed</p>
    </section>
  );
}


function NotConnected({ connect }) {
  return (
    <button className="cta-button connect-wallet-button" onClick={connect}>
      Connect to Wallet
    </button>
  );
}


function MintClient({ api: { mint, count } }) {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState();
  const [remaining, setRemaining] = useState(-1);
  const starting = remaining === -1;
  const cardinality = remaining === 1 ? "token" : "tokens";
  const availability = remaining < 10 ?
    `Only ${remaining} ${cardinality} left!` :
    `${remaining} ${cardinality} left`;

  async function action() {
    setBusy(true);
    let tokenId = await mint();
    if (tokenId !== undefined) {
      setRemaining(remaining - 1);
      setUrl(OPENSEA_LINK + tokenId);
    }
    else {
      setUrl(undefined);
    }
    setBusy(false);
  }

  useEffect(() => {
    if (starting) {
      count().then((minted) => setRemaining(TOTAL_MINT_COUNT - minted));
    }
  }, [starting, count]);

  return (
    <>
      <button
        onClick={action}
        className="cta-button connect-wallet-button"
        disabled={busy || remaining < 1}
      >
        {busy ? "Minting..." : "Mint NFT"}
      </button>
      {remaining > 0 ? (
        <section className="lead">
          <h1>Hurry while supplies last!</h1>
          <p>{availability}</p>
        </section>
      ) : remaining === 0 ? (
        <h1 className="lead">We ran out of tokens! Sorry!</h1>
      ) : null}
      {url ? (
        <section className="result">
          <h1>NFT Minted!</h1>
          <p>
            Check it out at <a target="_blank" rel="noopener noreferrer" href={url}>OpenSea</a>.
          </p>
        </section>
      ) : null}
    </>
  );
}

export default App;
