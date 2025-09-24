import { useState, useRef, useEffect, useMemo } from "react";
import {
  Copy,
  Check,
  TrendingUp,
  Users,
  ArrowRight,
  BarChart3,
  Wallet,
  Coins,
  Share2,
  Bitcoin,
  DollarSign,
  Zap,
  Star,
  Globe,
  Shield,
  Loader2,
} from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { backendApi } from "@/utils/apiClients"; // must exist in your project
import UseUserHook from "@/hooks/user/UseUserHook"; // optional but expected from your old code
import { motion, AnimatePresence } from "framer-motion";
import ModernHeading from "../lib/ModernHeading";
import { FloatingParticles } from "../../utils/FloatingParticles";
// import { AnimatedGrid } from "../../utils/AnimatedGrid";
// import { AnimatedGrid } from "./UserTransaction";

/**
 * Fully-implemented referral dashboard with live API wiring.
 *
 * Expected backend endpoints (create these if they don't already exist):
 * 1) PUT   /update-user
 *    body: { id: string, referralAccount: string }
 *
 * 2) GET   /user-zone-ibs/:referralAccount
 *    resp: { data: Array<{ id: string, date: string, amount: number, trades?: number, user?: string, type?: string }> }
 *
 * 3) (Optional but recommended) GET /user-zone-ibs/:referralAccount/summary
 *    resp: { totalEarnings: number, activeReferrals: number, totalReferrals: number, monthlyCommission: number }
 *
 * 4) (Optional) GET /user-zone-ibs/:referralAccount/activity?limit=20
 *    resp: { data: Array<{ user: string, action: string, amount: number, at: string }> }
 *
 * 5) (Optional) GET /user-zone-ibs/:referralAccount/history?days=30
 *    resp: { data: Array<{ date: string, amount: number, trades: number }> }
 *
 * If (3)-(5) are not available, the component falls back to computing a basic summary
 * from (2) and shows synthetic recent activity/history derived from that list.
 */

// --- Small helpers ---------------------------------------------------------
const generateRandomDigits = (len = 7) => {
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
  return s;
};

const clsx = (...parts) => parts.filter(Boolean).join(" ");

const tierStyles = {
  orange: {
    ring: "border-orange-500/30",
    chipBg: "bg-orange-500/20",
    chipText: "text-orange-400",
  },
  gray: {
    ring: "border-gray-400/30",
    chipBg: "bg-gray-400/20",
    chipText: "text-gray-300",
  },
  yellow: {
    ring: "border-yellow-500/30",
    chipBg: "bg-yellow-500/20",
    chipText: "text-yellow-400",
  },
};

const glowVariants = {
  orange: "from-orange-500",
  amber: "from-amber-500",
  yellow: "from-yellow-500",
};

