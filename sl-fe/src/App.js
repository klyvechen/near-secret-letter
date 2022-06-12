import { util } from './utils/util';
import React, { useState, useEffect } from 'react';
import {Navbar, Nav, NavItem, Container, Row, Col} from 'react-bootstrap'
import {BrowserRouter, Route, Routes, Link} from 'react-router-dom'
import SecretLetter from './SecretLetter'
import SecretMessage from './SecretMessage'
import MessageBox from './MessageBox'
import Home from './Home'
import Loading from './Loading'
import './App.css';

import {Buffer} from 'buffer';
Buffer.from('anything','base64');
window.Buffer = window.Buffer || require('buffer').Buffer;

let nftContractName = 'secret-letter.klyve-hack-2.testnet';

async function connectSLContract() {
  console.log('do connectContract in')
  // const viewMethods = ['nft_total_supply', 'nft_tokens', 'nft_supply_for_owner', 'nft_tokens_for_owner', 'read_message']
  // const changeMethods = ['nft_mint', 'set_message', 'set_password', 'nft_transfer']
  const viewNftMethods = ['nft_total_supply', 'nft_tokens', 'nft_supply_for_owner', 'nft_tokens_for_owner', 'read_message']
  const changeNftMethods = ['get_access_token', 'nft_mint', 'nft_transfer']
  await util.connectContract(nftContractName, viewNftMethods, changeNftMethods)
  console.log('do connectContract out')
}

let connecting = false
const accessTokenPrifix = 'sl-access-token:' + nftContractName + ':'

function App() {

  async function initApp() {
    if (connecting) {
      return
    }
    const localToken = window.localStorage.getItem(accessTokenPrifix + util.getWallet().getAccountId());
    connecting = true
    console.log('start to initiate app')
    await connectSLContract()
    let connected = util.isContractConnected(nftContractName)
    setContractConnected(connected)
    if (accessToken == null) {
      if (!localToken && connected) {
        let accToken = await util.call(nftContractName, ['get_access_token'], [{}])
        window.localStorage.setItem(accessTokenPrifix + util.getWallet().getAccountId(), accToken)
        util.setAccountToken(accToken)
        setAccessToken(accToken)
        console.log(accToken)
      } else {
        util.setAccountToken(localToken)
        setAccessToken(localToken)
      }
    }
    console.log('end to initiate app')
    connecting = false
  }

  const [login, setLogin] = useState(util.isConnected() ? util.getWallet().getAccountId() : 'Login')
  const [contractConnected, setContractConnected] = useState(false)
  const [accessToken, setAccessToken] = useState(null)

  useEffect(() => {
    if (util.isConnected()) {
      setLogin(util.getWallet().getAccountId())
      initApp()
    }
  }, [])

  return (
      <BrowserRouter>
      { ((contractConnected && accessToken != null) || !contractConnected) ?
        <>
        <nav className='navbar navbar-light bg-light d-flex justify-content-between'>
          <div style={{paddingLeft: '10px'}}>
            <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbarToggleExternalContent' aria-controls='navbarToggleExternalContent' 
              aria-expanded='true' aria-label='Toggle navigation'>
              <span className='navbar-toggler-icon'></span>
            </button>
          </div>
          <div style={{paddingRight: '10px'}}>
            {login === 'Login' ? 
            <button className='btn btn-success' style={{color: 'white', fontFamily: 'Rubik-VariableFont_wght' }} type='button'
              onClick={()=> { 
                util.signIn(nftContractName, ['set_access_token', 'get_access_token'])
              }}
            >{login}</button> :
            <button className='btn btn-success' style={{color: 'white', fontFamily: 'Rubik-VariableFont_wght' }} type='button'
              onClick={()=> { 
                setLogin('Login')
                util.signOut()
              }}
            >{login}</button>
            }
          </div>
        </nav>
        <div className='collapse' id='navbarToggleExternalContent' style={{width: '100%', position: 'absolute', zIndex: '2'}}>
          <div className='bg-light'>
            <div className='sl-navbar-brand-container-first'>
              <Link className='sl-navbar-brand' style={{color: 'DimGrey'}} to='/home' 
                onClick={()=>{document.getElementById('navbarToggleExternalContent').classList.remove('show')}}
                >Home</Link>
            </div>
            <div className='sl-navbar-brand-container'>
              <Link className='sl-navbar-brand' style={{color: 'DimGrey'}} to='/messagebox'
                onClick={()=>{document.getElementById('navbarToggleExternalContent').classList.remove('show')}}
                >Messagebox</Link>
            </div>
            <div className='sl-navbar-brand-container'>
              <Link className='sl-navbar-brand' style={{color: 'DimGrey'}} to='/secretmessage'
                onClick={()=>{document.getElementById('navbarToggleExternalContent').classList.remove('show')}}
                >Secret Message</Link>
            </div>
            <div className='sl-navbar-brand-container'>
              <Link className='sl-navbar-brand' style={{color: 'DimGrey'}} to='/about'
                onClick={()=>{document.getElementById('navbarToggleExternalContent').classList.remove('show')}}
                >About</Link>
            </div>
          </div>
        </div>
        <Container fluid={true}>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/home' element={<Home/>}/>
            <Route path='/messagebox' element={<MessageBox/>}/>
            <Route path='/secretmessage' element={<SecretMessage contractConnected={contractConnected}/>}/>
          </Routes>
        </Container>
        </>:
        <Container fluid={true}>
          <Routes>
            <Route path='/' element={<Loading/>}/>
            <Route path='/home' element={<Loading/>}/>
            <Route path='/messagebox' element={<Loading/>}/>
            <Route path='/secretmessage' element={<Loading/>}/>
          </Routes>
        </Container>
        }
      </BrowserRouter>    
  );
}

export default App;
