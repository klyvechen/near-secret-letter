import * as nearApi from "near-api-js";
import { Buffer } from 'buffer';
import 'bootstrap/dist/css/bootstrap.min.css';
Buffer.from('anything','base64');
window.Buffer = window.Buffer || require("buffer").Buffer;


const { keyStores, KeyPair, connect, WalletConnection } = nearApi;
const keyStore = new keyStores.BrowserLocalStorageKeyStore();
const testnetConfig = {
  networkId: "testnet",
  keyStore, 
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
}

let _near;
let _wallet;
let _likelyNFTsContracts;
let _contracts = {};
let _accToken;

export const util = {

    async getLikelyNFTs() {
        if (!_wallet.isSignedIn()) {
            return
        }
        return _likelyNFTsContracts
    },

    setAccountToken(accToken) {
        _accToken = accToken;
    },

    getAccountToken() {
        return _accToken;
    },

    getWallet() {
        return _wallet
    },

    isConnected() {
        return _wallet.isSignedIn()
    },

    async signOut() {
        return await _wallet.signOut()
    },

    async signIn(contractName, methods) {
        _wallet.requestSignIn({contractId: contractName, methodNames: methods})
        // , successUrl: 'https://webhook.site/aa398144-e525-43c9-b907-87ae071b5614'})
    },

    async connectLikelyNFTs() {
        // const url = 'https://helper.testnet.near.org/account/{0}/likelyNFTs'.replace('{0}', _wallet.getAccountId())
        // const res = await fetch(url)
        // console.log(res)
        // return await res.json();
    },

    async init() {
        _near = await connect(testnetConfig)
        _wallet = new WalletConnection(_near)
    },

    async connectContract(contractName, viewMethods, changeMethods) {
        _contracts[contractName] = await new nearApi.Contract(
            _wallet.account(), // the account object that is connecting
            contractName,
            {
                // name of contract you're connecting to
                viewMethods: viewMethods, // view methods do not change state but usually return a value
                changeMethods: changeMethods, // change methods modify state
                sender: _wallet.account(), // account object to initialize and sign transactions.
            }
        );
    },

    isContractConnected(contractName) {
        return _contracts[contractName] !== undefined
    }, 

    async call(contractName, method, args) {
        return await _contracts[contractName][method](...args)
    }

}