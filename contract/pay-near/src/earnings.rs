use crate::*;

pub trait Earnings {
  fn payout(&mut self) -> bool;
}

#[near_bindgen]
impl Earnings for Contract {
  fn payout(&mut self) -> bool {
    env::log_str("This fn withdraw earnings to contract owner. Leave 5N to maintain contract.");

    let caller = env::predecessor_account_id();
    if !(caller == "wabinab.near".parse().unwrap() 
      || caller == "wabinab.testnet".parse().unwrap()
    ) {
      env::panic_str("Only wabinab.near or wabinab.testnet can call this function.");
    }

    let acc_near: NearToken = NearToken::from_yoctonear(env::account_balance());
    if acc_near.as_near() <= 5 { 
      env::log_str(format!("Account balance: {}N. Insufficient to withdraw.", 
        yoctonear_to_near(env::account_balance())
      ).as_str());
      return false; 
    }

    let withdraw_amt: NearToken = acc_near.checked_sub(NearToken::from_near(5))
      .unwrap_or_else(|| env::panic_str("earnings: payout: Cannot subtract acc_near from 5."));

    refund(withdraw_amt.as_yoctonear());
    return true;
  }
}