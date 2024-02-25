import * as anchor from '@project-serum/anchor'
import {
  PublicKey,
  Connection,
  Keypair,
  Commitment,
} from "@solana/web3.js";
import fs from 'fs';
import csv from 'csv-parser';
import * as bs58 from "bs58";
require("dotenv").config();

// Specify the path to your CSV file
const csvFilePath = './input/day4.csv';
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
    const commitment: Commitment = "confirmed";
    const connection = new Connection("https://api-mainnet-beta.renec.foundation:8899", { commitment });
    // const connection = new Connection("https://api-testnet.renec.foundation:8899", { commitment });
    // const connection = new Connection("http://localhost:8899", { commitment });

    let counter = 0;
    for (let i = 0; i < csvAddress.length; i++) {
      const info = await connection.getAccountInfo(new PublicKey(csvAddress[i]));
      if (!info) {
        console.log("wallet not init, address: ", csvAddress[i]);
        counter++;
      }
    }
    console.log("🚀 ~ .on ~ counter:", counter)

  })
  .on('error', (error) => {
    console.error('Error reading CSV:', error);
  });
