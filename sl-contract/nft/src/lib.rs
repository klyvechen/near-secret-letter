/*!
Non-Fungible Token implementation with JSON serialization.
NOTES:
  - The maximum balance value is limited by u128 (2**128 - 1).
  - JSON calls should pass u128 as a base-10 string. E.g. "100".
  - The contract optimizes the inner trie structure by hashing account IDs. It will prevent some
    abuse of deep tries. Shouldn't be an issue, once NEAR clients implement full hashing of keys.
  - The contract tracks the change in storage before and after the call. If the storage increases,
    the contract requires the caller of the contract to attach enough deposit to the function call
    to cover the storage cost.
    This is done to prevent a denial of service attack on the contract by taking all available storage.
    If the storage decreases, the contract will issue a refund for the cost of the released storage.
    The unused tokens from the attached deposit are also refunded, so it's safe to
    attach more deposit than required.
  - To prevent the deployed contract from being modified or deleted, it should not have any access
    keys on its account.
*/
use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata, NonFungibleTokenMetadataProvider, TokenMetadata, NFT_METADATA_SPEC,
};
use near_contract_standards::non_fungible_token::{Token, TokenId};
use near_contract_standards::non_fungible_token::NonFungibleToken;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{ LazyOption, UnorderedMap };
use near_sdk::{
    env, near_bindgen, ext_contract, log, AccountId, BorshStorageKey, PanicOnDefault, Promise, PromiseOrValue, Balance, PromiseResult, Gas
};
use hex;

// near_sdk::setup_alloc!();

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    id: u128,
    aid: u32,
    account_to_aid: UnorderedMap<AccountId, u32>,
    aid_to_account: UnorderedMap<u32, AccountId>,
    token_to_creator: UnorderedMap<u128, u32>,
    tokens: NonFungibleToken,
    metadata: LazyOption<NFTContractMetadata>,
    secret_message: UnorderedMap<u128, String>,
    aid_to_access_token: UnorderedMap<u32, String>,
}

const DATA_IMAGE_SVG_NEAR_ICON: &str = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 288 288'%3E%3Cg id='l' data-name='l'%3E%3Cpath d='M187.58,79.81l-30.1,44.69a3.2,3.2,0,0,0,4.75,4.2L191.86,103a1.2,1.2,0,0,1,2,.91v80.46a1.2,1.2,0,0,1-2.12.77L102.18,77.93A15.35,15.35,0,0,0,90.47,72.5H87.34A15.34,15.34,0,0,0,72,87.84V201.16A15.34,15.34,0,0,0,87.34,216.5h0a15.35,15.35,0,0,0,13.08-7.31l30.1-44.69a3.2,3.2,0,0,0-4.75-4.2L96.14,186a1.2,1.2,0,0,1-2-.91V104.61a1.2,1.2,0,0,1,2.12-.77l89.55,107.23a15.35,15.35,0,0,0,11.71,5.43h3.13A15.34,15.34,0,0,0,216,201.16V87.84A15.34,15.34,0,0,0,200.66,72.5h0A15.35,15.35,0,0,0,187.58,79.81Z'/%3E%3C/g%3E%3C/svg%3E";

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    NonFungibleToken,
    Metadata,
    TokenMetadata,
    Enumeration,
    Approval,
}

#[near_bindgen]
impl Contract {
    /// Initializes the contract owned by `owner_id` with
    /// default metadata (for example purposes only).
    #[init]
    pub fn new_default_meta(owner_id: AccountId) -> Self {
        Self::new(
            owner_id,
            NFTContractMetadata {
                spec: NFT_METADATA_SPEC.to_string(),
                name: "Secret Letter".to_string(),
                symbol: "SL-NEAR".to_string(),
                icon: Some(DATA_IMAGE_SVG_NEAR_ICON.to_string()),
                base_uri: None,
                reference: None,
                reference_hash: None,
            }
        )
    }

