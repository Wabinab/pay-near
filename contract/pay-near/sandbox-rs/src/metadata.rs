use serde::{Deserialize, Serialize};

pub(crate) type Decimal = String;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Receipt {
  pub from: String,
  pub to: String,
  pub total: Decimal,
  pub charges: Decimal,
  pub final_total: Decimal,  // total - charges. Exclude gas fee. 
  pub paid: Decimal,
  pub refund: Option<Decimal>
}