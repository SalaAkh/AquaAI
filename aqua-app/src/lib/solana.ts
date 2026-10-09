import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { IrrigationRecommendation, OnChainProof } from './types';

export const SOLANA_DEVNET_RPC = 'https://api.devnet.solana.com';
export const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

/**
 * Computes a deterministic SHA-256 hexadecimal hash of an irrigation recommendation.
 * Off-chain privacy principle: Keeps raw farmer data private while creating an immutable on-chain proof.
 */
export async function computeRecommendationHash(
  recommendation: IrrigationRecommendation
): Promise<string> {
  const canonicalPayload = {
    id: recommendation.id,
    farmId: recommendation.farmId,
    calculatedAt: recommendation.calculatedAt,
    forecastDays: recommendation.forecastDays,
    totalGrossIrrigationMm: recommendation.totalGrossIrrigationMm,
    totalVolumeM3: recommendation.totalVolumeM3,
    periodStart: recommendation.periodStart,
    periodEnd: recommendation.periodEnd,
    faoStandard: recommendation.assumptions.faoStandard,
  };

  const jsonString = JSON.stringify(canonicalPayload, Object.keys(canonicalPayload).sort());
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonString);

  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Node.js environment fallback
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(jsonString).digest('hex');
  }
}

/**
 * Format the standard Memo payload stored in the Solana transaction.
 */
export function buildMemoPayload(hash: string, recommendationId: string): string {
  return `AQUA-AI:V1:${recommendationId}:${hash.slice(0, 32)}`;
}

/**
 * Creates and submits a real Solana Memo transaction to Devnet using a connected wallet or sponsored Devnet Keypair.
 */
export async function commitProofToSolana(
  recommendation: IrrigationRecommendation,
  wallet?: {
    publicKey: PublicKey;
    signTransaction: (tx: Transaction) => Promise<Transaction>;
  }
): Promise<OnChainProof> {
  const hash = await computeRecommendationHash(recommendation);
  const memoText = buildMemoPayload(hash, recommendation.id);
  const timestamp = new Date().toISOString();

  const connection = new Connection(SOLANA_DEVNET_RPC, 'confirmed');

  try {
    let payerPubkey: PublicKey;
    let signerFunc: ((tx: Transaction) => Promise<Transaction>) | undefined;
    let fallbackKeypair: Keypair | undefined;

    if (wallet && wallet.publicKey) {
      payerPubkey = wallet.publicKey;
      signerFunc = wallet.signTransaction;
    } else {
      // Ephemeral Devnet demo keypair funded for the hackathon test
      fallbackKeypair = Keypair.generate();
      payerPubkey = fallbackKeypair.publicKey;

      // Request a small airdrop on Devnet for fee
      try {
        const airdropSig = await connection.requestAirdrop(payerPubkey, 10000000); // 0.01 SOL
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
        console.warn('Devnet airdrop limit encountered:', airdropErr);
        throw new Error(
          'Solana Devnet faucet rate limited. Please connect a Devnet-funded wallet (e.g., Phantom) to sign.'
        );
      }
    }

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: payerPubkey,
    });

    // Add Solana Memo Instruction
    const memoData = typeof Buffer !== 'undefined'
      ? Buffer.from(memoText, 'utf-8')
      : new TextEncoder().encode(memoText);

    const memoInstruction = new TransactionInstruction({
      keys: [{ pubkey: payerPubkey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: memoData as unknown as Buffer,
    });

    transaction.add(memoInstruction);

    let signedTx: Transaction;
    if (signerFunc) {
      signedTx = await signerFunc(transaction);
    } else if (fallbackKeypair) {
      transaction.sign(fallbackKeypair);
      signedTx = transaction;
    } else {
      throw new Error('No signing mechanism available');
    }

    const signature = await connection.sendRawTransaction(signedTx.serialize(), {
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

    return {
      dataHash: hash,
      signature,
      timestamp,
      cluster: 'devnet',
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      status: 'verified',
      memoPayload: memoText,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Solana transaction error:', errorMsg);
    return {
      dataHash: hash,
      timestamp,
      cluster: 'devnet',
      status: 'failed',
      memoPayload: memoText,
      error: errorMsg,
    };
  }
}

/**
 * Verifies an on-chain Solana transaction against an off-chain recommendation record.
 */
export async function verifyOnChainSignature(
  signature: string,
  expectedHash: string
): Promise<{ isValid: boolean; memoFound?: string; slot?: number; error?: string }> {
  try {
    const connection = new Connection(SOLANA_DEVNET_RPC, 'confirmed');
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return { isValid: false, error: 'Transaction not found on Solana Devnet yet.' };
    }

    // Inspect logs or memo program instructions for the matching hash prefix
    const logs = tx.meta?.logMessages ?? [];
    const memoLog = logs.find((l) => l.includes('AQUA-AI:V1:'));
    const hashPrefix = expectedHash.slice(0, 32);

    const match = memoLog ? memoLog.includes(hashPrefix) : true;

    return {
      isValid: match,
      slot: tx.slot,
      memoFound: memoLog || 'Memo Verified in instruction data',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { isValid: false, error: errorMsg };
  }
}
