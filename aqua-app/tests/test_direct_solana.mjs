import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';

const SOLANA_DEVNET_RPC = 'https://api.devnet.solana.com';
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

async function testMemoTx() {
  const memoText = "AQUA-AI:V1:TEST:1234567890";
  const data = new TextEncoder().encode(memoText);
  const kp = Keypair.generate();

  const ix = new TransactionInstruction({
    keys: [{ pubkey: kp.publicKey, isSigner: true, isWritable: false }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(data),
  });

  console.log("Instruction created successfully with Buffer.from(data)");
}

testMemoTx();
