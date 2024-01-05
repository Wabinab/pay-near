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
  pub final_total: Decimal,  // total - charges. Exclude gas fee. 
  pub paid: Decimal,
  pub refund: Option<Decimal>
}

#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Statistics {
  pub account_id: AccountId,
  pub bins: Vec<String>,  
  pub values: Vec<Decimal>,  // same length as month_and_year Vec. 
}