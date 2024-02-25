import * as anchor from '@project-serum/anchor'
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction } from "spl-token"; // version 0.2.0
import {
  PublicKey,
  Connection,
  Keypair,
  Commitment,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import fs from 'fs';
import csv from 'csv-parser';
import * as bs58 from "bs58";
require("dotenv").config();

// Specify the path to your CSV file
const csvFilePath = './result/out.csv';

// Create an array to store the CSV data
const csvData: string[] = [];

// Read the CSV file and store the data in the array
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    // Assuming there's only one column in the CSV
    const columnValue = row['Address'];
    csvData.push(columnValue);
  })
  .on('end', async () => {
    const admin = Keypair.fromSecretKey(bs58.decode(process.env.PRIV_KEY || ""));

    const commitment: Commitment = "confirmed";
    // const connection = new Connection("https://api-testnet.renec.foundation:8899", { commitment });
    const connection = new Connection("https://api-mainnet-beta.renec.foundation:8899", { commitment });
    // const connection = new Connection("http://localhost:8899", { commitment });

    const token = new PublicKey("HtzrB8LihudQnWPdtK5rMnyExor8jaufXLJeKybxgBzM");

    // GET BALANCE BEFORE
    let balanceBefore = await connection.getBalance(admin.publicKey);
    console.log(`${balanceBefore / LAMPORTS_PER_SOL} SOL`);

    const groupSize = 11;

    for (let i = 0; i < csvData.length; i += groupSize) {
      const group = csvData.slice(i, i + groupSize);

      console.log(`Start create ATA from element ${i} to ${i + groupSize}`);
      const tx = new anchor.web3.Transaction();
      for (let j = 0; j < group.length; j++) {
        const ata = PublicKey.findProgramAddressSync(
          [
            new PublicKey(group[j]).toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            token.toBuffer(),
          ],
          ASSOCIATED_TOKEN_PROGRAM_ID
        )[0];

        const createTokenAccountInstruction = createAssociatedTokenAccountInstruction(
          admin.publicKey,
          ata,
          new PublicKey(group[j]),
          token
        );
        tx.add(createTokenAccountInstruction);
      }

      tx.recentBlockhash = (await connection.getLatestBlockhash("finalized")).blockhash;
      tx.feePayer = admin.publicKey;
      const recoverTx = Transaction.from(tx.serialize({ requireAllSignatures: false }));
      recoverTx.sign(admin);

      const txSignature = await connection.sendRawTransaction(recoverTx.serialize());

      console.log("🚀 ~ file: initialize.ts:25 ~ main ~ txSignature:", txSignature);
    }

    // GET BALANCE AFTER
    let balanceAfter = await connection.getBalance(admin.publicKey);
    console.log(`${balanceAfter / LAMPORTS_PER_SOL} SOL`);
  })
  .on('error', (error) => {
    console.error('Error reading CSV:', error);
  });
