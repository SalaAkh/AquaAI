import { NextRequest, NextResponse } from 'next/server';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { MEMO_PROGRAM_ID, SOLANA_DEVNET_RPC } from '@/lib/solana';

// Dedicated server-side Devnet sponsor keypair for seamless hackathon judge testing
// This ensures transactions broadcast immediately without requiring local wallet extensions
const SPONSOR_KEY_BYTES = new Uint8Array([
  23, 145, 92, 12, 88, 204, 15, 77, 199, 41, 102, 63, 11, 218, 59, 172,
  83, 190, 44, 21, 134, 78, 99, 150, 201, 114, 82, 33, 149, 18, 64, 230,
  55, 12, 89, 144, 221, 67, 108, 93, 166, 245, 18, 79, 130, 211, 45, 168,
  94, 201, 17, 83, 120, 95, 38, 174, 62, 119, 205, 31, 148, 88, 219, 105
]);

export async function POST(req: NextRequest) {
  try {
    const { hash, recommendationId } = await req.json();

    if (!hash || !recommendationId) {
      return NextResponse.json(
        { error: 'Missing hash or recommendationId parameters' },
        { status: 400 }
      );
    }

    const memoPayload = `AQUA-AI:V1:${recommendationId}:${hash.slice(0, 32)}`;
    const connection = new Connection(SOLANA_DEVNET_RPC, 'confirmed');

    // Generate or use sponsor keypair
    let sponsorKeypair: Keypair;
    try {
      sponsorKeypair = Keypair.fromSecretKey(SPONSOR_KEY_BYTES);
    } catch {
      sponsorKeypair = Keypair.generate();
    }

    // Ensure sponsor keypair has minimal balance for fee (5000 lamports = 0.000005 SOL)
    const balance = await connection.getBalance(sponsorKeypair.publicKey);
    if (balance < 10000) {
      try {
        const airdropSig = await connection.requestAirdrop(sponsorKeypair.publicKey, 100000000); // 0.1 SOL
        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
        await connection.confirmTransaction(
          {
            signature: airdropSig,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          'confirmed'
        );
      } catch (airdropErr) {
        console.warn('Devnet airdrop attempt warning:', airdropErr);
      }
    }

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: sponsorKeypair.publicKey,
    });

    const memoInstruction = new TransactionInstruction({
      keys: [{ pubkey: sponsorKeypair.publicKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoPayload, 'utf-8'),
    });

    transaction.add(memoInstruction);
    transaction.sign(sponsorKeypair);

    const signature = await connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
    });

    await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      'confirmed'
    );

    return NextResponse.json({
      success: true,
      signature,
      memoPayload,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      payer: sponsorKeypair.publicKey.toBase58(),
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Server-side Solana broadcast failed:', errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
