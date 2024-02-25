import * as anchor from '@project-serum/anchor'
import {
  PublicKey,
  Connection,
  Keypair,
  Commitment,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  SystemProgram,
} from "@solana/web3.js";
import fs from 'fs';
import csv from 'csv-parser';
import * as bs58 from "bs58";
require("dotenv").config();

// Specify the path to your CSV file
const csvFilePath = './input/day6.csv';
// const csvFilePath = './result/output.csv';

// Create an array to store the CSV data
const csvAddress: string[] = [];
const csvAmount: number[] = [];

// Read the CSV file and store the data in the array
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    // Assuming there's only one column in the CSV
    const columnAddressValue = row['Addresses'];
    const columnAmountValue = row['Amount'];
    csvAddress.push(columnAddressValue);
    csvAmount.push(columnAmountValue);
  })
  .on('end', async () => {
    const admin = Keypair.fromSecretKey(bs58.decode(process.env.PRIV_KEY || ""));
    const commitment: Commitment = "confirmed";
    const connection = new Connection("https://api-mainnet-beta.renec.foundation:8899", { commitment });
    // const connection = new Connection("https://api-testnet.renec.foundation:8899", { commitment });
    // const connection = new Connection("http://localhost:8899", { commitment });

    // GET BALANCE BEFORE
    let balanceBefore = await connection.getBalance(admin.publicKey);
    console.log(`${balanceBefore / LAMPORTS_PER_SOL} SOL`);

    const groupSize = 21;

    for (let i = 0; i < csvAddress.length; i += groupSize) {
      const groupAddress = csvAddress.slice(i, i + groupSize);
      const groupAmount = csvAmount.slice(i, i + groupSize);

      console.log(`Start send RENEC from element ${i} to ${i + groupSize}`);
      const tx = new anchor.web3.Transaction();
      for (let j = 0; j < groupAddress.length; j++) {
        const transferInstruction = SystemProgram.transfer({
          fromPubkey: admin.publicKey,
          toPubkey: new PublicKey(groupAddress[j]),
          lamports: groupAmount[j] * LAMPORTS_PER_SOL,
        });
        tx.add(transferInstruction);
      }

      tx.recentBlockhash = (await connection.getLatestBlockhash("finalized")).blockhash;
      tx.feePayer = admin.publicKey;
      const txSignature = await sendAndConfirmTransaction(connection, tx, [admin]);

      console.log("🚀 ~ file: initialize.ts:25 ~ main ~ txSignature:", txSignature);
    };

    // GET BALANCE AFTER
    let balanceAfter = await connection.getBalance(admin.publicKey);
    console.log(`${balanceAfter / LAMPORTS_PER_SOL} SOL`);
  })
  .on('error', (error) => {
    console.error('Error reading CSV:', error);
  });
