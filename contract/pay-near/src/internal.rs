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

pub(crate) fn handle_transfer(total: u128, target: AccountId, refund: u128) -> (Receipt, u128) {
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

  return (Receipt {
    from: env::predecessor_account_id(),
    to: target,
    total: to_human(total),  
    charges:  to_human(fee.as_yoctonear()),  
    final_total: to_human(remnant.as_yoctonear()), 
    paid: "".to_owned(),
    refund: _refund
  }, 
  remnant.as_yoctonear());
}

// This organize statistics into simplest format. 
// 
// Say, the date is saved on Sep 2024, this is the organization. 
// Anything before 2024-5 = 2019 would be in one bin. 
// 2020, 2021, 2022, 2023 has their own bin. 
// Jan to Sep has their own bin. That's it. 
// Going down too much is probably gonna take too much space per person,
// which means we need to increase deposit. 
// pub(crate) fn organize_stats(target: AccountId, stats: Statistics) {
//   let date_ms = env::block_timestamp_ms();
//   let datetime = NaiveDateTime::from_timestamp_millis(date_ms as i64)
//     .unwrap_or_else(|| env::panic_str("Cannot unwrap naive date time from timestamp millis")
//   );
//   let year = datetime.date().year();
//   let month = datetime.date().month();
  
// }

pub(crate) fn add_stats(target: AccountId, statistics: Option<&Statistics>, remnant: u128
  ) -> Statistics 
{
  let date_ms = env::block_timestamp_ms();
  let datetime = NaiveDateTime::from_timestamp_millis(date_ms as i64)
    .unwrap_or_else(|| env::panic_str("Cannot unwrap naive date time from timestamp millis")
  );
  let year: i32 = datetime.date().year();
  let month: u32 = datetime.date().month();

  return match statistics {
    Some(value) => {
      // Already have old statistics.
      let old_stats: Statistics = value.clone();
      let mut stats: Statistics = Statistics {
        account_id: old_stats.account_id.clone(),
        bins_months: Vec::new(), values_months: Vec::new(),
        bins_years: Vec::new(), values_years: Vec::new()
      };

      // If match bins-months
      if old_stats.bins_months.last().unwrap() == &month_bin(&month, &year) {
        stats.bins_months = old_stats.bins_months;
        
        let mut values = old_stats.values_months;
        let val_len = values.len() - 1;
        values[val_len] = checked_add(values.last().unwrap(), yoctonear_to_near(remnant.clone()))
          .unwrap_or_else(|_| env::panic_str("Cannot add values_months."));
        stats.values_months = values;

        // If bins-months match, years should match too. 
        stats.bins_years = old_stats.bins_years;

        let mut values = old_stats.values_years;
        let val_len = values.len() - 1;
        values[val_len] = checked_add(values.last().unwrap(), yoctonear_to_near(remnant.clone()))
          .unwrap_or_else(|_| env::panic_str("Cannot add values_years."));
        stats.values_years = values;

        return stats;
      }

      // If not match bins-months, regenerate bins last 12 months
      // make bins_months as key, values_months as value (dictionary)
      // for each regenerated value, check for values in old ones. 
      let bin_months = create_month_bins(&month, &year);
      stats.bins_months = bin_months.clone();

      let zipped_month = old_stats.bins_months.iter().zip(old_stats.values_months.iter());
      let mapped_month = zipped_month.collect::<HashMap<_, _>>();
      let mut new_values_month: Vec<Decimal> = Vec::new();
      for name in bin_months.clone() {
        let value: Decimal = match mapped_month.get(&name) {
          Some(val) => val.to_string(),
          None => "0".to_owned()
        };
        new_values_month.push(value);
      }
      let val_len = new_values_month.len() - 1;
      new_values_month[val_len] = checked_add(new_values_month.last().unwrap(), 
        yoctonear_to_near(remnant.clone())
      ).unwrap_or_else(|_| env::panic_str("cannot add new_values_month."));
      stats.values_months = new_values_month;

      let bin_years = create_year_bins(&year);
      stats.bins_years = bin_years.clone();

      let zipped_year = old_stats.bins_years.iter().zip(old_stats.values_years.iter());
      let mapped_year = zipped_year.collect::<HashMap<_, _>>();
      let mut new_values_year: Vec<Decimal> = Vec::new();
      for name in bin_years.clone() {
        let value: Decimal = match mapped_year.get(&name) {
          Some(val) => val.to_string(),
          None => "0".to_owned()
        };
        new_values_year.push(value);
      }
      let val_len = new_values_year.len() - 1;
      new_values_year[val_len] = checked_add(new_values_year.last().unwrap(), 
        yoctonear_to_near(remnant.clone())
      ).unwrap_or_else(|_| env::panic_str("cannot add new_values_year."));
      stats.values_years = new_values_year;

      return stats;
    },
    None => {
      // No statistics yet. 
      let stats: Statistics = Statistics {
        account_id: target.clone(),
        bins_months: vec![month_bin(&month, &year)],
        values_months: vec![yoctonear_to_near(remnant.clone())],
        bins_years: vec![year_bin(&year)],
        values_years: vec![yoctonear_to_near(remnant.clone())]
      };
      return stats;
    }
  };
}

// ================================================
// mutate datetime format
fn month_bin(month: &u32, year: &i32) -> String {
  return year.to_string() + " " + &month.to_string()
}

fn create_month_bins(month: &u32, year: &i32) -> Vec<String> {
  let mut bins: Vec<String> = Vec::new();
  let mut month: u32 = month.clone();
  let mut year: i32 = year.clone();

  for i in 0..12 {
    if month == 0 { 
      month = 12; 
      year -= 1; 
    }
    bins.push(month_bin(&month, &year));
    month -= 1;
  }

  return bins;
}

fn year_bin(year: &i32) -> String {
  return year.to_string();
}

fn create_year_bins(year: &i32) -> Vec<String> {
  return (0..10).map(|i| year_bin(&(year - i))).collect();
}