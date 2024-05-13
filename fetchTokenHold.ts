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
const csvOutputFilePath = './result/holder.csv';

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

    // const token = new PublicKey("GvTwnAQLTdM6fMZbuGQoVj5odefCC2FsDvaMgxqZV1fi"); // GAST
    const token = new PublicKey("HtzrB8LihudQnWPdtK5rMnyExor8jaufXLJeKybxgBzM"); // PROP

    for (let j = 0; j < csvData.length; j++) {
      const ata = PublicKey.findProgramAddressSync(
        [
          new PublicKey(csvData[j]).toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          token.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];
      let ataInfo;
      try {
        await getAccount(connection, ata);
        ataInfo = await connection.getTokenAccountBalance(ata);
        data.push(csvData[j] + ',' + ataInfo.value.uiAmount);
      } catch (e) {
        data.push(csvData[j] + ',0');
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
