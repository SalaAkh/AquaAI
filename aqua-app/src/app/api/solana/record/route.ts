import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { Connection, Keypair, Transaction, TransactionInstruction } from '@solana/web3.js';
import { MEMO_PROGRAM_ID, SOLANA_DEVNET_RPC } from '@/lib/solana';

// Disabled unless both credentials are configured on the SERVER.
// Do not set either value in NEXT_PUBLIC_ variables.
export async function POST(req: NextRequest) {
  const privateKey = process.env.SOLANA_SPONSOR_SECRET_KEY;
  const accessToken = process.env.SOLANA_SPONSOR_ACCESS_TOKEN;
  if (!privateKey || !accessToken) {
    return NextResponse.json({ error: 'Sponsored recording disabled; use a funded Devnet wallet.' }, { status: 503 });
  }

  const supplied = Buffer.from(req.headers.get('x-aqua-sponsor-token') || '', 'utf8');
  const expected = Buffer.from(accessToken, 'utf8');
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { hash, recommendationId } = await req.json();
    if (typeof hash !== 'string' || !/^[0-9a-f]{64}$/i.test(hash)
      || typeof recommendationId !== 'string' || !/^[a-zA-Z0-9_:.-]{1,120}$/.test(recommendationId)) {
      return NextResponse.json({ error: 'Invalid recommendation hash or ID' }, { status: 400 });
    }
    const keyBytes = JSON.parse(privateKey);
    if (!Array.isArray(keyBytes) || keyBytes.length !== 64
      || !keyBytes.every((n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 255)) {
      throw new Error('Invalid sponsor secret key configuration');
    }
    const signer = Keypair.fromSecretKey(Uint8Array.from(keyBytes));
    const connection = new Connection(SOLANA_DEVNET_RPC, 'confirmed');
    if ((await connection.getBalance(signer.publicKey)) < 10000) {
      return NextResponse.json({ error: 'Sponsor wallet needs funding on Devnet' }, { status: 503 });
    }
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    const memoPayload = `AQUA-AI:V1:${recommendationId}:${hash.slice(0, 32)}`;
    const transaction = new Transaction({ recentBlockhash: blockhash, feePayer: signer.publicKey });
    transaction.add(new TransactionInstruction({
      keys: [{ pubkey: signer.publicKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoPayload, 'utf8'),
    }));
    transaction.sign(signer);
    const signature = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');
    return NextResponse.json({
      success: true, signature, memoPayload,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    });
  } catch (error) {
    console.error('Sponsored proof failed:', error);
    return NextResponse.json({ error: 'Failed to record sponsored proof' }, { status: 500 });
  }
}
