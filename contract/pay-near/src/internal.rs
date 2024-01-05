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

  // let p1 = Promise::new(env::current_account_id())
  //   .transfer(fee.as_yoctonear());
  let p1 = Promise::new(target.clone()).transfer(remnant.as_yoctonear());
  // p1.then(p2);

  let mut _refund = None;
  if refund > 1 { 
    let p2 = Promise::new(env::predecessor_account_id()).transfer(refund);
    _refund = Some(to_human(refund));
    p1.then(p2);
  } else { p1; }

  return Receipt {
    from: env::predecessor_account_id(),
    to: target,
    total: to_human(total),  
    charges:  to_human(fee.as_yoctonear()),  
    final_total: to_human(remnant.as_yoctonear()), 
    paid: "".to_owned(),
    refund: _refund
  }
}

// This organize statistics into simplest format. 
// 
// Say, the date is saved on Sep 2024, this is the organization. 
// Anything before 2024-5 = 2019 would be in one bin. 
// 2020, 2021, 2022, 2023 has their own bin. 
// Jan to Sep has their own bin. That's it. 
// Going down too much is probably gonna take too much space per person,
// which means we need to increase deposit. 
pub(crate) fn organize_stats(target: AccountId, stats: Statistics) {
  let date_ms = env::block_timestamp_ms();
  let datetime = NaiveDateTime::from_timestamp_millis(date_ms)
    .unwrap_or_else(|| env::panic_str("Cannot unwrap naive date time from timestamp millis")
  );
  let year = datetime.date().year();
  let month = datetime.date().month();

  // Make bins
  let mut bins: Vec<String> = vec!["older".to_owned()];
  for i in year.checked_sub(4).unwrap()..year {
      bins.push(i.to_string());
  }
  bins.extend(["Jan", "Feb", "Mar", "Apr", "May",
    "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ].map(|c| c.to_owned()));

  // Get "older" bin.
  let five_years_ago = year.checked_sub(5).unwrap();
  let mut years: Vec<i32> = stats.bins[1..=4].iter()
    .map(|c| c.parse::<i32>().unwrap())
    .collect();
  let four_years_bin: i32 = stats.bins[1].parse().unwrap();
  years.insert(0, four_years_bin.checked_sub(1).unwrap());
  let final_year_bin: i32 = stats.bins[4].parse().unwrap();
  years.push(final_year_bin.checked_add(1).unwrap());
  match years.iter().position(|&r| r == five_years_ago) {
    Some(value) => {

    },
    None => {
      if five_years_ago < years[0] { env::panic_str("five_years_ago is older than the oldest bin. Time move backwards?"); }
      if !(five_years_ago > years[5]) {
        env::panic_str(format!("{} > {} is invalid. Check for bug.",
          five_years_ago, years[5]).as_str()
        );
      }

      let bin0: f64 = stats.values.iter()
        .map(|c| c.parse::<f64>().unwrap())
        .collect();
      let mut values = vec![bin0.to_string()];
    }
  }
}

pub(crate) fn add_stats(target: AccountId) {
  let date_ms = env::block_timestamp_ms();
}

// ================================================
// Taken from chrono
