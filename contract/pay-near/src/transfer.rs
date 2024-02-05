use crate::*;

pub trait Transfer {
  // Transfer money: includes 0.1% (capped 0.025N) to this account. 
  fn transfer(&mut self, target: AccountId, amount: U128) -> Receipt;

  // Get statistics of receiving. 
  fn activate_statistics(&mut self);  // deposit to cover storage cost.
  fn stats_activated(&self, account: AccountId) -> bool;  // check if this guys activated statistics.
  fn get_earnings(&self, account: AccountId) -> Option<&Statistics>;
  fn get_spendings(&self, account: AccountId) -> Option<&Statistics>;

  // Check latest: whether transaction finished. 
  fn activate_receipt(&mut self);
  fn receipt_activated(&self, account: AccountId) -> bool;
  fn latest_transaction(&self, account: AccountId) -> Option<&Receipt>;
}

#[near_bindgen]
impl Transfer for Contract {
  #[payable]
  fn transfer(&mut self, target: AccountId, amount: U128) -> Receipt {
    let contract_caller = env::predecessor_account_id();
    let amount: u128 = amount.0;
    if contract_caller == target { env::panic_str("You cannot pay to yourself."); }
    if env::attached_deposit() < amount { env::panic_str("Insufficient money attached."); }
    let refund = env::attached_deposit() - amount;  // If attached_deposit more, we'll refund the extra later. 
    
    // Transfer included refund. 
    let (mut receipt, remnant) = handle_transfer(amount, target.clone(), refund);
    receipt.paid = to_human(env::attached_deposit());

    // Probably we'll do statistics for payers but in the future. 
    if self.earn_stats.contains_key(&target) {
      let old_stats = self.earn_stats.get(&target);
      let stats = add_stats(target.clone(), old_stats, remnant);
      self.earn_stats.insert(target.clone(), stats);
    }
    if self.spend_stats.contains_key(&contract_caller) {
      let old_stats = self.spend_stats.get(&contract_caller);
      let stats = add_stats(contract_caller.clone(), old_stats, amount);
      self.spend_stats.insert(contract_caller.clone(), stats);
    }
    // Receipt is for receiver to detect a change in value. 
    if self.final_receipt.contains_key(&target) {
      self.final_receipt.insert(target.clone(), receipt.clone());
    }

    return receipt;
  }

  // =========================================================================
  #[payable]
  fn activate_statistics(&mut self) {
    let caller = env::predecessor_account_id();

    // Check if already activated statistics. 
    if self.earn_stats.contains_key(&caller) { env::panic_str("Account already activated."); }
    let deposit = NearToken::from_yoctonear(env::attached_deposit());

    if deposit < NearToken::from_millinear(750) {
      env::panic_str("Requires 0.75N to 1N (your choice) for storage.");
    }
    // Refund if more than 1N attached. 
    if deposit > NearToken::from_near(1) {
      // let deposit = NearToken::from_yoctonear(env::attached_deposit());
      let refund_amt = deposit.checked_sub(NearToken::from_near(1)).unwrap_or_else(|| 
        env::panic_str("activate_statistics: Deposit refund_amt cannot subtract.")
      );
      refund(refund_amt.as_yoctonear());
    }

    let stats = add_stats(caller.clone(), None, 0);
    self.earn_stats.insert(caller.clone(), stats.clone());
    self.spend_stats.insert(caller, stats);
  }

  fn stats_activated(&self, account: AccountId) -> bool {
    return self.earn_stats.contains_key(&account) & self.spend_stats.contains_key(&account);
  }

  fn get_earnings(&self, account: AccountId) -> Option<&Statistics> {
    return self.earn_stats.get(&account);
  }

  fn get_spendings(&self, account: AccountId) -> Option<&Statistics> {
    return self.spend_stats.get(&account);
  }

  // =================================================================
  #[payable]
  fn activate_receipt(&mut self) {
    let caller = env::predecessor_account_id();

    if self.final_receipt.contains_key(&caller) { env::panic_str("Account already activated."); }
    let deposit = NearToken::from_yoctonear(env::attached_deposit());

    if deposit < NearToken::from_millinear(100) {
      env::panic_str("Requires 0.1N to 0.2N (your choice) for storage.");
    }
    // Refund if more than 0.2N attached.
    if deposit > NearToken::from_millinear(200) {
      let refund_amt = deposit.checked_sub(NearToken::from_millinear(200)).unwrap_or_else(||
        env::panic_str("activate_receipt: Deposit refund_amt cannot subtract.")
      );
      refund(refund_amt.as_yoctonear());
    }

    // The first receipt is null. 
    let receipt = Receipt { 
        from: "null.near".to_owned().parse().unwrap(),
        to: "null.near".to_owned().parse().unwrap(),
        total: "0".to_owned(),
        charges: "0".to_owned(),
        final_total: "0".to_owned(),
        paid: "0".to_owned(),
        refund: None,
        datetime: get_current_datetime()
    };
    self.final_receipt.insert(caller, receipt);
  }

  fn receipt_activated(&self, account: AccountId) -> bool {
    return self.final_receipt.contains_key(&account);
  }

  fn latest_transaction(&self, account: AccountId) -> Option<&Receipt> {
    return self.final_receipt.get(&account);
  }
}