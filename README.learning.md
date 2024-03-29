# What did one learn (and their solutions, if applicable)

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

### HERE Wallet not displaying
That's because you didn't install `@here-wallet/core` package from npm. That's why the modal didn't appear. 

### Icons PWA
Unfortunately, capacitor/assets have some problem making the pwa icons, therefore, you'd have to use some online tools to deal with it, then copy and paste the respective size, then rename the icon names to match the original names. That's it. 

### Android App (no solution)
Unfortunately, one didn't manage to fix the deep links for the project. Hence, if you login with wallet that doesn't automatically redirect back, it doesn't work. The issue is it doesn't display the "open with" modal to ask whether you want to open it in app, or open it in another browser. One checked the SHA256 key, application id (com.wabinab.paynear), alas, none works. 

That's why we stop the android app development. Instead, we implement it as a pwa that allows you to "install as app" if you're on a computer, and similarly on a mobile (some browsers like Edge will prompt, other modern browser apps have the "Add to Home" button from the hamburger menu). 

### Compiling
From project base: 

(For production)
- Remember to change to `mainnet` in `login-wallet.service.ts`
- Change name at `mainfest.webmanifest`
- Then run the code below: 

```bash
ionic build --prod -- --base-href /pay-near/ &&
ng deploy --no-build --dir=www --base-href=/pay-near/
```

(For testnet/development/testing)
- Remember to change to `testnet` in `login-wallet.service.ts`
- Change name at `manifest.webmanifest`
- Then run the code below: 

```bash
ionic build --prod -- --base-href /pay-near-testnet/ &&
GH_TOKEN=your_personal_access_key ng deploy --repo=https://github.com/Wabinab/pay-near-testnet.git --no-build --dir=www --base-href=/pay-near-testnet/ 
```

That's when you use github codespace, where they set a deploy key instead of personal access key, so it doesn't work pushing to another repo. Hence, you could temporarily override it with `GH_TOKEN=your_personal_access_key`. 