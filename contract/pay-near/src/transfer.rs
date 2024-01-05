use crate::*;

pub trait Transfer {
  // Transfer money: includes 0.1% (capped 0.1N) to this account. 
  fn transfer(&mut self, target: AccountId, amount: U128, date: String) -> Receipt;

  // Get statistics of receiving. 
  fn activate_statistics(&mut self);  // deposit to cover storage cost.
  fn stats_activated(&self, account: AccountId) -> bool;  // check if this guys activated statistics.
  fn get_statistics(&self, s_or_r: String) -> Statistics;

  // Check latest: whether transaction finished. 
  fn latest_transaction(&self) -> Receipt;
}

#[near_bindgen]
impl Transfer for Contract {
  #[payable]
  fn transfer(&mut self, target: AccountId, amount: U128, date: String) -> Receipt {
    let contract_caller = env::predecessor_account_id();
    let amount: u128 = amount.0;
    if contract_caller == target { env::panic_str("You cannot pay to yourself."); }
    if env::attached_deposit() < amount { env::panic_str("Insufficient money attached."); }
    let refund = env::attached_deposit() - amount;  // If attached_deposit more, we'll refund the extra later. 
    
    // Transfer included refund. 
    let mut receipt: Receipt = handle_transfer(amount, target, refund);
    receipt.paid = to_human(env::attached_deposit());

    // Date is for statistics. 

    return receipt;
  }

  #[payable]
  fn activate_statistics(&mut self) {
    let caller = env::predecessor_account_id();

    // Check if already activated statistics. 
    if self.stats_acc.contains(&caller) { env::panic_str("Account already activated."); }
    let deposit = NearToken::from_yoctonear(env::attached_deposit());

    if deposit < NearToken::from_millinear(750) {
      env::panic_str("Requires 0.75N - 1N for storage.");
    }
    // Refund if more than 1N attached. 
    if deposit > NearToken::from_near(1) {
      // let deposit = NearToken::from_yoctonear(env::attached_deposit());
      let refund_amt = deposit.checked_sub(NearToken::from_near(1)).unwrap_or_else(|| 
        env::panic_str("activate_statistics: Deposit refund_amt cannot subtract.")
      );
      refund(refund_amt.as_yoctonear());
    }

    self.stats_acc.insert(caller);
  }

  fn stats_activated(&self, account: AccountId) -> bool {
    return self.stats_acc.contains(&account);
  }

  fn get_statistics(&self, s_or_r: String) -> Statistics {
    return Statistics {
      account_id: "null.near".to_owned().parse().unwrap(),
      bins: Vec::new(),
      values: Vec::new()
    };
  }

  fn latest_transaction(&self) -> Receipt {
    return Receipt { 
        from: "null.near".to_owned().parse().unwrap(),
        to: "null.near".to_owned().parse().unwrap(),
        total: "0".to_owned(),
        charges: "0".to_owned(),
        final_total: "0".to_owned(),
        paid: "0".to_owned(),
        refund: None
    };
  }
}