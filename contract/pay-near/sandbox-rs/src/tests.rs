use std::{env, fs};
use near_units::parse_near;
use serde_json::json;
use workspaces::{Account, Contract};

use crate::metadata::*;
mod metadata;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let wasm_arg: &str = &(env::args().nth(1).unwrap());
    let wasm_filepath = fs::canonicalize(env::current_dir()?.join(wasm_arg))?;

    let worker = workspaces::sandbox().await?;
    let wasm = std::fs::read(wasm_filepath)?;
    let contract = worker.dev_deploy(&wasm).await?;

    // create accounts
    let account = worker.dev_create_account().await?;
    let alice = account
        .create_subaccount("alice")
        .initial_balance(parse_near!("30 N"))
        .transact()
        .await?
        .into_result()?;
    let bob = account
        .create_subaccount("bob")
        .initial_balance(parse_near!("30 N"))
        .transact()
        .await?
        .into_result()?;
    // println!("{:#?}", contract);
    // println!("{:#?}\n{:#?}\n=====================", alice.clone(), bob.clone());

    // println!("{:?}", &contract.id());
    // let result = alice.call(contract.id(), "new")
    //   .args_json(json!({}))
    //   .transact().await?;
    let result = contract.call("new").transact().await?;
    println!("{:#?}", result);
    assert!(result.is_success(), "FAIL: Alice failed to call new.");

    // begin tests
    // test_default_message(&alice, &contract).await?;
    // test_changes_message(&alice, &contract).await?;
    test_transfer(&alice, &bob, &contract).await?;
    Ok(())
}

async fn test_transfer(
  user: &Account,
  target: &Account,
  contract: &Contract
) -> anyhow::Result<()> {
  let user_bal_before = user.view_account().await?.balance;
  let trgt_bal_before = target.view_account().await?.balance;
  // println!("Before: {:?}, {:?}", user_bal_before, trgt_bal_before);

  let result = user
    .call(contract.id(), "transfer")
    .deposit(parse_near!("10 N"))
    .args_json(json!({
      "target": &target.id(),
      "amount": parse_near!("10 N").to_string(),
      "date": "2023-12-30T03:04:49.048Z"
    }))
    .transact().await?;
  println!("{:#?}", result);
  assert!(result.is_success());

  let user_bal_after = user.view_account().await?.balance;
  let trgt_bal_after = target.view_account().await?.balance;
  println!("After: {:?}, {:?}", user_bal_after, trgt_bal_after);
  assert!(1 == 2);
  Ok(())
}

// async fn test_default_message(
//     user: &Account,
//     contract: &Contract,
// ) -> anyhow::Result<()> {
//     let greeting: String = user
//         .call( contract.id(), "get_greeting")
//         .args_json(json!({}))
//         .transact()
//         .await?
//         .json()?;

//     assert_eq!(greeting, "Hello".to_string());
//     println!("      Passed ✅ gets default greeting");
//     Ok(())
// }

// async fn test_changes_message(
//     user: &Account,
//     contract: &Contract,
// ) -> anyhow::Result<()> {
//     user.call(contract.id(), "set_greeting")
//         .args_json(json!({"greeting": "Howdy"}))
//         .transact()
//         .await?
//         .into_result()?;

//     let greeting: String = user
//         .call(contract.id(), "get_greeting")
//         .args_json(json!({}))
//         .transact()
//         .await?
//         .json()?;

//     assert_eq!(greeting, "Howdy".to_string());
//     println!("      Passed ✅ changes greeting");
//     Ok(())
// }