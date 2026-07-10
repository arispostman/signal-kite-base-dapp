# Signal Kite Deployment Notes

App Name: Signal Kite
Tagline: Raise a signal
Description: Raise a kite signal with wind, color, note, wallet, and time on Base.

## Required env

```bash
NEXT_PUBLIC_BASE_APP_ID=6a0d8e3c1c1db8c69c491c72
NEXT_PUBLIC_BUILDER_CODE=bc_6wbkt7l9
NEXT_PUBLIC_SIGNAL_KITE_CONTRACT_ADDRESS=0x479fdcd2100b15bf2324c7dd971938feca149733
BASE_RPC_URL=replace_with_rpc_url
```

## Order

1. Add the Vercel token, wallet address, and deployer private key to `Vercel.txt`.
2. When Base.dev gives `base:app_id`, send it here.
3. I will write Base App ID to `.env.local`, `Vercel.txt`, `DEPLOY.md`, and `src/app/layout.tsx`, then link/deploy with the token from `Vercel.txt`.
4. I will move the private key into `.env.local`, run `npm run deploy:contract`, and write the contract address back to `.env.local` and `Vercel.txt`.
5. When Base.dev gives Builder Code, send it here.
6. I will write Builder Code to `.env.local`, `Vercel.txt`, add required Vercel env vars, and redeploy production.

## Current deployment

Deployed URL: `https://signal-kite.vercel.app`

Contract Address: `0x479fdcd2100b15bf2324c7dd971938feca149733`

Contract Transaction: `https://basescan.org/tx/0x6a093c0371c85e1889aac36ce6f25d0538b2afb8c094eba64e8a13127d44ecbf`

Builder Code: `bc_6wbkt7l9`

## Files to sync after Base App ID or Builder Code changes

- `/Users/koala/signal-kite/.env.local`
- `/Users/koala/signal-kite/Vercel.txt`
- `/Users/koala/signal-kite/DEPLOY.md`
- `/Users/koala/signal-kite/src/app/layout.tsx`
- `/Users/koala/signal-kite/src/lib/wagmi.ts`
- `/Users/koala/signal-kite/src/lib/signal-kite.ts`