    #[init]
    pub fn new(owner_id: AccountId, metadata: NFTContractMetadata) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        metadata.assert_valid();
        Self {
            id: 0,
            aid: 0,
            account_to_aid: UnorderedMap::new(b"a"),
            aid_to_account: UnorderedMap::new(b"n"),
            token_to_creator: UnorderedMap::new(b"c"),
            tokens: NonFungibleToken::new(
                StorageKey::NonFungibleToken,
                owner_id,
                Some(StorageKey::TokenMetadata),
                Some(StorageKey::Enumeration),
                Some(StorageKey::Approval),
            ),
            metadata: LazyOption::new(StorageKey::Metadata, Some(&metadata)),
            secret_message: UnorderedMap::new(b"m"), 
            aid_to_access_token: UnorderedMap::new(b"p"), 
        }
    }

    pub fn get_access_token(&mut self) -> Option<String> {
        log!("predecessor_account_id {}", &env::predecessor_account_id());
        if self.account_to_aid.get(&env::predecessor_account_id()).is_none() {
            self.aid_to_account.insert(&self.aid, &env::predecessor_account_id());
            self.account_to_aid.insert(&env::predecessor_account_id(), &self.aid);
            self.aid = self.aid + 1;
        }
        let mut access_token : Option<String> = self.aid_to_access_token.get(&self.get_aid(env::predecessor_account_id()));
        match access_token {
            None => {
                let test : String = env::block_timestamp().to_string();
                log!("test {}, access id none", test);
                access_token =  hex::encode(&env::sha256(&env::block_timestamp().to_be_bytes())).get(0..8).map(|s| format!("{}", s));
                log!("test hash {:?}", env::sha256(&env::block_timestamp().to_be_bytes()));
                log!("test hash string {:?}", hex::encode(&env::sha256(&env::block_timestamp().to_be_bytes())).get(0..8).map(|s| format!("{}", s)));
                log!("access_token {:?}", &access_token.as_ref());
                self.aid_to_access_token.insert(&self.get_aid(env::predecessor_account_id()), &access_token.as_ref().unwrap());
            },
            _ => {
                log!("access_token is {:?}", access_token.as_ref());
            }
        }
        access_token
    }

    pub fn remove_access_token(&mut self) {
        self.aid_to_access_token.remove(&self.get_aid(env::predecessor_account_id()));
    }        

    // deprecated
    pub fn set_password(&mut self, password: String) {
        self.aid_to_access_token.insert(&self.get_aid(env::predecessor_account_id()), &password);
    }

    pub fn get_creator_id(&self, token_id: u128) -> Option<AccountId> {
        self.aid_to_account.get(&self.token_to_creator.get(&token_id).unwrap())
    }

    pub fn get_sequence(&self, token_id: u128) -> u128 {
        self.id
    }

    pub fn get_aid(&self, account: AccountId) -> u32 {
        return self.account_to_aid.get(&account).unwrap();
    }

    pub fn get_access_token_by_aid(&self) -> Option<String> {
        return self.aid_to_access_token.get(&self.get_aid(env::predecessor_account_id()));
    }

    pub fn read_message(&self, token_id: u128, account: AccountId, access_token_input: String) -> String {
        let aid = self.get_aid(account.clone());
        let access_token = self.aid_to_access_token.get(&aid);
        match access_token {
            None => {
                "Secret Letter: Please get the access_token first".to_string()
            },
            Some(access_token_input) => {
                let owner_id = self.tokens.owner_by_id.get(&token_id.to_string());
                match self.tokens.owner_by_id.get(&token_id.to_string()) {
                    None => {
                        log!("token_id {}, owner_by token_id {:?}, account {}", token_id, owner_id, account);
                        "Invalid token id!".to_string()
                    },
                    Some(account) => {
                        self.secret_message.get(&token_id).unwrap().to_string()
                    },
                    _ => {
                        log!("token_id {}, owner_by token_id {:?}, account {}", token_id, owner_id, account);
                        "Secret Letter: Only the holder can read the message".to_string() 
                    }
                }
            },
            _ => {
                log!("token_id {}, access_token store {:?}, access_token {}", token_id, access_token, access_token_input);
                "Secret Letter: Password wrong, cannot read the message".to_string()
            }
        }
    }

    pub fn set_message(&mut self, token_id: u128, message: String) -> String {
        if self.token_to_creator.get(&token_id).unwrap() != self.get_aid(env::predecessor_account_id()) {
            return "only owner can set the message".to_string();
        }
        self.secret_message.insert(&token_id, &message);
        "setting message completed".to_string()
    }

    #[payable]
    pub fn nft_mint(&mut self, message : Option<String>) -> Token{
        let amount: Balance = near_sdk::env::attached_deposit();
        log!("attach money is {}, singer_account_id {}, predecessor_account_id {}", amount, env::signer_account_id(), env::predecessor_account_id());
        let token_id = self.id;
        let token: Token = self.tokens.internal_mint_with_refund(self.id.to_string().clone(), env::predecessor_account_id(), 
            Some(TokenMetadata {
                title: Some(format!("Letter #{}", token_id.to_string())), // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
                description: Some(format!("Secret message inside the letter")), // free-form description
                media: Some("https://mndaily.com/wp-content/uploads/2019/06/graphics_6.25.19-letterstotheeditor-CMYK-01-900x900.jpeg".to_string()), // URL to associated media, preferably to decentralized, content-addressed storage
                media_hash: None, // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
                copies: Some(1), // number of copies of this set of metadata in existence when token was minted.
                issued_at: None, // When token was issued or minted, Unix epoch in milliseconds
                expires_at: None, // When token expires, Unix epoch in milliseconds
                starts_at: None, // When token starts being valid, Unix epoch in milliseconds
                updated_at: None, // When token was last updated, Unix epoch in milliseconds
                extra: None, // anything extra the NFT wants to store on-chain. Can be stringified JSON.
                reference: None, // URL to an off-chain JSON file with more info.
                reference_hash: None 
            }),
            None
        );
        self.token_to_creator.insert(&token_id, &self.get_aid(env::predecessor_account_id()));
        self.secret_message.insert(&token_id, &message.unwrap());
        self.id = self.id + 1;
        token
    }
}

