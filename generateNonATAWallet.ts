import * as anchor from '@project-serum/anchor'
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAccount } from "spl-token"; // version 0.2.0
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
import { getTxSize } from './txSize';
import * as bs58 from "bs58";
require("dotenv").config();

// Specify the path to your CSV file
const csvFilePath = './result/address.csv';
const csvOutputFilePath = './result/out.csv';

// Create an array to store the CSV data
const csvData: string[] = [];
const data: string[] = [];
data.push('Address');

// Read the CSV file and store the data in the array
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    // Assuming there's only one column in the CSV
    const columnValue = row['Address'];
    csvData.push(columnValue);
  })
  .on('end', async () => {
    const commitment: Commitment = "confirmed";
    // const connection = new Connection("https://api-testnet.renec.foundation:8899", { commitment });
    const connection = new Connection("https://api-mainnet-beta.renec.foundation:8899", { commitment });
    // const connection = new Connection("http://localhost:8899", { commitment });

    const token = new PublicKey("B9jQmcsGpXgdN4KnTZgJ5syngtVvJhRqtJ3nEi3CJ6Nx");

    // GET BALANCE BEFORE
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
        try {
          await getAccount(connection, ata);
        } catch (e) {
          data.push(group[j]);
        }
      }
    }

    const csvOutData = data.join('\n');
    fs.writeFile(csvOutputFilePath, csvOutData, (err) => {
      if (err) {
        console.error('Error writing to CSV file:', err);
      } else {
        console.log('CSV file has been written successfully.');
      }
    });
  })
  .on('error', (error) => {
    console.error('Error reading CSV:', error);
  });