// --- Component -------------------------------------------------------------
const CryptoReferralDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const hasAnimatedRef = useRef(false);

  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeReferrals: 0,
    totalReferrals: 0,
    monthlyCommission: 0,
  });
  const [activity, setActivity] = useState([]); // recent referral activity
  const [history, setHistory] = useState([]); // daily commission history
  const [allCommissions, setAllCommissions] = useState([]);

  const [baseUrl, setBaseUrl] = useState("");

  // from your existing store
  const loggedUser = useSelector((s) => s.user?.loggedUser);
  const { getUpdateLoggedUser } = (UseUserHook && UseUserHook()) || {};

  // On first client paint, compute base URL and trigger hero visibility
  useEffect(() => {
    if (!hasAnimatedRef.current) {
      setIsVisible(true);
      hasAnimatedRef.current = true;
    }
    if (typeof window !== "undefined") {
      try {
        setBaseUrl(new URL(window.location.href).origin);
      } catch (e) {
        // no-op
      }
    }
  }, []);

  const affiliateId = loggedUser?.referralAccount || "";
  const referralLink = useMemo(() => {
    return affiliateId && baseUrl ? `${baseUrl}/user/signup/${affiliateId}` : "";
  }, [affiliateId, baseUrl]);

  // Fetchers with cancellation
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchSummary = async () => {
      if (!affiliateId) return;
      setLoading(true);
      setError("");
      try {
        // Try summary endpoint
        const { data } = await backendApi.get(
          `/user-zone-ibs/${affiliateId}/summary`,
          { signal }
        );
        if (data) {
          setStats({
            totalEarnings: Number(data.totalEarnings || 0),
            activeReferrals: Number(data.activeReferrals || 0),
            totalReferrals: Number(data.totalReferrals || 0),
            monthlyCommission: Number(data.monthlyCommission || 0),
          });
        }
      } catch (e) {
        // If 404 or no endpoint, we'll compute summary below after we fetch list
      }

      try {
        // Commissions list (base source of truth)
        const res = await backendApi.get(`/user-zone-ibs/${affiliateId}`, {
          signal,
        });
        const list = res?.data?.data ?? [];
        setAllCommissions(list);

        // If summary missing, compute minimal summary
        if (!stats.totalEarnings && list.length) {
          const totalEarnings = list.reduce((sum, r) => sum + Number(r.amount || 0), 0);
          const totalReferrals = new Set(
            list.map((r) => (r.userId || r.user || r.clientId || "")).filter(Boolean)
          ).size;
          const activeReferrals = totalReferrals; // without extra signals, assume all seen users are active

          // compute monthlyCommission from current month entries
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthlyCommission = list
            .filter((r) => {
              const d = new Date(r.date || r.createdAt || 0);
              return d >= monthStart;
            })
            .reduce((sum, r) => sum + Number(r.amount || 0), 0);

          setStats({ totalEarnings, activeReferrals, totalReferrals, monthlyCommission });
        }
      } catch (e) {
        setError("Failed to load commissions");
      } finally {
        setLoading(false);
      }

      // Try explicit activity
      try {
        const a = await backendApi.get(`/user-zone-ibs/${affiliateId}/activity`, {
          params: { limit: 10 },
          signal,
        });
        setActivity(a?.data?.data ?? []);
      } catch (e) {
        // Fallback to synthesizing from commissions list
        setActivity((prev) => prev.length ? prev : synthesizeActivity(allCommissions));
      }

      // Try explicit history
      try {
        const h = await backendApi.get(`/user-zone-ibs/${affiliateId}/history`, {
          params: { days: 7 },
          signal,
        });
        setHistory(h?.data?.data ?? []);
      } catch (e) {
        setHistory((prev) => (prev.length ? prev : synthesizeHistory(allCommissions)));
      }
    };

    if (affiliateId) fetchSummary();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [affiliateId]);

  const synthesizeActivity = (list) => {
    // Take latest 5 records and map to UI format
    return (list || [])
      .slice()
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      .slice(0, 5)
      .map((r) => ({
        user: r.user?.name || r.user || r.clientName || "Trader",
        action: r.type || "Completed trade",
        amount: Number(r.amount || 0),
        at: r.date || r.createdAt,
      }));
  };

  const synthesizeHistory = (list) => {
    const byDay = new Map();
    (list || []).forEach((r) => {
      const d = new Date(r.date || r.createdAt || Date.now());
      const key = d.toISOString().slice(0, 10);
      const prev = byDay.get(key) || { date: key, amount: 0, trades: 0 };
      prev.amount += Number(r.amount || 0);
      prev.trades += Number(r.trades || 1);
      byDay.set(key, prev);
    });
    return Array.from(byDay.values())
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 7);
  };

  const createAffiliate = async () => {
    if (creating || !loggedUser?._id) return;
    const toastId = toast.loading("Generating...");
    setCreating(true);
    try {
      const referralAccount = generateRandomDigits(7);
      await backendApi.put("/update-user", {
        id: loggedUser._id,
        referralAccount,
      });
      toast.success("Affiliate ID created", { id: toastId });
      // Update user in store if hook is present
      if (getUpdateLoggedUser) await getUpdateLoggedUser();
    } catch (e) {
      const code = e?.response?.data?.code;
      toast.error(`Please try again later${code ? ` (code ${code})` : ""}.`, { id: toastId });
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1600);
    });
  };

  const shareOn = (platform) => {
    if (!referralLink) return;
    const shareText = `Check out this referral link! ${referralLink}`;
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      discord: `https://discord.com/channels/@me`,
    };
    const url = urls[platform];
    if (url) window.open(url, "_blank");
    setIsShareMenuOpen(false);
  };

  const globalShare = () => {
    if (!referralLink) return;
    if (navigator.share) {
      navigator
        .share({ title: "Referral Link", text: "Join me on the platform", url: referralLink })
        .catch(() => {});
    } else {
      setIsShareMenuOpen(true);
    }
  };

  // --- UI building blocks --------------------------------------------------
  const TabButton = ({ label, isActive, onClick, icon: Icon }) => (
    <button
      className={clsx(
        "relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-sm flex items-center gap-2 overflow-hidden",
        isActive
          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25"
          : "text-gray-400 hover:text-white hover:bg-gray-800/50"
      )}
      onClick={onClick}
    >
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 opacity-20 animate-pulse" />
      )}
      <Icon size={16} />
      <span className="relative z-10">{label}</span>
    </button>
  );

  const AnimatedNumber = ({ value, prefix = "", suffix = "" }) => {
    const [displayValue, setDisplayValue] = useState(0);
    useEffect(() => {
      if (isVisible) {
        const t = setTimeout(() => setDisplayValue(value), 300);
        return () => clearTimeout(t);
      }
    }, [isVisible, value]);

    return (
      <span className="font-bold text-2xl bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
        {prefix}
        {Number(displayValue).toLocaleString()}
        {suffix}
      </span>
    );
  };

  const FloatingCryptoIcon = ({ Icon, delay = 0, duration = 4 }) => (
    <div
      className="absolute text-orange-500/10 animate-float"
      style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
    >
      <Icon size={32} />
    </div>
  );

  const GlowingCard = ({ children, className = "", glowColor = "orange" }) => (
    <div className={clsx("relative group", className, "mb-20")}>
      <div
        className={clsx(
          "absolute -inset-1 rounded-xl blur opacity-0 group-hover:opacity-25 transition duration-500 bg-gradient-to-r",
          glowVariants[glowColor] || glowVariants.orange,
          "to-amber-500"
        )}
      />
      <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6 transition-all duration-300 hover:border-gray-700">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800
 relative overflow-hidden">

      <AnimatedGrid />
            <FloatingParticles/>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingCryptoIcon Icon={Bitcoin} delay={0} />
        <FloatingCryptoIcon Icon={Coins} delay={1} />
        <FloatingCryptoIcon Icon={DollarSign} delay={2} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 container mx-auto p-6 lg:p-8">
        {/* Header */}
        <div
          className={clsx(
            "text-center mb-12 transition-all duration-1000 transform",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 px-4 py-2 rounded-full text-orange-400 text-sm font-medium mb-4 border border-orange-500/30">
            <Zap size={16} className="animate-pulse" />
            Crypto Trading Affiliate Program
          </div>

             <motion.div  className="text-center mb-4 ">
            <ModernHeading text="Withdraw Funds" />
          </motion.div>
          <p className="text-gray-400 text-lg text-center">Secure and instant withdrawals to your preferred method</p>



          <h1 className="text-4xl lg:text-6xl font-bold mb-4">
            Turn Your Network Into{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent animate-pulse">
              Crypto Profits
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Earn unlimited commission on every trade. Simple, transparent, instant payouts.
          </p>
        </div>

        {/* If no affiliate yet: CTA */}
        {!affiliateId && (
          <div className="max-w-xl mx-auto text-center mb-10">
            <p className="text-gray-300 mb-4">Create your affiliate ID to start sharing and earning.</p>
            <button
              disabled={creating || !loggedUser?._id}
              onClick={createAffiliate}
              className={clsx(
                "px-6 py-3 rounded-xl inline-flex items-center gap-2",
                "bg-gradient-to-r from-orange-500 to-amber-500 text-white",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              {creating ? <Loader2 className="animate-spin" size={18} /> : <Users size={18} />}
              {creating ? "Creating..." : "Generate Affiliate ID"}
            </button>
          </div>
        )}

        {/* Stats Dashboard */}
        <div
          className={clsx(
            "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 transition-all duration-1000 transform",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          {[
            { icon: Wallet, label: "Total Earnings", value: stats.totalEarnings, prefix: "$" },
            { icon: Users, label: "Active Referrals", value: stats.activeReferrals },
            { icon: TrendingUp, label: "Total Referrals", value: stats.totalReferrals },
            { icon: Coins, label: "Monthly Commission", value: stats.monthlyCommission, prefix: "$" },
          ].map((stat, index) => (
            <GlowingCard key={index} className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl">
                  <stat.icon className="text-orange-400" size={24} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                <AnimatedNumber value={stat.value} prefix={stat.prefix || ""} />
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </GlowingCard>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <TabButton label="Overview" icon={BarChart3} isActive={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <TabButton label="Referral Link" icon={Share2} isActive={activeTab === "referral"} onClick={() => setActiveTab("referral")} />
          <TabButton label="Commission" icon={DollarSign} isActive={activeTab === "commission"} onClick={() => setActiveTab("commission")} />
        </div>

        {/* Error state */}
        {error && (
          <div className="max-w-3xl mx-auto mb-6 text-center text-red-400">{error}</div>
        )}

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Performance Chart Placeholder */}
              <GlowingCard>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="text-orange-400" size={20} />
                  Performance Analytics
                </h3>
                <div className="h-64 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="text-orange-400 mx-auto mb-2" size={48} />
                    <p className="text-gray-400">Chart will display your referral performance</p>
                  </div>
                </div>
              </GlowingCard>

              {/* Recent Activity */}
              <GlowingCard>
                <h3 className="text-xl font-semibold text-white mb-4">Recent Referral Activity</h3>
                <div className="space-y-3">
                  {(activity || []).slice(0, 6).map((a, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{String(a.user || "T").slice(0, 1)}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{a.user || "Trader"}</p>
                          <p className="text-gray-400 text-sm">{a.action || "Completed trade"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-semibold">{a.amount ? `+$${Number(a.amount).toFixed(2)}` : "+$0.00"}</p>
                        <p className="text-gray-400 text-sm">{new Date(a.at || Date.now()).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {!activity?.length && (
                    <div className="p-4 text-center text-gray-400 bg-gray-800/40 rounded-lg">No recent activity to show.</div>
                  )}
                </div>
              </GlowingCard>
            </div>
          )}

          {activeTab === "referral" && (
            <div className="grid lg:grid-cols-2 gap-8 mb-20">
              <div className="lg:order-2">
                <img
                  src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=400&fit=crop"
                  alt="Crypto Trading"
                  className="w-full h-64 lg:h-full object-cover rounded-xl"
                />
              </div>

              <GlowingCard className="lg:order-1">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Share2 className="text-orange-400" size={20} />
                  Your Referral Link
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Affiliate ID</label>
                    <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-lg px-4 py-2">
                      <span className="text-orange-400 font-mono font-semibold">{affiliateId || "—"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Referral Link</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={referralLink}
                        readOnly
                        placeholder="Generate your affiliate ID first"
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300 focus:outline-none focus:border-orange-500"
                      />
                      <button
                        onClick={copyToClipboard}
                        disabled={!referralLink}
                        className={clsx(
                          "px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2",
                          "text-white",
                          referralLink
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg"
                            : "bg-gray-700 cursor-not-allowed"
                        )}
                      >
                        {isCopied ? <Check size={16} /> : <Copy size={16} />}
                        {isCopied && <span className="text-sm">Copied!</span>}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        onClick={() => shareOn("twitter")}
                        disabled={!referralLink}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white hover:border-gray-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        <Globe size={16} /> Twitter
                      </button>
                      <button
                        onClick={() => shareOn("facebook")}
                        disabled={!referralLink}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white hover:border-gray-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        <Globe size={16} /> Facebook
                      </button>
                      <button
                        onClick={() => shareOn("whatsapp")}
                        disabled={!referralLink}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white hover:border-gray-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        <Globe size={16} /> WhatsApp
                      </button>
                      <button
                        onClick={() => shareOn("discord")}
                        disabled={!referralLink}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white hover:border-gray-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        <Globe size={16} /> Discord
                      </button>
                    </div>

                    <button
                      onClick={globalShare}
                      disabled={!referralLink}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white hover:border-gray-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <Globe size={16} /> Share via device menu
                    </button>

                    {isShareMenuOpen && (
                      <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg p-4 grid grid-cols-2 gap-2">
                        <button className="flex items-center gap-2 p-2 text-blue-400 hover:bg-gray-700 rounded">
                          <Globe size={16} /> Twitter
                        </button>
                        <button className="flex items-center gap-2 p-2 text-blue-600 hover:bg-gray-700 rounded">
                          <Globe size={16} /> Facebook
                        </button>
                        <button className="flex items-center gap-2 p-2 text-green-500 hover:bg-gray-700 rounded">
                          <Globe size={16} /> WhatsApp
                        </button>
                        <button className="flex items-center gap-2 p-2 text-purple-500 hover:bg-gray-700 rounded">
                          <Globe size={16} /> Discord
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <Star size={16} />
                      <span className="font-semibold">Pro Tip</span>
                    </div>
                    <p className="text-green-300 text-sm">
                      Share this link with traders to maximize your earning potential.
                    </p>
                  </div>
                </div>
              </GlowingCard>
            </div>
          )}

          {activeTab === "commission" && (
            <div className="space-y-8">
              <GlowingCard>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="text-orange-400" size={20} />
                  Commission Structure
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { tier: "Bronze", rate: "0.5%", trades: "1-100", color: "orange" },
                    { tier: "Silver", rate: "0.75%", trades: "101-500", color: "gray" },
                    { tier: "Gold", rate: "1%", trades: "500+", color: "yellow" },
                  ].map((t, index) => (
                    <div key={index} className={clsx("bg-gray-800/50 rounded-lg p-4 text-center border", tierStyles[t.color].ring)}>
                      <div className={clsx("w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center", tierStyles[t.color].chipBg)}>
                        <Shield className={clsx(tierStyles[t.color].chipText)} size={24} />
                      </div>
                      <h4 className="font-semibold text-white mb-2">{t.tier} Tier</h4>
                      <p className="text-2xl font-bold text-orange-400 mb-1">{t.rate}</p>
                      <p className="text-gray-400 text-sm">Per trade commission</p>
                      <p className="text-gray-500 text-xs mt-2">{t.trades} referral trades</p>
                    </div>
                  ))}
                </div>
              </GlowingCard>

              <GlowingCard>
                <h3 className="text-xl font-semibold text-white mb-4">Commission History</h3>
                <div className="space-y-3">
                  {(history || []).map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{day.date}</p>
                        <p className="text-gray-400 text-sm">{day.trades} trades</p>
                      </div>
                      <div className="text-green-400 font-semibold text-lg">+${Number(day.amount || 0).toFixed(2)}</div>
                    </div>
                  ))}
                  {!history?.length && (
                    <div className="p-4 text-center text-gray-400 bg-gray-800/40 rounded-lg">No history yet.</div>
                  )}
                </div>
              </GlowingCard>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(5deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
          75% { transform: translateY(-15px) rotate(3deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>

      {loading && (
        <div className="fixed bottom-4 right-4 bg-gray-900/90 border border-gray-700 text-white px-4 py-2 rounded-xl shadow">
          <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Loading...</span>
        </div>
      )}
    </div>
  );
};

export default CryptoReferralDashboard;
