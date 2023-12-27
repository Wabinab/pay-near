use crate::*;

pub(crate) type Decimal = String;


// ===================================================
#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Receipt {
  pub from: AccountId,
  pub to: AccountId,
  pub total: Decimal,
  pub charges: Decimal,
  pub effective_total: Decimal,  // total - charges. Exclude gas fee. 
}

#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Statistics {
  pub account_id: AccountId,
  pub month_and_year: Vec<String>,  // only last 12 months? 
  pub values: Vec<Decimal>,  // same length as month_and_year Vec. 
}