near_contract_standards::impl_non_fungible_token_core!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_approval!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_enumeration!(Contract, tokens);

#[near_bindgen]
impl NonFungibleTokenMetadataProvider for Contract {
    fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().unwrap()
    }
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests {
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    use super::*;

    const MINT_STORAGE_COST: u128 = 5870000000000000000000;

    fn get_context(predecessor_account_id: AccountId) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .current_account_id(accounts(0))
            .signer_account_id(predecessor_account_id.clone())
            .predecessor_account_id(predecessor_account_id);
        builder
    }

    fn sample_token_metadata() -> TokenMetadata {
        TokenMetadata {
            title: Some("Olympus Mons".into()),
            description: Some("The tallest mountain in the charted solar system".into()),
            media: None,
            media_hash: None,
            copies: Some(1u64),
            issued_at: None,
            expires_at: None,
            starts_at: None,
            updated_at: None,
            extra: None,
            reference: None,
            reference_hash: None,
        }
    }

    #[test]
    fn test_random_seed() {
        log!("{}", env::random_seed().get(..16).unwrap().to_vec());
    }

    #[test]
    fn test_ran() {
        log!("{}", get_img_uri());
    }

    #[test]
    fn test_new() {
        let mut context = get_context(accounts(1));
        testing_env!(context.build());
        let contract = Contract::new_default_meta(accounts(1).into());
        testing_env!(context.is_view(true).build());
        assert_eq!(contract.nft_token("1".to_string()), None);
    }

    #[test]
    #[should_panic(expected = "The contract is not initialized")]
    fn test_default() {
        let context = get_context(accounts(1));
        testing_env!(context.build());
        let _contract = Contract::default();
    }

    #[test]
    fn test_mint() {
        let mut context = get_context(accounts(0));
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(accounts(0).into());

        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(MINT_STORAGE_COST)
            .predecessor_account_id(accounts(0))
            .build());

        let token_id = "0".to_string();
        let token = contract.nft_mint(token_id.clone(), accounts(0), sample_token_metadata());
        assert_eq!(token.token_id, token_id);
        assert_eq!(token.owner_id, accounts(0).to_string());
        assert_eq!(token.metadata.unwrap(), sample_token_metadata());
        assert_eq!(token.approved_account_ids.unwrap(), HashMap::new());
    }

    #[test]
    fn test_transfer() {
        let mut context = get_context(accounts(0));
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(accounts(0).into());

        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(MINT_STORAGE_COST)
            .predecessor_account_id(accounts(0))
            .build());
        let token_id = "0".to_string();
        contract.nft_mint(token_id.clone(), accounts(0), sample_token_metadata());

        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(1)
            .predecessor_account_id(accounts(0))
            .build());
        contract.nft_transfer(accounts(1), token_id.clone(), None, None);

        testing_env!(context
            .storage_usage(env::storage_usage())
            .account_balance(env::account_balance())
            .is_view(true)
            .attached_deposit(0)
            .build());
        if let Some(token) = contract.nft_token(token_id.clone()) {
            assert_eq!(token.token_id, token_id);
            assert_eq!(token.owner_id, accounts(1).to_string());
            assert_eq!(token.metadata.unwrap(), sample_token_metadata());
            assert_eq!(token.approved_account_ids.unwrap(), HashMap::new());
        } else {
            panic!("token not correctly created, or not found by nft_token");
        }
    }

    #[test]
    fn test_approve() {
        let mut context = get_context(accounts(0));
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(accounts(0).into());

        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(MINT_STORAGE_COST)
            .predecessor_account_id(accounts(0))
            .build());
        let token_id = "0".to_string();
        contract.nft_mint(token_id.clone(), accounts(0), sample_token_metadata());

        // alice approves bob
        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(150000000000000000000)
            .predecessor_account_id(accounts(0))
            .build());
        contract.nft_approve(token_id.clone(), accounts(1), None);

        testing_env!(context
            .storage_usage(env::storage_usage())
            .account_balance(env::account_balance())
            .is_view(true)
            .attached_deposit(0)
            .build());
        assert!(contract.nft_is_approved(token_id.clone(), accounts(1), Some(1)));
    }

    #[test]
    fn test_revoke() {
        let mut context = get_context(accounts(0));
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(accounts(0).into());

        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(MINT_STORAGE_COST)
            .predecessor_account_id(accounts(0))
            .build());
        let token_id = "0".to_string();
        contract.nft_mint(token_id.clone(), accounts(0), sample_token_metadata());

        // alice approves bob
        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(150000000000000000000)
            .predecessor_account_id(accounts(0))
            .build());
        contract.nft_approve(token_id.clone(), accounts(1), None);

        // alice revokes bob
        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(1)
            .predecessor_account_id(accounts(0))
            .build());
        contract.nft_revoke(token_id.clone(), accounts(1));
        testing_env!(context
            .storage_usage(env::storage_usage())
            .account_balance(env::account_balance())
            .is_view(true)
            .attached_deposit(0)
            .build());
        assert!(!contract.nft_is_approved(token_id.clone(), accounts(1), None));
    }

    #[test]
    fn test_revoke_all() {
        let mut context = get_context(accounts(0));
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(accounts(0).into());

        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(MINT_STORAGE_COST)
            .predecessor_account_id(accounts(0))
            .build());
        let token_id = "0".to_string();
        contract.nft_mint(token_id.clone(), accounts(0), sample_token_metadata());

        // alice approves bob
        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(150000000000000000000)
            .predecessor_account_id(accounts(0))
            .build());
        contract.nft_approve(token_id.clone(), accounts(1), None);

        // alice revokes bob
        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(1)
            .predecessor_account_id(accounts(0))
            .build());
        contract.nft_revoke_all(token_id.clone());
        testing_env!(context
            .storage_usage(env::storage_usage())
            .account_balance(env::account_balance())
            .is_view(true)
            .attached_deposit(0)
            .build());
        assert!(!contract.nft_is_approved(token_id.clone(), accounts(1), Some(1)));
    }
}
