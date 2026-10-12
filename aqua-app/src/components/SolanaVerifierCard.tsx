'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  Lock,
  Wallet,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { IrrigationRecommendation, OnChainProof } from '@/lib/types';
import {
  commitProofToSolana,
  computeRecommendationHash,
  verifyOnChainSignature,
  SOLANA_DEVNET_RPC,
} from '@/lib/solana';
import { useSolanaWallet } from '@/lib/wallet';
import { useTranslation } from '@/lib/i18n';

interface SolanaVerifierCardProps {
  recommendation: IrrigationRecommendation;
  onProofCreated?: (proof: OnChainProof) => void;
}

export const SolanaVerifierCard: React.FC<SolanaVerifierCardProps> = ({
  recommendation,
  onProofCreated,
}) => {
  const { t, language } = useTranslation();
  const [hash, setHash] = useState<string>('');
  const [isHashing, setIsHashing] = useState(false);
  const [proof, setProof] = useState<OnChainProof | null>(recommendation.onChainProof || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationInput, setVerificationInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    tested: boolean;
    valid?: boolean;
    memo?: string;
    slot?: number;
    error?: string;
  }>({ tested: false });
  const [copied, setCopied] = useState(false);

  // Compute recommendation hash on load or change
  useEffect(() => {
    let isMounted = true;
    setIsHashing(true);
    computeRecommendationHash(recommendation)
      .then((h) => {
        if (isMounted) {
          setHash(h);
          setIsHashing(false);
        }
      })
      .catch((err) => {
        console.error('Failed computing hash:', err);
        if (isMounted) setIsHashing(false);
      });
    return () => {
      isMounted = false;
    };
  }, [recommendation]);

  const wallet = useSolanaWallet();

  const handleCommitToSolana = async () => {
    setIsSubmitting(true);
    try {
      let result: OnChainProof;
      if (wallet.isConnected) {
        const memoPayload = `AQUA-AI:V1:${recommendation.id}:${hash.slice(0, 32)}`;
        const res = await wallet.sendMemoWithWallet(memoPayload);
        result = {
          dataHash: hash,
          signature: res.signature,
          slot: res.slot,
          timestamp: new Date().toISOString(),
          cluster: 'devnet',
          explorerUrl: `https://explorer.solana.com/tx/${res.signature}?cluster=devnet`,
          status: 'verified',
          memoPayload,
        };
      } else {
        result = await commitProofToSolana(recommendation);
      }

      setProof(result);
      if (onProofCreated) {
        onProofCreated(result);
      }
      if (result.signature) {
        setVerificationInput(result.signature);
      }
    } catch (err: unknown) {
      console.error('Solana submission error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setProof({
        dataHash: hash,
        timestamp: new Date().toISOString(),
        cluster: 'devnet',
        status: 'failed',
        memoPayload: `AQUA-AI:V1:${recommendation.id}:${hash.slice(0, 32)}`,
        error: errMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOnChain = async () => {
    if (!verificationInput.trim()) return;
    setIsVerifying(true);
    setVerificationResult({ tested: false });
    try {
      const res = await verifyOnChainSignature(verificationInput.trim(), hash);
      setVerificationResult({
        tested: true,
        valid: res.isValid,
        memo: res.memoFound,
        slot: res.slot,
        error: res.error,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setVerificationResult({
        tested: true,
        valid: false,
        error: errMsg,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-xl shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{t.solanaTitle}</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                {t.memoProgramBadge}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {t.solanaSubtitle}
            </p>
          </div>
        </div>

        {/* Wallet Status / Connect Button */}
        <div className="flex items-center gap-2">
          {wallet.isConnected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-xl text-xs font-semibold text-purple-800">
              <Wallet className="w-3.5 h-3.5 text-purple-600" />
              <span>{wallet.shortAddress}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-purple-200/70 text-purple-900 rounded font-mono">
                {wallet.walletName || 'Devnet'}
              </span>
            </div>
          ) : (
            <button
              onClick={wallet.connectWallet}
              disabled={wallet.isConnecting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50/80 hover:bg-purple-100 text-xs font-semibold text-purple-800 transition-colors shadow-2xs"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{wallet.isConnecting ? t.connecting : t.connectWalletBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Off-Chain Data Privacy Architecture Box */}
      <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-purple-950 flex items-start gap-3">
        <Lock className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-purple-900 mb-0.5">{t.offchainTitle}</div>
          <p className="text-purple-800/90 leading-relaxed">
            {t.offchainDesc}
          </p>
        </div>
      </div>

      {/* Recommendation Cryptographic Digest */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">
            {t.fingerprintLabel}
          </span>
          <button
            onClick={() => copyToClipboard(hash)}
            className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? t.copied : t.copyHashBtn}</span>
          </button>
        </div>
        <div className="font-mono text-xs text-slate-800 break-all bg-white p-2.5 rounded-lg border border-slate-200">
          {isHashing ? 'Computing cryptographic digest...' : hash || 'No hash generated'}
        </div>
        <div className="text-[11px] text-slate-500">
          {t.canonicalPayloadLabel} ID: {recommendation.id} • {recommendation.periodStart} ~ {recommendation.periodEnd} • Gross: {recommendation.totalGrossIrrigationMm} mm • Volume: {recommendation.totalVolumeM3.toLocaleString()} m³.
        </div>
      </div>

      {/* Record on Solana Devnet CTA */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">{t.commitStepTitle}</h4>
            <p className="text-xs text-slate-500">
              {t.commitStepDesc} ({SOLANA_DEVNET_RPC})
            </p>
          </div>

          <button
            onClick={handleCommitToSolana}
            disabled={isSubmitting || !hash}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{t.recordingInProgress}</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{t.recordOnChainBtn}</span>
              </>
            )}
          </button>
        </div>

        {/* Real Status Box */}
        {proof && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 ${
              proof.status === 'verified'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/70 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold">
                {proof.status === 'verified' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t.verifiedStatus}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Notice</span>
                  </>
                )}
              </div>
              <span className="font-mono text-[10px] text-slate-500">
                {new Date(proof.timestamp).toLocaleTimeString()}
              </span>
            </div>

            {proof.signature && (
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-600">Solana Transaction Signature:</div>
                <div className="font-mono text-[11px] break-all bg-white/80 p-2 rounded border border-emerald-200">
                  {proof.signature}
                </div>
                {proof.explorerUrl && (
                  <div className="pt-1">
                    <a
                      href={proof.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 underline underline-offset-2"
                    >
                      <span>{t.viewExplorerBtn}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {proof.error && (
              <div className="text-[11px] text-rose-700 pt-1 space-y-1">
                <div><strong>Status Detail:</strong> {proof.error}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Verify Existing Signature Section */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900">{t.verifyRpcStepTitle}</h4>
          <p className="text-xs text-slate-500">
            {t.verifyRpcStepDesc}
          </p>
        </div>

        <form
          id="solana-verification-form"
          name="solanaVerificationForm"
          onSubmit={(e) => {
            e.preventDefault();
            handleVerifyOnChain();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            id="solana-verification-input"
            name="solanaTxSignature"
            type="text"
            autoComplete="off"
            aria-label={t.txSignaturePlaceholder}
            value={verificationInput}
            onChange={(e) => setVerificationInput(e.target.value)}
            placeholder={t.txSignaturePlaceholder}
            className="flex-1 px-3.5 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
          <button
            id="solana-verify-submit-btn"
            name="solanaVerifySubmitBtn"
            type="submit"
            disabled={isVerifying || !verificationInput.trim()}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
          >
            {isVerifying ? t.verifying : t.verifyNowBtn}
          </button>
        </form>

        {verificationResult.tested && (
          <div
            className={`p-3.5 rounded-xl border text-xs ${
              verificationResult.valid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {verificationResult.valid ? (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">{t.hashVerifiedValid}</div>
                  <div className="text-[11px] text-emerald-800 mt-0.5">
                    Solana Devnet Memo: Slot {verificationResult.slot ?? 'Latest'}.
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">{t.hashVerificationFailed}</div>
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    {verificationResult.error || 'Transaction not found or hash mismatch.'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
