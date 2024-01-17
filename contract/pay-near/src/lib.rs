// Find all our documentation at https://docs.near.org
// use chrono::{NaiveDateTime, Datelike};
use string_calc::*;
use std::collections::HashMap;
use near_helper::*;
use near_units::near::to_human;
use near_token::NearToken;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
// use near_sdk::env::log_str;
use near_sdk::json_types::U128;
use near_sdk::store::{self, LookupMap, Vector, LookupSet};
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
    // stats_acc: LookupSet<AccountId>,  // what accounts activated statistics. 
    earn_stats: LookupMap<AccountId, Statistics>,
    spend_stats: LookupMap<AccountId, Statistics>,
    final_receipt: LookupMap<AccountId, Receipt>,  // for "earner" only. 
}

// For migration. 
// #[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
// pub struct OldState {
//   earn_stats: LookupMap<AccountId, Statistics>,
//   spend_stats: LookupMap<AccountId, Statistics>,
// }

#[derive(BorshSerialize, BorshStorageKey)]
enum SKey {
  // StatsAcc,
  EarnStats,
  SpendStats,
  FinalReceipt
}


// Implement the contract structure
#[near_bindgen]
impl Contract {
    #[init]
    pub fn new() -> Self {
      let mut this = Self {
        // stats_acc: LookupSet::new(SKey::StatsAcc.try_to_vec().unwrap()),
        earn_stats: LookupMap::new(SKey::EarnStats.try_to_vec().unwrap()),
        spend_stats: LookupMap::new(SKey::SpendStats.try_to_vec().unwrap()),
        final_receipt: LookupMap::new(SKey::FinalReceipt.try_to_vec().unwrap()),
      };

      this
    }

    // NOTE: Private functions can only be called by env::current_account. 
    // #[private]
    // #[init(ignore_state)]
    // pub fn migrate() -> Self {
    //   let old_state: OldState = env::state_read().unwrap_or_else(|| env::panic_str("failed migration.") );

    //   env::log_str("Migration successful.");
    //   Self {
    //     earn_stats: old_state.earn_stats,
    //     spend_stats: old_state.spend_stats,
    //     final_receipt: LookupMap::new(SKey::FinalReceipt.try_to_vec().unwrap()),
    //   }
    // }
}


/*
 * The rest of this file holds the inline tests for the code above
 * Learn more about Rust tests: https://doc.rust-lang.org/book/ch11-01-writing-tests.html
 */
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    fn get_context(predecessor_account_id: AccountId) -> VMContextBuilder {
      let mut builder = VMContextBuilder::new();
      builder
          .current_account_id(accounts(0))
          .signer_account_id(predecessor_account_id.clone())
          .predecessor_account_id(predecessor_account_id);
      builder
    }

    fn get_context_deposit(predecessor_account_id: AccountId, deposit: u128) -> VMContextBuilder {
      let mut builder = VMContextBuilder::new();
      builder
          .current_account_id(accounts(0))
          .signer_account_id(predecessor_account_id.clone())
          .predecessor_account_id(predecessor_account_id)
          .attached_deposit(deposit);
      builder
    }

    #[test]
    fn test_statistics_activation() {
      let mut contract = Contract::new();
      let mut context = get_context_deposit(accounts(1), 
        NearToken::from_millinear(750).as_yoctonear()
      );
      testing_env!(context.build());
      contract.activate_statistics();
      assert_eq!(contract.stats_activated(accounts(1)), true);
      // assert_eq!(contract.stats_activated(None), true);

      let context = get_context(accounts(2));
      testing_env!(context.build());
      // assert_eq!(contract.stats_activated(None), false);
      assert_eq!(contract.stats_activated(accounts(1)), true);

      // assert_eq!(contract.stats_acc.length, 1);
    }

    #[test]
    fn test_statistics_as_expected() {
      let mut contract = Contract::new();
      let mut context = get_context_deposit(accounts(1), 
        NearToken::from_millinear(750).as_yoctonear()
      );
      testing_env!(context.build());
      contract.activate_statistics();

      let init_stats = contract.get_earnings(accounts(1)).unwrap();
      assert_eq!(init_stats.bins_months.len(), init_stats.values_months.len());
      assert_eq!(init_stats.bins_years.len(), init_stats.values_years.len());
      println!("{:#?}", init_stats);
    }

    #[test]
    fn test_receipt_as_expected() {
      let mut contract = Contract::new();
      let mut context = get_context_deposit(accounts(1), 
        NearToken::from_millinear(100).as_yoctonear()
      );
      testing_env!(context.build());
      let before_init = contract.latest_transaction(accounts(1));
      assert_eq!(before_init, None);

      contract.activate_receipt();
      let after_init = contract.latest_transaction(accounts(1));
      assert_ne!(after_init, None);

      let context1 = get_context_deposit(accounts(2), 
        NearToken::from_millinear(100).as_yoctonear()
      );
      testing_env!(context1.build());
      contract.activate_receipt();
      // Cannot call this below, otherwise will fail with confusing reasonings. 
      // let before_transfer = contract.latest_transaction(accounts(1));

      let context2 = get_context_deposit(accounts(2), 
        NearToken::from_near(120).as_yoctonear()
      );
      testing_env!(context2.build());

      // Transfer and test change. 
      contract.transfer(accounts(1), U128::from(NearToken::from_near(100).as_yoctonear()));
      let after_transfer = contract.latest_transaction(accounts(1)).unwrap();
      assert_eq!(after_transfer.from, accounts(2));
      assert_eq!(after_transfer.to, accounts(1));
      assert_eq!(after_transfer.total, "100 N".to_owned());
      assert_eq!(after_transfer.charges, "100 mN".to_owned());
      assert_eq!(after_transfer.final_total, "99.9 N".to_owned());
      assert_eq!(after_transfer.paid, "120 N".to_owned());
      assert_eq!(after_transfer.refund, Some("20 N".to_owned()));
      // assert_eq!(before_transfer.clone(), after_transfer.clone());
    }
}
