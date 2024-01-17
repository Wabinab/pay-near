# Pay Near Contract
It's the contract for the payment of near. There are a lot of stuffs not implemented, but here is the minimum lovable product. Also simple. 

Here documented all public methods to use the program. 

## Metadata
Let's first define the two metadatas that some methods return. 

#### Decimal
```rust
pub(crate) type Decimal = String;
```
(Nothing to explain)

#### Receipt
When you call `transfer`, it'll generate a receipt, just like the receipt your receive when you bought something. Unfortunately, this receipt isn't saved anywhere, so you can't refer back to it. The idea is to use the blockchain's transaction history as permanent receipt, and this is just for display purpose. 
```rust
pub struct Receipt {
  pub from: AccountId,
  pub to: AccountId,
  pub total: Decimal,
  pub charges: Decimal,
  pub final_total: Decimal,  
  pub paid: Decimal,
  pub refund: Option<Decimal>
}
```
`total` is the `amount` in `transfer` call, then the contract charges 0.1% of this `total` (capped at 0.1 NEAR), and the `final_total` are what's transferred to the recipient (`to` field). `paid` is how much you attach to the function; if you attach less than `total`, it'll fail and complain; if you attach more than `total`, it'll `refund` you the extra attached. 

#### Statistics
If you activate statistics, you can see what you have earn and spent (hence two `Statistics` are kept). With a lot of considerations, one decide to keep it as simple as possible, only tracking the past 12 months and past 10 years; anything before will be wiped out. 
```rust
pub struct Statistics {
  pub account_id: AccountId,
  pub bins_months: Vec<String>,  // last 12 months
  pub values_months: Vec<Decimal>,
  pub bins_years: Vec<String>,  // last 10 years
  pub values_years: Vec<Decimal>
}
```
The `bins_months` are saved as `year month`, e.g. `2021 1` means January 2021. The `values_months` are same length as `bins_months`, and they mapped exactly by index. Similarly, for `values_years` and `bins_years`; and `bins_years` are saved as `year`, e.g. `2023`. 

## Methods
We haven't define the contract name yet, so let's call it `pay.near` for now (which we won't use since it's already being used). We'll show both the rust signature and NEAR CLI signature if you decide to call it yourself. 

#### transfer
Transfer money from whoever call this function to the target. If you attached more money than the `amount` stated, the rest will be refunded, and it'll be displayed `Receipt`'s `refund`. 
```rust
fn transfer(&mut self, target: AccountId, amount: U128) -> Receipt;
```
```bash
near call pay.near transfer '{"target": "target.near", "amount": "1000000000000000000000000"}' --accountId yourname.near --amount 1
```

#### activate_statistics
To use statistics, you have to deposit some storage cost. It accepts 0.75N minimum, but if you're generous, you can donate up to 1N; anything more will be refunded. 
```rust
fn activate_statistics(&mut self);
```
```bash
near call pay.near activate_statistics '{}' --accountId yourname.near --amount 0.75
```

#### stats_activated
Check if a specific accountId have activate statistics or not. 
```rust
fn stats_activated(&self, account: AccountId) -> bool;
```
```bash
near view pay.near stats_activated '{"account": "target.near"}'
```

#### get_earnings
Get how much money specific `account` received via `transfer` call. All earnings recorded **exclude charges** (i.e. `final_total` in `Receipt`). If stats not activated, will return `null`. 
```rust
fn get_earnings(&self, account: AccountId) -> Option<&Statistics>;
```
```bash
near view pay.near get_earnings '{"account": "target.near"}'
```

#### get_spendings
Get how much money specific `account` spend via `transfer` call. All spendings recorded **include charges** (i.e. `total` in `Receipt`). If stats not activated, will return `null`.
```rust
fn get_spendings(&self, account: AccountId) -> Option<&Statistics>;
```
```bash
near view pay.near get_spendings '{"account": "target.near"}'
```

### Receipt
As a receiver, if someone `transfer` to you, you won't know if they have successfully transfer to you, as whatever returned from `transfer` function is only viewable in the person who's making the transfer. To view such receipt from the receiving person, you need to `activate_receipt`. This will save **only the latest transaction `Receipt`** in store. In your frontend, you can check when the receipt changes, or receipt `total` matches what you expected to receive (though you only receive `final_total`, that's another story), or any other clever way you can think of. Note, this is only for single transaction; if you are receiving from multiple people, it'll also change, but you see how you want to trigger frontend as we only save the last transaction's `Receipt`.

#### activate_receipt
To use receipt, you have to deposit some storage cost. It accepts 0.1N minimum, but if you're generous, you can donate up to 0.2N; anything more will be refunded. 
```rust
fn activate_receipt(&mut self);
```
```bash
near call pay.near activate_receipt '{}' --accountId yourname.near --deposit 0.1
```

#### receipt_activated
Whether the person had `activate_receipt` or not. 
```rust
fn receipt_activated(&self, account: AccountId) -> bool;
```
```bash
near view pay.near receipt_activated '{"account": "target.near"}'
```

#### latest_transaction
(Explanation already mentioned above), get the latest transaction for the **recipient account**. (If you're the one paying, you see the return value from corresponding transaction hashes, or transaction history in your wallet). If receipt not activated, return `null` instead. 
```rust
fn latest_transaction(&self, account: AccountId) -> Option<&Receipt>;
```
```bash
near view pay.near latest_transaction '{"account": "target.near"}'
```

### Timestamping
Sometimes, we want to verify the current timestamp on the contract. The return value have `year`, `month`, `day` (date in javascript), `hour`, `min`, `sec` in the `HashMap` (sometimes called dictionary). 
```rust
pub fn get_timestamp(&self) -> HashMap<&str, String>
```
```bash
near view pay.near get_timestamp '{}'
```