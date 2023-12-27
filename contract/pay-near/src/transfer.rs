use crate::*;

pub trait Transfer {
  // Transfer money: includes 0.1% (capped 0.1N) to this account. 
  fn transfer(&mut self, target: AccountId, amount: u64, date: String) -> Receipt;

  // Get statistics of receiving. 
  fn activate_statistics(&mut self);  // deposit to cover storage cost.
  fn get_statistics(&self, s_or_r: String) -> Statistics;
}