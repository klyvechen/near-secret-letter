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

let near;
let wallet;
let status;
let likelyNFTsContracts;
let contracts = {};

export const util = {

    async getLikelyNFTs() {
        if (!wallet.isSignedIn()) {
            return
        }
        return likelyNFTsContracts
    },

    getWallet() {
        return wallet
    },

    isConnected() {
        return status
    },

    async signOut() {
        return await wallet.signOut()
    },

    async signIn() {
        wallet.requestSignIn()
    },

    async connectLikelyNFTs() {
        const url = 'https://helper.testnet.near.org/account/{0}/likelyNFTs'.replace('{0}', wallet.getAccountId())
        const res = await fetch(url)
        console.log(res)
        return await res.json();
    },

    async init() {
        near = await connect(testnetConfig)
        wallet = new WalletConnection(near)
        status = wallet.isSignedIn()
        if (wallet.isSignedIn()) {
            likelyNFTsContracts = await this.connectLikelyNFTs()
        }
    },

    async connectContract(contractName, viewMethods, changeMethods) {
        contracts[contractName] = await new nearApi.Contract(
            wallet.account(), // the account object that is connecting
            contractName,
            {
                // name of contract you're connecting to
                viewMethods: viewMethods, // view methods do not change state but usually return a value
                changeMethods: changeMethods, // change methods modify state
                sender: wallet.account(), // account object to initialize and sign transactions.
            }
        );
    },

    async call(contractName, method, args) {
        return await contracts[contractName][method](...args)
    }

}