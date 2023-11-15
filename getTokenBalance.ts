import {
  PublicKey,
  Connection,
  Commitment,
  Keypair,
} from "@solana/web3.js";
import { getAccount, getOrCreateAssociatedTokenAccount } from "spl-token"; // version 0.2.0
import * as bs58 from "bs58";
require("dotenv").config();


async function main() {
  const admin = Keypair.fromSecretKey(bs58.decode(process.env.PRIV_KEY || ""));
  const commitment: Commitment = "confirmed";
  const connection = new Connection("http://localhost:8899", { commitment });

  const token = new PublicKey("4Yt4X2VFZTvAGCBsT7SeCUsK7r28bMnsS4RvGx9QMv7c");
  const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    admin,
    token,
    admin.publicKey
  );

  let balanceBefore = await getAccount(connection, sourceTokenAccount.address);
  console.log("🚀 ~ file: getTokenBalance.ts:24 ~ main ~ balanceBefore:", balanceBefore)
}

main();