## ... (Don't know what name for title)
Start with this: 
```bash
npm i --legacy-peer-deps
```

## Compilation to Mobile (Android)
The code to run is (on Powershell)

```PS
ionic build | ionic cap copy | ionic cap sync
```

(For unix/Linux, find equivalent for pipes and replace '|' with it). 

If your target is **above API Level 31**, aka **Android version 12**, there are some error with the library that you need to make changes. 

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