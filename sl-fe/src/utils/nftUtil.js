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

export const utils = {

    getLikelyNFTs() {
        return likelyNFTsContracts
    },

    getWallet() {
        return wallet
    },

    getWalletStatus() {
        return status
    },

    async signOut() {
        await wallet.signOut()
    },

    async signIn() {
        wallet.requestSignIn()
    },

    async connectLikelyNFTs() {
        const url = 'https://helper.testnet.near.org/account/{0}/likelyNFTs'.replace('{0}', wallet.getAccountId())
        const res = await fetch(url)
        console.log(res)
        likelyNFTsContracts = await res.json();
    },

    async init() {
        near = await connect(testnetConfig)
        wallet = new WalletConnection(near)
        status = wallet.isSignedIn()
        if (wallet.isSignedIn()) {
            this.connectLikelyNFTs();
        }
    }

}