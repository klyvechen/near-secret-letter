import { util } from './utils/util';
import './App.css';
import React, { useEffect, useState } from 'react';
import { Buffer } from 'buffer';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


Buffer.from('anything','base64');
window.Buffer = window.Buffer || require("buffer").Buffer;

let nfts = {}
let nftContractName = 'secret-letter.klyve-hack.testnet';

const ONE_NEAR = 1000000000000000000000000;

async function mintWithMessage(message) {
  await connectNFtContract()
  const yoctoAmount = (0.025 * 1000000000000000000000000).toLocaleString('fullwide', { useGrouping: false })
  await util.call(nftContractName, 'nft_mint', [{ message: message }, "300000000000000", yoctoAmount])
}

async function readMessage(tokenId, password) {
  await connectNFtContract()
  tokenId = tokenId || 0
  password = password || ''
  return await util.call(nftContractName, 'read_message', [{ token_id: parseInt(tokenId), password: password, account: util.getWallet().getAccountId() }])
}

async function transferNft(tokenId, receiver) {
  await connectNFtContract()
  tokenId = tokenId || 0
  return await util.call(nftContractName, 'nft_transfer', [{ token_id: tokenId, receiver_id: receiver }, "300000000000000", "1"])
}

async function setAccountPassword(password) {
  await connectNFtContract()
  return await util.call(nftContractName, 'set_password', [{ password: password }])
}


async function connectNFtContract() {
  const viewMethods = ['nft_total_supply', 'nft_tokens', 'nft_supply_for_owner', 'nft_tokens_for_owner', 'read_message']
  const changeMethods = ['nft_mint', 'set_message', 'set_password', 'nft_transfer']
  await util.connectContract(nftContractName, viewMethods, changeMethods)
  console.log('nft contract connected')
}

async function handleLikelyNFTs(setShowNfts) {
  const nftContracts = await util.getLikelyNFTs()
  var filtered = nftContracts.filter(function(value, index, arr){ 
    return value !== nftContractName;
  });
  filtered = [nftContractName, ...filtered]
  const viewNftMethods = ['nft_total_supply', 'nft_tokens', 'nft_supply_for_owner', 'nft_tokens_for_owner']
  const changeNftMethods = []
  const walletId = util.getWallet().getAccountId()
  for (var c of filtered) {
    await util.connectContract(c, viewNftMethods, changeNftMethods)
    nfts[c] = await util.call(c, 'nft_tokens_for_owner', [{ account_id: walletId }])
  }
  let show = []
  for (var prop in nfts) {
    show = [...show, ...nfts[prop]]
  }
  setShowNfts(show)
}

async function initPage(setShowNfts, setConnected) {
  setConnected(util.isConnected())
  handleLikelyNFTs(setShowNfts)
}

function SecretLetter() {

  const [connected, setConnected] = useState(false);
  const [showNfts, setShowNfts] = useState([]);
  const [secretMessage, setSecretMessage] = useState('');
  const [letterNumber, setLetterNumber] = useState('');
  const [messageToShow, setMessageToShow] = useState('');
  const [password, setPassword] = useState('');
  const [passwordToSend, setPasswordToSend] = useState('');
  const [tokenToTransfer, setTokenToTransfer] = useState('');
  const [receiver, setReceiver] = useState('');

  useEffect(() => {
    console.log(util.getWallet())
    console.log(util.isConnected())
    if (util.getWallet().isSignedIn()) {
      initPage(setShowNfts, setConnected)
    }
  }, [connected])
  return (
    <div className="App">
      <header className="App-article">
        <div>
          <div className="row">
            <div className="col-md-8 col-sm-12">
            </div>
            <div className="col-12">
              <p>Step</p>
              <p>1. Set up password for the account</p>
              <p>2. mint secret message with a letter</p>
              <p>3. Check the secret message with your password</p>
              <p>4. Send the letter to a friend, let him know the secret message</p>
            </div>
            <br/>
          </div>
          <br/>
        </div>
        {connected &&
          <div>
            <div className="d-flex bd-highlight flex-column">
              <input style={{fontSize: "14px", textAlign: "center"}} type="text" value={password} onChange={(e)=>{setPassword(e.target.value)}} placeholder="password"/>
              <Button variant="alert alert-success" id="mintBtn" 
                onClick={()=> {
                  setAccountPassword(password)
                }}> set password
              </Button>
            </div>
            <br/>
            <div className="d-flex bd-highlight flex-column">
              <input style={{fontSize: "14px", textAlign: "center"}} type="text" value={secretMessage} onChange={(e)=>{setSecretMessage(e.target.value)}} placeholder="message to mint"/>
              <Button variant="alert alert-success" id="mintBtn" 
                onClick={()=> {
                  mintWithMessage(secretMessage)
                }}> mint with message
              </Button>
            </div>
            <br/>
            <div className="d-flex bd-highlight flex-column">
              <input style={{fontSize: "14px", textAlign: "center"}} type="text" value={passwordToSend} onChange={(e)=>{setPasswordToSend(e.target.value)}} placeholder="enter password"/>
              <input style={{fontSize: "14px", textAlign: "center"}} type="text" value={letterNumber} onChange={(e)=>{setLetterNumber(e.target.value)}} placeholder="enter the #number of the letter"/>
              <Button variant="alert alert-success" id="mintBtn" 
                onClick={async ()=> {
                  const msg = await readMessage(letterNumber, passwordToSend)
                  setMessageToShow(msg)
                }}> read message
              </Button>
              <div className="border border-secondary">
                <div className="border border-secondary">
                  <p>{messageToShow}</p>
                </div>
              </div>
            </div>
            <br/>
            <div className="d-flex bd-highlight flex-column">
              <input style={{fontSize: "14px", textAlign: "center"}} type="text" value={tokenToTransfer} onChange={(e)=>{setTokenToTransfer(e.target.value)}} placeholder="transfer token id"/>
              <input style={{fontSize: "14px", textAlign: "center"}} type="text" value={receiver} onChange={(e)=>{setReceiver(e.target.value)}} placeholder="receiver id"/>
              <Button variant="alert alert-success" id="mintBtn" 
                onClick={async ()=> {
                  await transferNft(tokenToTransfer, receiver)
                }}> transfer nft
              </Button>
            </div>

            <br/>
            <div className="border border-secondary">
              <div>
                Your currnet NFTs
              </div>
              <div className="row">      
                { showNfts.length > 0 && showNfts.map((n, i) => {
                  return ( 
                    <div className="col-lg-6 col-md-6 col-sm-12">
                      <div className="card d-flex justify-content-around" key={'nft-card' + i}>
                        <img className="card-img-top" alt="Card image cap" src={n.metadata.media} key={'nft' + i}></img>
                        <div className="card-body">
                          <h5 className="card-title text-primary">{n.metadata.title}</h5>
                          <small className="card-text text-secondary">{n.metadata.description}</small>
                          {/* <a href="#" className="btn btn-primary">Go somewhere</a> */}
                        </div>
                      </div>
                    </div>)
                })}
              </div>
            </div>
          </div>
        }

      </header>
    </div>
  );
}

export default SecretLetter