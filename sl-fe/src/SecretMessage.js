import { util } from './utils/util';
import './App.css';
import './SecretMessage.css';
import React, { useEffect, useState } from 'react';
import { Buffer } from 'buffer';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as Icon from 'react-bootstrap-icons';

Buffer.from('anything','base64');
window.Buffer = window.Buffer || require("buffer").Buffer;

let nftContractName = 'secret-letter.klyve-hack-2.testnet';

const ONE_NEAR = 1000000000000000000000000;

async function mintWithMessage(message) {
  const yoctoAmount = (0.025 * ONE_NEAR).toLocaleString('fullwide', { useGrouping: false })
  await util.call(nftContractName, 'nft_mint', [{ message: message }, "300000000000000", yoctoAmount])
}

async function readMessage(tokenId, accToken) {
  tokenId = tokenId || 0
  accToken = accToken || ''
  return await util.call(nftContractName, 'read_message', [{ token_id: parseInt(tokenId), access_token_input: accToken, account: util.getWallet().getAccountId() }])
}

async function transferNft(tokenId, receiver) {
  tokenId = tokenId || 0
  return await util.call(nftContractName, 'nft_transfer', [{ token_id: tokenId, receiver_id: receiver }, "300000000000000", "1"])
}

async function initPage(setShowNfts) {
  setShowNfts(await util.call(nftContractName, 'nft_tokens_for_owner', [{ account_id: util.getWallet().getAccountId() }]))
}

async function like() {

}

async function dislike() {
  
}

