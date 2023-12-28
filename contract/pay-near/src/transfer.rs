use crate::*;

pub trait Transfer {
  // Transfer money: includes 0.1% (capped 0.1N) to this account. 
  fn transfer(&mut self, target: AccountId, amount: u128, date: String) -> Receipt;

  // Get statistics of receiving. 
  fn activate_statistics(&mut self);  // deposit to cover storage cost.
  fn stats_activated(&self);  // check if this guys activated statistics.
  fn get_statistics(&self, s_or_r: String) -> Statistics;

  // Check latest: whether transaction finished. 
  fn latest_transaction(&self) -> Receipt;
}

#[near_bindgen]
impl Transfer for Contract {
  #[payable]
  fn transfer(&mut self, target: AccountId, amount: u128, date: String) -> Receipt {
    let contract_caller = env::predecessor_account_id();
    if contract_caller == target { env::panic_str("You cannot pay to yourself."); }
    if env::attached_deposit() < amount { env::panic_str("Insufficient money attached."); }
    let refund = env::attached_deposit() - amount;  // If attached_deposit more, we'll refund the extra later. 
    
    // Transfer included refund. 
    let mut receipt: Receipt = handle_transfer(amount, target, refund);
    receipt.paid = to_human(env::attached_deposit());

    // Date is for statistics. 

    return receipt;
  }


  fn activate_statistics(&mut self) {

  }

  fn stats_activated(&self) {

  }

  fn get_statistics(&self, s_or_r: String) -> Statistics {
    return Statistics {
      account_id: "null.near".to_owned().parse().unwrap(),
      month_and_year: Vec::new(),
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