/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Globe, 
  Cpu, 
  Film, 
  Lock, 
  CheckCircle2, 
  Flame, 
  ArrowRight,
  KeyRound,
  RotateCcw,
  Star,
  Layers,
  HelpCircle
} from 'lucide-react';
import { addonPaywall, PaywallSubscriptionDetails } from '../../lib/plugins/addonPaywall';
import AppLogo from '../AppLogo';

interface TvAddonPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockedSuccess?: () => void;
  targetAddonName?: string;
}

type PlanType = 'annual' | 'monthly' | 'lifetime';

export const TvAddonPaywallModal: React.FC<TvAddonPaywallModalProps> = ({
  isOpen,
  onClose,
  onUnlockedSuccess,
  targetAddonName
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showVoucherInput, setShowVoucherInput] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [details, setDetails] = useState<PaywallSubscriptionDetails>(() => addonPaywall.getDetails());

  useEffect(() => {
    if (isOpen) {
      setDetails(addonPaywall.getDetails());
      setShowSuccess(false);
      setVoucherError(null);
      setVoucherCode('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCheckout = () => {
    setIsProcessing(true);
    setVoucherError(null);

    // Simulate realistic instant payment processing
    setTimeout(() => {
      const updated = addonPaywall.unlock(selectedPlan);
      setDetails(updated);
      setIsProcessing(false);
      setShowSuccess(true);
      if (onUnlockedSuccess) {
        onUnlockedSuccess();
      }
    }, 750);
  };

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    const res = addonPaywall.validateVoucher(voucherCode);
    if (res.valid) {
      const updated = addonPaywall.unlock(res.plan || 'voucher', voucherCode.trim().toUpperCase());
      setDetails(updated);
      setShowSuccess(true);
      setVoucherError(null);
      if (onUnlockedSuccess) {
        onUnlockedSuccess();
      }
    } else {
      setVoucherError(res.message);
    }
  };

  const handleCancelSubscription = () => {
    addonPaywall.lock();
    setDetails(addonPaywall.getDetails());
    setShowSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto no-scrollbar rounded-3xl bg-[#12131c] border border-white/15 shadow-2xl text-white flex flex-col">
        
        {/* Holographic Iridescent Top Glow Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-400 via-indigo-400 via-pink-400 via-emerald-400 to-amber-300" />

        {/* Modal Header */}
        <div className="relative p-6 sm:p-8 pb-4 flex items-start justify-between border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-sky-500/25 p-0.5 bg-gradient-to-br from-sky-400 via-pink-400 to-amber-300 flex-shrink-0">
              <div className="w-full h-full bg-[#13141f] rounded-[14px] flex items-center justify-center">
                <AppLogo className="w-8 h-8" showBackground={false} />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                  Community Addons VIP Pass
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-sky-400/20 via-pink-400/20 to-amber-400/20 text-pink-300 border border-pink-400/40 shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  VIP Access
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
                {targetAddonName 
                  ? `Access to "${targetAddonName}" and 20+ community stream scrapers requires a Community VIP Pass.`
                  : 'Unlock the decentralized Stremio addon ecosystem with 4K scrapers, Debrid resolvers, and custom manifests.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="Close Paywall"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {showSuccess ? (
            /* SUCCESS STATE */
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-transparent border border-emerald-500/30 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white font-display">
                  Community VIP Pass Activated!
                </h3>
                <p className="text-sm text-zinc-300 max-w-md mx-auto">
                  You now have full, unrestricted access to the entire Stremio community addon repository, 4K scrapers, and custom plugin installations.
                </p>
              </div>

              {/* License Details Card */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Active Plan:</span>
                  <span className="font-semibold text-white">{details.planName}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Activated On:</span>
                  <span className="text-white">{details.activatedAt}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Access Valid Until:</span>
                  <span className="text-emerald-400 font-medium">{details.expiresAt}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400 font-mono">
                  <span>License Token:</span>
                  <span className="text-sky-300">{details.licenseKey}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Explore Community Addons
                </button>
                <button
                  onClick={handleCancelSubscription}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-rose-400 text-xs font-semibold border border-white/10 transition-colors"
                >
                  Test: Lock Again
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/25 shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Torrentio & CyberFlix</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Scrape millions of community magnet streams with zero configuration.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-pink-500/15 text-pink-400 border border-pink-500/25 shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">4K REMUX & HDR10+</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Uncapped bitrates with Dolby Vision, TrueHD Atmos, and 60fps support.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Debrid High-Speed Cache</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Connect Real-Debrid or AllDebrid for instant buffered cloud playback.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Custom Manifest URLs</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Install any 3rd-party Stremio v3 addon directly via HTTPS or JSON.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 shrink-0">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Hardware AV1 & HEVC</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Integrated ffmpeg decoders for ultra low CPU usage and instant seeking.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/25 shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Community Catalogs</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Anime, documentary, public domain, and live community feeds.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Cards Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold tracking-wide text-zinc-300 uppercase">
                    Select Your VIP Pass
                  </span>
                  <span className="text-xs text-sky-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 30-Day Money-Back Guarantee
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  
                  {/* Plan 1: Annual (Best Value) */}
                  <div
                    onClick={() => setSelectedPlan('annual')}
                    className={`relative p-5 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between ${
                      selectedPlan === 'annual'
                        ? 'bg-gradient-to-b from-indigo-950/70 via-purple-950/40 to-black/60 border-pink-400 shadow-xl shadow-pink-500/15 ring-2 ring-pink-400/50'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-gradient-to-r from-pink-500 to-amber-400 text-black shadow-md">
                      Best Value • 7 Days Free
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-white text-base">Annual Pass</h4>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedPlan === 'annual'
                            ? 'border-pink-400 bg-pink-500 text-white'
                            : 'border-white/20'
                        }`}>
                          {selectedPlan === 'annual' && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400">Includes 7-day free trial</p>

                      <div className="mt-4 mb-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-white">$34.99</span>
                          <span className="text-xs text-zinc-400">/ year</span>
                        </div>
                        <span className="text-[11px] text-pink-300 font-medium">Just $2.91/month (Save 42%)</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 text-[11px] text-zinc-300 space-y-1 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        <span>All Community Addons</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        <span>4K Scrapers + Debrid sync</span>
                      </div>
                    </div>
                  </div>

                  {/* Plan 2: Lifetime Pass */}
                  <div
                    onClick={() => setSelectedPlan('lifetime')}
                    className={`relative p-5 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between ${
                      selectedPlan === 'lifetime'
                        ? 'bg-gradient-to-b from-sky-950/70 via-indigo-950/40 to-black/60 border-sky-400 shadow-xl shadow-sky-500/15 ring-2 ring-sky-400/50'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-gradient-to-r from-sky-400 to-emerald-400 text-black shadow-md">
                      Lifetime Founder
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-white text-base">Lifetime Pass</h4>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedPlan === 'lifetime'
                            ? 'border-sky-400 bg-sky-500 text-white'
                            : 'border-white/20'
                        }`}>
                          {selectedPlan === 'lifetime' && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400">Pay once, own forever</p>

                      <div className="mt-4 mb-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-white">$29.99</span>
                          <span className="text-xs text-zinc-400">one-time</span>
                        </div>
                        <span className="text-[11px] text-sky-300 font-medium">Never pay monthly fees</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 text-[11px] text-zinc-300 space-y-1 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>Lifetime community updates</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>Priority scraper indexer</span>
                      </div>
                    </div>
                  </div>

                  {/* Plan 3: Monthly Pass */}
                  <div
                    onClick={() => setSelectedPlan('monthly')}
                    className={`relative p-5 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between ${
                      selectedPlan === 'monthly'
                        ? 'bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-zinc-300 shadow-xl ring-2 ring-zinc-300/50'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-white text-base">Monthly Pass</h4>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedPlan === 'monthly'
                            ? 'border-white bg-white text-black'
                            : 'border-white/20'
                        }`}>
                          {selectedPlan === 'monthly' && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400">Month-to-month flexibility</p>

                      <div className="mt-4 mb-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-white">$4.99</span>
                          <span className="text-xs text-zinc-400">/ month</span>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-medium">Cancel anytime in 1-click</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 text-[11px] text-zinc-300 space-y-1 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                        <span>All Community Addons</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                        <span>Monthly auto-renewal</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-400 via-pink-500 to-amber-300 hover:opacity-95 text-black font-extrabold text-base shadow-xl shadow-pink-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Activating VIP Pass...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 fill-black" />
                      <span>
                        {selectedPlan === 'annual'
                          ? 'Start 7-Day Free Trial — Then $34.99/yr'
                          : selectedPlan === 'lifetime'
                          ? 'Get Lifetime VIP Pass — $29.99'
                          : 'Unlock Monthly Access — $4.99/mo'}
                      </span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {/* Subtext info */}
                <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 px-1 gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowVoucherInput(!showVoucherInput)}
                      className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 font-medium"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      Have a Voucher or License Key?
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => {
                        addonPaywall.unlock('annual');
                        setDetails(addonPaywall.getDetails());
                        setShowSuccess(true);
                        if (onUnlockedSuccess) onUnlockedSuccess();
                      }}
                      className="text-zinc-400 hover:text-white hover:underline"
                    >
                      Restore Purchase
                    </button>
                  </div>

                  <span className="text-[11px] text-zinc-500">
                    Encrypted 256-bit checkout • Instant activation
                  </span>
                </div>

                {/* Voucher input accordion */}
                {showVoucherInput && (
                  <form onSubmit={handleApplyVoucher} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 animate-in fade-in duration-150">
                    <label className="block text-xs font-semibold text-zinc-300">
                      Redeem Community License or Promo Code:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        placeholder="e.g. VIP-PASS, COMMUNITY2026"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400 font-mono uppercase"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                      >
                        Redeem
                      </button>
                    </div>
                    {voucherError && (
                      <p className="text-[11px] text-rose-400 font-medium">{voucherError}</p>
                    )}
                    <p className="text-[10px] text-zinc-500">
                      Tip: Use demo test codes <code className="text-sky-300 font-mono">VIP-PASS</code> or <code className="text-sky-300 font-mono">COMMUNITY2026</code>.
                    </p>
                  </form>
                )}
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
