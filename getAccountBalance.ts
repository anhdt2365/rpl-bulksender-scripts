import {
  PublicKey,
  Connection,
  Commitment,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import * as bs58 from "bs58";
require("dotenv").config();

async function main() {
  const admin = Keypair.fromSecretKey(bs58.decode(process.env.PRIV_KEY || ""));
  const commitment: Commitment = "confirmed";
  const connection = new Connection("http://localhost:8899", { commitment });
  let balanceBefore = await connection.getBalance(admin.publicKey);
  console.log(`${balanceBefore / LAMPORTS_PER_SOL} SOL`);
}

main();