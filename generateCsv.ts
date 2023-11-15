import fs from 'fs';
import { Keypair } from '@solana/web3.js';

const csvFilePath = './result/output.csv';

const data: string[] = [];
data.push('Address');
for (let i = 0; i < 2542; i++) {
  data.push(Keypair.generate().publicKey.toBase58());
}

const csvData = data.join('\n');

fs.writeFile(csvFilePath, csvData, (err) => {
  if (err) {
    console.error('Error writing to CSV file:', err);
  } else {
    console.log('CSV file has been written successfully.');
  }
});