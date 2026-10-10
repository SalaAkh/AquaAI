'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  Keypair,
} from '@solana/web3.js';
import { MEMO_PROGRAM_ID, SOLANA_DEVNET_RPC } from './solana';

// Minimal typing for browser Solana providers (Phantom, Solflare, etc.)
interface SolanaProvider {
  isPhantom?: boolean;
  isSolflare?: boolean;
  publicKey?: { toString: () => string; toBase58: () => string };
  isConnected?: boolean;
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{
    publicKey: { toString: () => string; toBase58: () => string };
  }>;
  disconnect: () => Promise<void>;
  signAndSendTransaction?: (transaction: Transaction) => Promise<{ signature: string }>;
  signTransaction?: (transaction: Transaction) => Promise<Transaction>;
}

interface WalletContextType {
  publicKey: string | null;
  shortAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  walletName: string | null;
  balanceSol: number | null;
  hasBrowserExtension: boolean;
  connectWallet: () => Promise<void>;
  connectSimulatedWallet: () => void;
  disconnectWallet: () => void;
  sendMemoWithWallet: (payload: string) => Promise<{ signature: string; slot?: number }>;
}

const WalletContext = createContext<WalletContextType>({
  publicKey: null,
  shortAddress: null,
  isConnected: false,
  isConnecting: false,
  walletName: null,
  balanceSol: null,
  hasBrowserExtension: false,
  connectWallet: async () => {},
  connectSimulatedWallet: () => {},
  disconnectWallet: () => {},
  sendMemoWithWallet: async () => ({ signature: '' }),
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [balanceSol, setBalanceSol] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [simulatedKeypair, setSimulatedKeypair] = useState<Keypair | null>(null);

  // Helper to fetch live Devnet balance
  const fetchBalance = useCallback(async (pubkeyStr: string) => {
    try {
      const conn = new Connection(SOLANA_DEVNET_RPC, 'confirmed');
      const pubkey = new PublicKey(pubkeyStr);
      const lamports = await conn.getBalance(pubkey);
      setBalanceSol(Number((lamports / 1e9).toFixed(4)));
    } catch (err) {
      console.warn('Failed to fetch SOL balance:', err);
      setBalanceSol(0);
    }
  }, []);

  // Check if browser extension exists
  const getProvider = (): { provider: SolanaProvider | null; name: string } => {
    if (typeof window === 'undefined') return { provider: null, name: '' };
    const win = window as unknown as {
      phantom?: { solana?: SolanaProvider };
      solana?: SolanaProvider;
      solflare?: SolanaProvider;
    };

    if (win.phantom?.solana?.isPhantom) return { provider: win.phantom.solana, name: 'Phantom' };
    if (win.solana?.isPhantom) return { provider: win.solana, name: 'Phantom' };
    if (win.solflare?.isSolflare) return { provider: win.solflare, name: 'Solflare' };
    if (win.solana) return { provider: win.solana, name: 'Solana Wallet' };
    return { provider: null, name: '' };
  };

  const hasBrowserExtension = typeof window !== 'undefined' && !!getProvider().provider;

  // Connect to native browser extension
  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const { provider, name } = getProvider();
      if (!provider) {
        // Fallback to simulated devnet keypair if no extension is installed
        connectSimulatedWallet();
        return;
      }

      const resp = await provider.connect();
      const pubkey = resp.publicKey ? resp.publicKey.toString() : provider.publicKey?.toString();
      if (pubkey) {
        setPublicKey(pubkey);
        setWalletName(name);
        setSimulatedKeypair(null);
        await fetchBalance(pubkey);
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  // Instant simulated Devnet keypair for testing
  const connectSimulatedWallet = () => {
    // Generate or retrieve stored demo keypair
    const stored = localStorage.getItem('aqua_sim_wallet');
    let kp: Keypair;
    if (stored) {
      try {
        kp = Keypair.fromSecretKey(new Uint8Array(JSON.parse(stored)));
      } catch {
        kp = Keypair.generate();
        localStorage.setItem('aqua_sim_wallet', JSON.stringify(Array.from(kp.secretKey)));
      }
    } else {
      kp = Keypair.generate();
      localStorage.setItem('aqua_sim_wallet', JSON.stringify(Array.from(kp.secretKey)));
    }

    setSimulatedKeypair(kp);
    const pubkeyStr = kp.publicKey.toBase58();
    setPublicKey(pubkeyStr);
    setWalletName('Devnet Farmer Wallet');
    fetchBalance(pubkeyStr);
  };

  const disconnectWallet = () => {
    const { provider } = getProvider();
    if (provider && provider.disconnect) {
      try {
        provider.disconnect();
      } catch {
        // ignore
      }
    }
    setPublicKey(null);
    setWalletName(null);
    setBalanceSol(null);
    setSimulatedKeypair(null);
  };

  // Broadcast a Memo transaction
  const sendMemoWithWallet = async (payload: string): Promise<{ signature: string; slot?: number }> => {
    const conn = new Connection(SOLANA_DEVNET_RPC, 'confirmed');

    // Case 1: Simulated keypair
    if (simulatedKeypair) {
      const balance = await conn.getBalance(simulatedKeypair.publicKey);
      if (balance < 5000) {
        try {
          const airdropSig = await conn.requestAirdrop(simulatedKeypair.publicKey, 100000000); // 0.1 SOL
          const latest = await conn.getLatestBlockhash('confirmed');
          await conn.confirmTransaction({
            signature: airdropSig,
            blockhash: latest.blockhash,
            lastValidBlockHeight: latest.lastValidBlockHeight,
          }, 'confirmed');
        } catch {
          // ignore airdrop rate limit
        }
      }

      const tx = new Transaction().add(
        new TransactionInstruction({
          keys: [{ pubkey: simulatedKeypair.publicKey, isSigner: true, isWritable: false }],
          programId: MEMO_PROGRAM_ID,
          data: Buffer.from(payload, 'utf8'),
        })
      );
      tx.feePayer = simulatedKeypair.publicKey;
      const latestBlockhash = await conn.getLatestBlockhash('confirmed');
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.sign(simulatedKeypair);

      const rawTx = tx.serialize();
      const signature = await conn.sendRawTransaction(rawTx, { skipPreflight: false });
      const confirmation = await conn.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      }, 'confirmed');

      fetchBalance(simulatedKeypair.publicKey.toBase58());
      return { signature, slot: confirmation.context.slot };
    }

    // Case 2: Browser extension (Phantom/Solflare)
    const { provider } = getProvider();
    if (provider && publicKey) {
      const fromPubkey = new PublicKey(publicKey);
      const tx = new Transaction().add(
        new TransactionInstruction({
          keys: [{ pubkey: fromPubkey, isSigner: true, isWritable: false }],
          programId: MEMO_PROGRAM_ID,
          data: Buffer.from(payload, 'utf8'),
        })
      );
      tx.feePayer = fromPubkey;
      const latestBlockhash = await conn.getLatestBlockhash('confirmed');
      tx.recentBlockhash = latestBlockhash.blockhash;

      if (provider.signAndSendTransaction) {
        const res = await provider.signAndSendTransaction(tx);
        await conn.confirmTransaction({
          signature: res.signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        }, 'confirmed');
        fetchBalance(publicKey);
        return { signature: res.signature };
      }
    }

    throw new Error('No wallet available to sign');
  };

  const shortAddress = publicKey
    ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
    : null;

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        shortAddress,
        isConnected: !!publicKey,
        isConnecting,
        walletName,
        balanceSol,
        hasBrowserExtension,
        connectWallet,
        connectSimulatedWallet,
        disconnectWallet,
        sendMemoWithWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useSolanaWallet = () => useContext(WalletContext);
