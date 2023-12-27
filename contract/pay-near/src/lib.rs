// Find all our documentation at https://docs.near.org
use string_calc::*;
use near_units::near::to_human;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
// use near_sdk::env::log_str;
use near_sdk::store::{self, LookupMap, Vector};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{near_bindgen, env, AccountId, BorshStorageKey, PanicOnDefault, Balance, Promise};

pub use crate::transfer::*;
use crate::metadata::*;
use crate::internal::*;

mod transfer;
mod metadata;
mod internal;

// Define the contract structure
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    // greeting: String,
    // We'll add the required ones later. 
}

// #[derive(BorshSerialize, BorshStorageKey)]
// enum SKey {

// }

// Define the default, which automatically initializes the contract
// impl Default for Contract {
//     fn default() -> Self {
//         Self { greeting: "Hello".to_string() }
//     }
// }

// Implement the contract structure
#[near_bindgen]
impl Contract {
    #[init]
    pub fn new() -> Self {
      let mut this = Self {

      };

      this
    }
}

/*
 * The rest of this file holds the inline tests for the code above
 * Learn more about Rust tests: https://doc.rust-lang.org/book/ch11-01-writing-tests.html
 */
#[cfg(test)]
mod tests {
    use super::*;

    // #[test]
    // fn get_default_greeting() {
    //     let contract = Contract::default();
    //     // this test did not call set_greeting so should return the default "Hello" greeting
    //     assert_eq!(
    //         contract.get_greeting(),
    //         "Hello".to_string()
    //     );
    // }

    // #[test]
    // fn set_then_get_greeting() {
    //     let mut contract = Contract::default();
    //     contract.set_greeting("howdy".to_string());
    //     assert_eq!(
    //         contract.get_greeting(),
    //         "howdy".to_string()
    //     );
    // }
}