function SecretLetter(contractConnected) {

  const [showNfts, setShowNfts] = useState([])
  const [secretMessage, setSecretMessage] = useState('')
  const [smTitle, setSmTitle] = useState('')
  const [smDescription, setSmDescription] = useState('')
  const [tokenToTransfer, setTokenToTransfer] = useState('')
  const [receiver, setReceiver] = useState('')
  const [messageContent, setMessageContent] = useState('')

  const [showMessage, setShowMessage] = useState(false);
  const [showSendbox, setShowSendbox] = useState(false);
  const handleClose = () => setShowMessage(false);
  const handleShowMessage = () => setShowMessage(true);
  const handleSendbox = (t) => {
    setTokenToTransfer(t)
    setShowSendbox(true)
  };
  const handleSendboxClose = () => {
    setReceiver('')
    setTokenToTransfer('')
    setShowSendbox(false)
  };

  useEffect(() => {
    if (util.getWallet().isSignedIn() && util.isContractConnected(nftContractName)) {
      initPage(setShowNfts)
    }
  }, [contractConnected])
  return (
    <div className="App">
      <header>
        <ul class="list-group list-group-horizontal-xxl">
          <li class="list-group-item">An item</li>
          <li class="list-group-item">A second item</li>
          <li class="list-group-item">A third item</li>
        </ul>
      </header>
      <article className="App-article">

        {/* {connected && */}
          <div className='row'>
            <div className='col-lg-6 col-md-12'>
              score dashboard
            </div>
            <div className='col-lg-6 col-md-12'>
              <div className="row" style={{marginTop: '5vh'}}>
                <div className="col-12">
                  <div className='d-flex flex-row step-line'>
                    <i className="circle-icon-sm d-flex justify-content-center align-items-center">
                      <Icon.Pencil style={{display: 'block', width:'70%', height: '60%'}}></Icon.Pencil>
                    </i>
                    <p className='step-text'>&nbsp;&nbsp;Write the secret in the letter</p>
                  </div>
                  <div className='d-flex flex-row step-line'>
                    <i className="circle-icon-sm d-flex justify-content-center align-items-center">
                        <Icon.EnvelopePlus style={{display: 'block', width:'70%', height: '60%'}}></Icon.EnvelopePlus>
                    </i> 
                    <p className='step-text'>&nbsp;&nbsp; Mint the letter</p>
                  </div>
                  <div className='d-flex flex-row step-line'>
                    <i className="circle-icon-sm d-flex justify-content-center align-items-center">
                        <Icon.Send style={{display: 'block', width:'70%', height: '60%'}}></Icon.Send>
                    </i> 
                    <p className='step-text'>&nbsp;&nbsp; Sale the letter on the market</p>
                  </div>
                </div>
                <br/>
              </div>
              <div className="d-flex bd-highlight flex-column">
                <div className="input-group mb-1">
                  <span className="input-group-text" id="sm-title" style={{width: '15%'}}><b>T</b><small>itle</small></span>
                  <input type="text" className="form-control" aria-label="Title" aria-describedby="sm-title"
                      value={smTitle} onChange={(e)=>{setSmTitle(e.target.value)}} placeholder="title"></input>
                </div>
                <div className="input-group mb-1">
                  <span className="input-group-text" id="sm-description" style={{width: '15%'}}><b>D</b><small>scp</small></span>
                  <textarea className="form-control" aria-label="Description" aria-describedby="sm-description"
                      value={smDescription} onChange={(e)=>{setSmDescription(e.target.value)}} placeholder="description"></textarea>
                </div>
                <div className="input-group mb-1">
                  <span className="input-group-text" id="sm-secret" style={{width: '15%'}}><b>S</b><small>crt</small></span>  
                  <textarea className="form-control" aria-label="S" aria-describedby="sm-secret"
                      value={secretMessage} onChange={(e)=>{setSecretMessage(e.target.value)}} placeholder="secret"></textarea>
                </div>

                <div className='row d-flex p-2 bd-highlight justify-content-end'>
                  <div className='col-lg-2 col-md-3 col-sm-8' id="mintBtn">
                    <Button className='btn btn-success' id="mintBtn" style={{width: '100%'}}
                      onClick={()=> {
                        if (util.isConnected()) {
                          mintWithMessage(secretMessage)
                        } else {
                          alert('please login before create your letter')
                        }
                      }}> mint
                    </Button> 
                  </div>
                </div>
              </div>
              <br/>
              <br/>
              <h4 className='sl-title'>Your Secret Messages</h4>
              <div className='border border-2 rounded'>
                <div className='row'>      
                  { showNfts.length > 0 && showNfts.map((n, i) => {
                    return ( 
                      <div className='col-lg-6 col-md-6 col-sm-12'>
                        <div className='card d-flex justify-content-around' key={'nft-card' + i}>
                          <img className='card-img-top' alt='Card image cap' src={n.metadata.media} key={'nft' + i}></img>
                          <div className="card-body">
                            <h5 className="card-title text-primary">{n.metadata.title}</h5>
                            <small className="card-text text-secondary">{n.metadata.description}</small>
                          </div>
                        </div>
                        <div>
                          <div className='card d-flex flex-row justify-content-between'>
                            <Button className='btn btn-warning sl-letter-botton' id={'read-' + i} 
                              onClick={async ()=> {
                                const msg = await readMessage(n.token_id, util.getAccountToken())
                                setMessageContent(msg)
                                handleShowMessage()
                              }}  data-bs-toggle="modal" data-bs-target="#exampleModal"> read
                            </Button>
                            <Button className='btn btn-danger sl-letter-botton' id={'transfer-' + i}
                              onClick={async ()=> {
                                handleSendbox(n.token_id)
                              }}> send
                            </Button>
                          </div>
                        </div>
                      </div>)
                  })}
                </div>

                
                <Modal show={showMessage} onHide={handleClose}>
                  <Modal.Header closeButton>
                    <Modal.Title>Secret Message</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>{messageContent}</Modal.Body>
                  <Modal.Footer>
                    <Button variant="primary" onClick={like}>
                      Like
                    </Button>
                    <Button variant="warning" onClick={()=>{dislike()}}>
                      Dislike
                    </Button>
                    <Button variant="secondary" onClick={()=>{handleClose()}}>
                      Close
                    </Button>
                  </Modal.Footer>
                </Modal>

                <Modal show={showSendbox} onHide={handleSendboxClose}>
                  <Modal.Header closeButton>
                    <Modal.Title>Transfer Message</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <span className="input-group-text" id="sm-title" style={{width: '15%'}}><b>To</b></span>
                    <input type="text" className="form-control" aria-label="receiver" aria-describedby="sm-title"
                        value={receiver} onChange={(e)=>{setReceiver(e.target.value)}} placeholder="receiver"></input>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={async () => await transferNft(tokenToTransfer, receiver)}>
                      Submit
                    </Button>
                    <Button variant="secondary" onClick={handleSendboxClose}>
                      Close
                    </Button>
                  </Modal.Footer>
                </Modal>

              </div>
            </div>
          </div>
        {/* } */}

      </article>
    </div>
  );
}

export default SecretLetter