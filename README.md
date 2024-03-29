
# Pay NEAR
This mobile app is designed to make payments in NEAR protocol by scanning a qrcode. What features it has except making it easy? 
- Any payments and earnings made with this app could be seen in statistics (basic) (requires to pay storage)
- It charges maximum 0.025N for every payment, or 0.1% if less than 25N. 
- Rather than just scan the code and type the value yourself (like most qrcode in wallet app), you'd have the receiver type the amount, the payer don't need to type the amount in. 
- And some other stuffs not of significance. 

---
# How To Install
No installation required. Just visit 
- [https://wabinab.github.io/pay-near for mainnet](https://wabinab.github.io/pay-near)
- [https://wabinab.github.io/pay-near-testnet for testnet](https://wabinab.github.io/pay-near-testnet)
 from your browser. It may prompt you to install the app, and you could choose to do so. However, note that this prompt doesn't always comes out, especially in situations where: 
- You have an older phone, hence an older browser app. 
- You have an older browser app. 
- You use untested app (like duckduckgo, tor, etc.) to browse that one isn't familiar of its workings. 

In these case, you either have to tolerate for using it only on browser, or find out how to get a newer app version. Most modern browser have "Add to Phone", "Add to Home (screen)" which makes it either app-like, or as a shortcut. 

Note: if you use phones that turn off permission by default, especially phones from China, you'd need to open the permissions before you can install app. And that doesn't guarantee the installation will be successful, like in one's case. So one just keep the tab open in a web browser. 

Why not local APK? Somehow, deep-link doesn't work. If you have time, could check it here: [https://github.com/Wabinab/pay-near/releases/tag/0.4.1](https://github.com/Wabinab/pay-near/releases/tag/0.4.1), the well-known file [here](https://wabinab.github.io/.well-known/assetlinks.json). It does works with the `adb shell am start` thingy tried on debug version (with a different SHA256 one suppose) with android studio; yet not on release version. I wonder why, oh, I wonder why...!!!

---
# How To Use
**Before you start, check that you're browsing the correct url: `https://wabinab.github.io/pay-near`.** If you can't read, use some online text compare tools like [text compare](https://text-compare.com/) to ensure they're the same. 

Next, login. The supported wallets are: 
- My Near Wallet (tested usable)
- Here Wallet (this has an error, see [here](https://github.com/here-wallet/js-sdk/issues/1))
- Near Mobile Wallet (Not working on older browsers. Please update your browser)
- Ledger (on desktop only, untested because one don't use a ledger, and don't have one either. Use at your own risk.)

**NOTE if you use APP WALLET** (Here and Near Mobile Wallet): **Please refresh the page manually!!!**, otherwise, you'd be confused why it is login but still asking you to login. 

(Other wallets aren't supported so one don't have to test them. E.g. mintbase wallet requires Windows Hello, if on Windows, and can't be used on phone, so one abandon it. Others are extension wallet, and requires more work to deal with on phone, so one thought no need, unless you could convince me otherwise. WalletConnect seems to be a free starting with limited quota until it needs payment later on if need more, so one set that and try it out, but removed it afterwards.)

Note, these tutorials are demonstrated with testnet; but it'll be the same on mainnet. 

### Earn / Receive Money
![Earn page](./readme_assets/image.png)

After login, you can set your payment amount in the middle. Here, we set to 12.5 N. The units is NEAR, yes. Then, you can click on the **lock** to display the QR code. 

![QR code page](./readme_assets/image1.png)

The **unlock** button will get you back to the previous page. Note: **clicking the unlock button will vibrate the phone**. This ensures the payee doesn't do magic and secretly change the amount when you show him the QR code. 

---
##### QR Code Too Small
**You can tap on the QR code, and it'll zoom in.** Unfortunately, because it's a web app, one can't help you change phone screen brightness to max. If your screen is too dark, **ensure you up the brightness manually**. 

![Alt text](./readme_assets/image6.png)

Tapping anywhere on the screen will dismiss the zoomed-in QR code. 

---

See the "(right button) To display receipt when someone paid." text, and the button that looks like the receipt right of the lock/unlock? Usually, only the person who's performing the transaction (i.e. the payee) will receive some return value after he made the transaction, and you won't know about it. This is the button to make you know about it. 

**Activate receipt fee: 0.1 N**

(Note: if you're logged out for whatever reasons, just login again.)

You should see now the new page, with this button below: 

![Activated Receipt](./readme_assets/image2.png)

At the bottom, you can see "Only one payment". If you deactivate the button, it'll say "Accept multiple payments". What that means is, when you accept only a single payment, and the payee pay, it'll check for changes and redirect you to the receipt page upon completion. If you instead have multiple payees, then this redirection isn't supported. You'll have to manually unlock it afterwards and manually check with each payee whether they have made the transactions in your receiving wallet's transaction history. 

(Note: if you detect for payment, it'll have a timeout of 5 minutes. If nothing is paid within 5 minutes, it'll timeout. Example like image below:)

![Timeout page](./readme_assets/image4.png)

Here's an image showing what it looks like for a single payment, upon transaction succeeded. 

![Receipt page](./readme_assets/image3.png)

You can press "Dismiss" after you've read its content. Basically, you have an address on the left, sending to the address on the right. Next row: you have the amount send (1 N), and the amount received (0.999 N == 999 mN), with its charges (0.001 N == 1 mN). You paid 1N, refund 0N. (Note: this refund will never display value larger than 0 on this app, only if you deal with lower level stuffs like directly interacting with its smart contract will it have a difference. If it does display value larger than 0, please tell me how did you get there, it might be a bug!)

Minimum value per transaction is 0.001 N, maximum value is 50,000,000 N. 

As for the **warning! check payment destination** you should only have two: `pay_testnet.testnet`, and `pay_near.near`. Beware of phishings! Usually, you can check for more information just before you approve the transaction, look around for extra links that dropdown into extra information, or wallet app tends to show it in its information as well, where you can verify. 

### Pay / Send Money
To scan the QR code, just click on the camera and give permission for camera access. It'll detect for main camera, which on your phone, it's most likely the back camera. Bring in your QR code from Earn, and meddle around until it scans. 

The gray button below is to **deactivate camera**, if you don't want to scan anymore. 

Upon scanning success, it'll redirect you the transaction page. Check that it's calling `transfer` from more information, and it's getting to the correct address `pay-near.near` or `pay-testnet.testnet`, and check the amount is correct, then proceed. Upon finish, you'll be redirected back, and display a receipt. 

![After payment](./readme_assets/image5.png)

(Note: the image above would be fixed again, to move the thingy down a bit so the "Receipt" isn't hidden, and to shorten the name.)

**If you encounter "Failed to Fetch" from My Near Wallet when approving transaction**, the website is probably updating itself... Come back in a few minutes... Unfortunately, when Github Actions is building the page, it doesn't show anything on the page saying the page is updating. 

Tap dismiss to dismiss the receipt. 

### Stats
Stats requires **0.75 N** to activate. 

![Stats Not Activated](./readme_assets/image7.png)

![After activated](./readme_assets/image8.png)

**Any transaction made before activate stats would not be recorded.**

It has four graphs, two for spendings, and two for earnings, as the tab above indicates. Each two graph represents spending by months and spending by years. It'll record what data from the last 12 months, and last 10 years. Anything older than that would be gone forever. 

By last 12 months one literally means "last 12 months". E.g. now is Feb 2024, so it'll record anything from Feb 2023 to Feb 2024. Anything before is erased, meaning Jan 2023 won't be in database anymore. Here, we can only see 02/2024 because anything before doesn't have data. If we have data starting, say, at 12/2023, then it'll display 12/2023, 01/2024, and 02/2024 only. 

![Example with graph](./readme_assets/image9.png)

##### Hard Refresh
Note the header now have a refresh button at top right. It's a hard refresh (different from pulling down refresh). It'll reload the whole website. 

The pull-down refresh for graph is only available in mobile web format. If you use it on desktop web, it won't work in most cases. 

### Logout/Sign Out
Logout just double press that button, and it should work for all except Near Mobile Wallet (because you need to go to Near Mobile Wallet app to give it permission to sign out, so double sign out). 

Voilà! End of Tutorial. 