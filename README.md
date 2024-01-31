
# Pay NEAR
This mobile app is designed to make payments in NEAR protocol by scanning a qrcode. What features it has except making it easy? 
- Any payments and earnings made with this app could be seen in statistics (basic) (requires to pay storage)
- It charges maximum 0.025N for every payment, or 0.1% if less than 25N. 
- Rather than just scan the code and type the value yourself (like most qrcode in wallet app), you'd have the receiver type the amount, the payer don't need to type the amount in. 
- And some other stuffs not of significance. 
- Supports MyNearWallet (web) and HERE wallet. Unfortunately, NEAR mobile wallet failed during testing, so one disabled it. HERE wallet requires an older version to work, as an update in january 2024 make signing smart contract to pop up with problems that one can't fix. Ultimately, only MyNearWallet works well. Other wallet like extension that aren't really mobile-based aren't supported. Though, if you found something new, do open an issue and one'll check whether to add it for support or not. 

---
# How To Install
(TBD)

---
# How To Use
(TBD)

---
# Learnings (Private)

### Install Webpack 5 items. 
- To solve for crypto-browserify etc, first you need to install the corresponding library, like this: `npm i crypto-browserify` (with/without legacy peer deps).
- Then, add it to tsconfig.json (click into it and you'll know how it's done). 
- Note: sometimes, there are dependencies, like perhaps https is dependent on url, so you'll need to resolve both; just check when you call `ionic serve` or `ng serve`. 
- Alternatively, if the item isn't needed, inside `package.json`, you can add (at the same level as "dependencies" and "devDependencies") this: 
```json
"browser": {
    "http": false,
    "https": false,
}
```

### `process` is not defined. 
These are some stuffs to do with `window.process` which isn't available in Angular 12 onwards. Therefore, you'd want to add it to the `polyfills.ts`. Here are some problems one met with process, Buffer, and global. 
```ts
 * APPLICATION IMPORTS
 */
import * as buffer from 'buffer';
(window as any).Buffer = buffer.Buffer;
(window as any).process = { env: { DEBUG: undefined }, };
(window as any).global ||= (window as any);
```

If your `process` need `NODE_ENV`, for example, just add it also like `NODE_ENV='development'`. 

### Wallet Selector not showing up
You'd probably forget to import the css. [As described](https://github.com/near/wallet-selector/tree/main/packages/modal-ui), you need to import the main css file into `styles.scss` or `global.scss` (for Ionic), then it'll display. 

### Dependency of installing package yanked
Example, this crate `parity-secp256k1` was yanked in deprecation, but `near-sdk-rs` has dependencies that dependent on it. Therefore, we can do the below to patch it up, directly from github. **It's strongly recommend cloning/forking the repo to your repo, so that the original owner cannot delete it and cause this trick to not work forever.**
```toml
[patch.crates-io]
parity-secp256k1 = {git = "https://github.com/paritytech/rust-secp256k1"}
```

### Deal with near wallet selector: 
Near wallet selector call and view methods are available at [Github hello-near-js](https://github.com/near-examples/hello-near-js/blob/master/frontend/near-wallet.js)

### Deal with migration
State migration can be found in this [near documentation](https://docs.near.org/tutorials/examples/update-contract-migrate-state). `#[private]` means the function can only be called by `env::current_account_id()` (which is the account that hold the contract). 

### Caveat with `LookupMap`
Well, since we can't loop, it also means it's not migrate-able; unless you save it as an unorderedmap instead, which is loopable by keys. 

### Compilation to Mobile (Android)
As usual, ionic have this unfixed bug for years, where API Level 31 and higher requires you to change the targeted code for compilation to be successful. 

Open up **NfcPlugin.java** and make changes to the function `createPendingIntent()` by deleting the original related code and replace with the code below:

```java
    private void createPendingIntent() {
        if (pendingIntent == null) {
            Activity activity = getActivity();
            Intent intent = new Intent(activity, activity.getClass());

            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
              intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
              pendingIntent = PendingIntent.getActivity(activity, 0, intent, PendingIntent.FLAG_IMMUTABLE);
            } else {
              intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
              pendingIntent = PendingIntent.getActivity(activity, 0, intent, 0);
            }

//            intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
//            pendingIntent = PendingIntent.getActivity(activity, 0, intent, 0);
        }
    }
```
