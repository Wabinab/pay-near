use crate::*;
use near_token::NearToken;

const MAX_FEE: NearToken = NearToken::from_millinear(100);  // 0.1 N
const MIN_FEE: NearToken = NearToken::from_yoctonear(10u128.pow(18));  // 0.00001 N.
const MIN_TRANSFER: NearToken = NearToken::from_millinear(1);  // 0.001 N

pub(crate) fn refund(amount: u128) {
  if amount > 1 {
    Promise::new(env::predecessor_account_id())
      .transfer(amount);
  }
}

pub(crate) fn handle_transfer(total: u128, target: AccountId, refund: u128) -> Receipt {
  let tot: NearToken = NearToken::from_yoctonear(total);
  if tot < MIN_TRANSFER { env::panic_str("Minimum transfer: 0.001N"); }
  let percent_denom: u128 = 1000;  // percentage denominator, because cannot be float.
  let mut fee: NearToken = tot.checked_div(percent_denom)
    .unwrap_or_else(|| env::panic_str("calculate_fee fee failed."));
  if fee > MAX_FEE { fee = MAX_FEE; }
  if fee < MIN_FEE { fee = MIN_FEE; }
  let remnant: NearToken = tot.checked_sub(fee)
    .unwrap_or_else(|| env::panic_str("calculate_fee remnant failed."));

  let p1 = Promise::new(env::current_account_id())
    .transfer(fee.as_yoctonear());
  let p2 = Promise::new(target.clone()).transfer(remnant.as_yoctonear());
  // p1.then(p2);

  if refund > 1 { 
    let p3 = Promise::new(env::predecessor_account_id()).transfer(refund);
    p1.then(p2).then(p3); 
  } else { p1.then(p2); }

  return Receipt {
    from: env::predecessor_account_id(),
    to: target,
    total: to_human(total),  
    charges:  to_human(fee.as_yoctonear()),  
    final_total: to_human(remnant.as_yoctonear()), 
    paid: "".to_owned(),
    refund: Some(refund.to_string()) // Some(to_human(refund))
  }
  // return Receipt { 
  //   from: "null.near".to_owned().parse().unwrap(),
  //   to: "null.near".to_owned().parse().unwrap(),
  //   total: "0".to_owned(),
  //   charges: "0".to_owned(),
  //   final_total: "0".to_owned(),
  //   paid: "0".to_owned(),
  //   refund: None
  // };
}