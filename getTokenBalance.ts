import {
  PublicKey,
  Connection,
  Commitment,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAccount, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from "spl-token"; // version 0.2.0
import * as bs58 from "bs58";
import csv from 'csv-parser';
import fs from 'fs';
require("dotenv").config();
import BigNumber from "bignumber.js";
const csvFilePath = './result/data.csv';
const csvOutputFilePath = './result/out.csv';

const csvData: string[] = [];
const data: string[] = [];
data.push('Addresses');

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    // Assuming there's only one column in the CSV
    const columnValue = row['Addresses'];
    csvData.push(columnValue);
  })
  .on('end', async () => {
    const commitment: Commitment = "confirmed";
    // const connection = new Connection("https://api-testnet.renec.foundation:8899", { commitment });
    const connection = new Connection("https://api-mainnet-beta.renec.foundation:8899", { commitment });
    // const connection = new Connection("http://localhost:8899", { commitment });

    // const token = new PublicKey("4Q89182juiadeFgGw3fupnrwnnDmBhf7e7fHWxnUP3S3"); // USDT
    // const token = new PublicKey("HtzrB8LihudQnWPdtK5rMnyExor8jaufXLJeKybxgBzM"); // PROP
    // const token = new PublicKey("GvTwnAQLTdM6fMZbuGQoVj5odefCC2FsDvaMgxqZV1fi"); // GAST
    const token = new PublicKey("AhDXc3sRW1xKPXwDwAmGb4JonRTka5rdSjg43owF53gg"); // PLUS1
    // const token = new PublicKey("2FuufJ23BJZZVZgE1QQGaUEMmuQ9Cf9iGwaTti1dE5ob");

    for (let j = 0; j < csvData.length; j++) {
      console.log(`process ${j}`)
      console.log(`process ${csvData[j]}`)
      const ata = PublicKey.findProgramAddressSync(
        [
          new PublicKey(csvData[j]).toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          token.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];
      try {
        let balance = await getAccount(connection, ata);
        let balanceUi = (new BigNumber(balance.amount).div(new BigNumber(LAMPORTS_PER_SOL))).toString();
        data.push(balanceUi);
      } catch (e) {
        data.push("0");
      }

      const csvOutData = data.join('\n');
      fs.writeFile(csvOutputFilePath, csvOutData, (err) => {
        if (err) {
          console.error('Error writing to CSV file:', err);
        } else {
          console.log('CSV file has been written successfully.');
        }
      });
    }
  })
  .on('error', (error) => {
    console.error('Error reading CSV:', error);
  });
