use crate::*;

pub(crate) type Decimal = String;


// ===================================================
#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, Clone, Debug, PartialEq)]
#[serde(crate = "near_sdk::serde")]
pub struct Receipt {
  pub from: AccountId,
  pub to: AccountId,
  pub total: Decimal,
  pub charges: Decimal,
  pub final_total: Decimal,  // total - charges. Exclude gas fee. 
  pub paid: Decimal,
  pub refund: Option<Decimal>
}

#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct Statistics {
  pub account_id: AccountId,
  // pub bins: Vec<String>,  
  // pub values: Vec<Decimal>,  // same length as month_and_year Vec. 
  pub bins_months: Vec<String>,  // last 12 months
  pub values_months: Vec<Decimal>,
  pub bins_years: Vec<String>,  // last 10 years
  pub values_years: Vec<Decimal>
}