"use client";

import { Check, CloudSun, Flag, Loader2, Search, Send, Sparkles, Wallet, Wind } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { parseEventLogs, type Address } from "viem";
import { useAccount, useConnect, useDisconnect, useReadContract, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { base } from "wagmi/chains";
import { hasSignalKiteAddress, signalKiteAbi, signalKiteAddress } from "@/lib/signal-kite";

const WINDS = ["North", "East", "South", "West", "Calm"] as const;
const COLORS = ["Coral", "Sky", "Lime", "Sun", "Ink"] as const;
const MAX_TITLE_LENGTH = 48;
const MAX_NOTE_LENGTH = 140;
const PRESETS = [
  { title: "Launch Signal", wind: "East", color: "Coral", note: "A bright signal for the next small launch on Base." },
  { title: "Clear Sky", wind: "North", color: "Sky", note: "Keep the line simple, visible, and easy to follow." },
  { title: "Soft Landing", wind: "Calm", color: "Sun", note: "A quiet marker for work that has safely landed." },
] as const;

function shortAddress(address?: Address) {
  if (!address || address === "0x0000000000000000000000000000000000000000") return "--";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(value?: bigint) {
  if (!value) return "--";
  return new Date(Number(value) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function friendlyError(error: unknown) {
  if (!(error instanceof Error)) return "Transaction was cancelled.";
  if (error.message.includes("User rejected")) return "Request cancelled in wallet.";
  if (error.message.includes("Invalid title")) return "Title needs 1 to 48 characters.";
  if (error.message.includes("Invalid wind")) return "Choose a wind.";
  if (error.message.includes("Invalid color")) return "Choose a color.";
  if (error.message.includes("Invalid note")) return "Note needs 1 to 140 characters.";
  return error.message;
}

function KitePreview({ title, wind, color, note, flyer, createdAt }: { title: string; wind: string; color: string; note: string; flyer?: Address; createdAt?: bigint }) {
  return (
    <article className={`kite-card color-${color.toLowerCase()}`}>
      <div className="sky-lines" aria-hidden="true"><span /><span /><span /></div>
      <div className="kite-scene">
        <div className="kite">
          <span className="kite-top" />
          <span className="kite-right" />
          <span className="kite-bottom" />
          <span className="kite-left" />
        </div>
        <div className="tail"><span /><span /><span /></div>
      </div>
      <div className="kite-note">
        <span>{wind || "Wind"} / {color || "Color"}</span>
        <h2>{title || "Untitled signal"}</h2>
        <p>{note || "Raise one kite signal on Base."}</p>
      </div>
      <footer>
        <div><span>Flyer</span><strong>{shortAddress(flyer)}</strong></div>
        <div><span>Raised</span><strong>{formatDate(createdAt)}</strong></div>
      </footer>
    </article>
  );
}

export function SignalKiteApp() {
  const [signalIdInput, setSignalIdInput] = useState("1");
  const [title, setTitle] = useState<string>(PRESETS[0].title);
  const [wind, setWind] = useState<string>(PRESETS[0].wind);
  const [color, setColor] = useState<string>(PRESETS[0].color);
  const [note, setNote] = useState<string>(PRESETS[0].note);
  const [message, setMessage] = useState("Raise a kite signal on Base.");
  const [lastAction, setLastAction] = useState<"raise" | null>(null);
  const { address, chainId, connector, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnectAsync } = useDisconnect();
  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
    } catch {}
  }
  const { switchChain, isPending: switching } = useSwitchChain();
  const { data: hash, writeContractAsync, isPending: writing } = useWriteContract();
  const { data: receipt, isLoading: confirming } = useWaitForTransactionReceipt({ hash });
  const selectedConnector = connectors.find((c) => c.id === "injected") ?? connectors.find((c) => c.id === "baseAccount") ?? connectors[0];
  const parsedSignalId = BigInt(Math.max(1, Number(signalIdInput || "1")));
  const signalQuery = useReadContract({ abi: signalKiteAbi, address: signalKiteAddress, functionName: "getSignal", args: [parsedSignalId], query: { enabled: hasSignalKiteAddress, refetchInterval: 12000 } });
  const totalQuery = useReadContract({ abi: signalKiteAbi, address: signalKiteAddress, functionName: "nextSignalId", query: { enabled: hasSignalKiteAddress, refetchInterval: 12000 } });
  const tuple = signalQuery.data as readonly [Address, string, string, string, string, bigint] | undefined;
  const liveSignal = useMemo(() => tuple ? { flyer: tuple[0], title: tuple[1], wind: tuple[2], color: tuple[3], note: tuple[4], createdAt: tuple[5] } : undefined, [tuple]);
  const totalSignals = totalQuery.data ? Math.max(Number(totalQuery.data) - 1, 0) : 0;
  const validFields = title.trim().length > 0 && title.trim().length <= MAX_TITLE_LENGTH && wind.trim() && color.trim() && note.trim().length > 0 && note.trim().length <= MAX_NOTE_LENGTH;
  const blocker = !hasSignalKiteAddress ? "Contract not deployed yet. Run npm run deploy:contract, then add NEXT_PUBLIC_SIGNAL_KITE_CONTRACT_ADDRESS." : !isConnected ? "Connect wallet first." : chainId !== base.id ? "Switch to Base first." : !validFields ? "Fill title, wind, color, and note." : "";

  useEffect(() => {
    if (!receipt || lastAction !== "raise") return;
    void totalQuery.refetch(); void signalQuery.refetch();
    const logs = parseEventLogs({ abi: signalKiteAbi, logs: receipt.logs, eventName: "KiteRaised" });
    const signalId = logs[0]?.args.signalId;
    window.setTimeout(() => { if (signalId) setSignalIdInput(signalId.toString()); setMessage(signalId ? `Signal #${signalId.toString()} raised on Base.` : "Signal raised on Base."); }, 0);
  }, [signalQuery, lastAction, receipt, totalQuery]);

  async function connectWallet() {
    const queue = [connectors.find((c) => c.id === "injected"), connectors.find((c) => c.id === "baseAccount"), selectedConnector].filter((c): c is NonNullable<typeof selectedConnector> => Boolean(c)).filter((c, i, a) => a.findIndex((x) => x.id === c.id) === i);
    if (!queue.length) return setMessage("No wallet connector found. Open this app inside Base App or a wallet browser.");
    let lastError: unknown; setMessage("Opening wallet connection...");
    for (const connector of queue) { try { await connectAsync({ connector }); setMessage("Wallet connected. Raise the kite when ready."); return; } catch (error) { lastError = error; } }
    setMessage(friendlyError(lastError));
  }

  async function raiseKite() {
    if (blocker) return setMessage(blocker);
    if (!signalKiteAddress) return;
    try {
      setLastAction("raise"); setMessage("Confirm the kite signal in your wallet.");
      await writeContractAsync({ address: signalKiteAddress, abi: signalKiteAbi, functionName: "raiseKite", args: [title.trim(), wind.trim(), color.trim(), note.trim()], chainId: base.id });
      setMessage("Kite signal sent to Base. Waiting for confirmation...");
    } catch (error) { setMessage(friendlyError(error)); }
  }

  function applyPreset(index: number) { const p = PRESETS[index]; setTitle(p.title); setWind(p.wind); setColor(p.color); setNote(p.note); }

  return <main className="kite-shell">
    <section className="kite-hero"><div><span>Signal Kite</span><h1>Raise a signal on Base.</h1><p>Pick wind, color, and a short note. The kite keeps your wallet and time.</p></div><aside><Flag /><strong>{totalSignals}</strong><span>signals</span></aside></section>
    <section className="kite-grid"><div className="kite-controls"><div className="kite-head"><CloudSun /><div><span>Flight deck</span><strong>{isConnected ? shortAddress(address) : "Connect to raise"}</strong></div></div>
      <div className="preset-strip">{PRESETS.map((p, i) => <button key={p.title} type="button" onClick={() => applyPreset(i)}>{p.title}</button>)}</div>
      <label><span>Title</span><input value={title} maxLength={MAX_TITLE_LENGTH} onChange={(event) => setTitle(event.target.value)} /></label>
      <label><span>Note</span><textarea value={note} maxLength={MAX_NOTE_LENGTH} onChange={(event) => setNote(event.target.value)} /></label>
      <div className="choice-row wind-row">{WINDS.map((item) => <button key={item} className={wind === item ? "active" : ""} type="button" onClick={() => setWind(item)}>{wind === item ? <Check /> : <Wind />}{item}</button>)}</div>
      <div className="choice-row color-row">{COLORS.map((item) => <button key={item} className={color === item ? "active" : ""} type="button" onClick={() => setColor(item)}><span />{item}</button>)}</div>
      <div className="kite-actions">{!isConnected ? <button className="connect" disabled={connecting} onClick={connectWallet}>{connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}Connect wallet</button> : chainId !== base.id ? <button className="connect" disabled={switching} onClick={() => switchChain({ chainId: base.id })}>Switch to Base</button> : <button className="disconnect" onClick={disconnectWallet}>{shortAddress(address)}</button>}<button className="raise" disabled={writing || confirming} onClick={raiseKite}>{writing || confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Raise kite</button></div>
      <p className="message">{message}</p></div>
      <div className="kite-output"><KitePreview title={liveSignal?.title || title} wind={liveSignal?.wind || wind} color={liveSignal?.color || color} note={liveSignal?.note || note} flyer={liveSignal?.flyer} createdAt={liveSignal?.createdAt} /><section className="lookup"><div><Search /><h2>Read signal</h2></div><label><span>Signal ID</span><input value={signalIdInput} onChange={(event) => setSignalIdInput(event.target.value.replace(/\D/g, ""))} /></label></section><section className="about"><Sparkles /><strong>Signal Kite stores one bright wind signal on Base with color, note, wallet, and timestamp.</strong></section></div>
    </section>
  </main>;
}
