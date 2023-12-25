

---
# Learnings

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