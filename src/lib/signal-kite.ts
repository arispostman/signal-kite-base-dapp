import { parseAbi } from "viem";

export const signalKiteAddress = process.env.NEXT_PUBLIC_SIGNAL_KITE_CONTRACT_ADDRESS as
  | `0x${string}`
  | undefined;

export const hasSignalKiteAddress =
  Boolean(signalKiteAddress) && !signalKiteAddress?.includes("replace_with");

export const signalKiteAbi = parseAbi([
  "event KiteRaised(uint256 indexed signalId,address indexed flyer,string title,string wind)",
  "function nextSignalId() view returns (uint256)",
  "function raiseKite(string title,string wind,string color,string note) returns (uint256)",
  "function getSignal(uint256 signalId) view returns (address flyer,string title,string wind,string color,string note,uint256 createdAt)",
]);
