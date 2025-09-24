import { useEffect, useState, useRef } from "react";
import {
  Copy,
  Check,
  Smile,
  Users,
  ArrowRight,
  ChartBar,
  Wallet,
  Gift,
  HandCoins,
  Share2Icon,
} from "lucide-react";
import { FaFacebookF, FaShareAlt, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import UseUserHook from "@/hooks/user/UseUserHook";
import toast from "react-hot-toast";
import useAutoUpdateLoggedUser from "../../hooks/user/UseAutoUpdateLoggedUser";
import { CFgenerateRandomNumber } from "../../utils/CustomFunctions";
import { backendApi, metaApi } from "../../utils/apiClients";
import UserIBcards from "./UserIBCards";




const UserReferal = () => {
  const [activeTab, setActiveTab] = useState("commission");
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const { getUpdateLoggedUser } = UseUserHook();
  const [isVisible, setIsVisible] = useState(false);
  const hasAnimatedRef = useRef(false); // Track if initial animation has run
  const currentUrl = window.location.href;
  const extractedUrl = new URL(currentUrl).origin;
  const [commissionsData, setCommissionsData] = useState([]);
  const siteConfig = useSelector((state) => state.user.siteConfig);
  // useAutoUpdateLoggedUser();

  const TabButton = ({ label, isActive, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 text-sm sm:text-base ${
        isActive
          ? "bg-secondary-500-50 text-white shadow-lg"
          : "text-white hover:bg-secondary-700/20"
      }`}
      onClick={onClick}
    >
      {label}
    </motion.button>
  );

  // generate IB account handler ------------
  const generateHandler = async () => {
    const randomNumber = CFgenerateRandomNumber(7);
    const toastId = toast.loading("Generating..");

    try {
      const updateLoggedUser = await backendApi.put(`/update-user`, {
        id: loggedUser._id,
        referralAccount: randomNumber,
      });

      toast.success("IB account created", { id: toastId });
      getUpdateLoggedUser();
    } catch (error) {
      console.log("error", error);
      toast.error(`Please Try again later. ${error?.response?.data?.code}`, {
        id: toastId,
      });
    }
  };

  // fetch all commissions data------------
  const fetchCommissions = async () => {
    try {
      const res = await backendApi.get(
        `/user-zone-ibs/${loggedUser?.referralAccount}`
      );
      setCommissionsData(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const ReferralsView = () => {
    const referralLink = `${extractedUrl}/user/signup/${loggedUser?.referralAccount}`;
    const [isCopied, setIsCopied] = useState(false);
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

    const copyToClipboard = () => {
      navigator.clipboard.writeText(referralLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    };

    const shareOnPlatform = (platform) => {
      const shareText = `Check out this awesome referral link! ${referralLink}`;
      const shareUrls = {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          referralLink
        )}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareText
        )}`,
        instagram: "https://www.instagram.com/",
      };

      if (platform !== "instagram") {
        window.open(shareUrls[platform], "_blank");
      }
      setIsShareMenuOpen(false);
    };

    const globalShare = () => {
      if (navigator.share) {
        navigator
          .share({
            title: "Referral Link",
            text: "Check out this awesome referral link!",
            url: referralLink,
          })
          .then(() => console.log("Shared successfully!"))
          .catch((error) => console.error("Error sharing:", error));
      } else {
        alert("Sharing is not supported on this browser.");
      }
    };

    return (
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 rounded-xl p-4 sm:p-6">
        <div className="w-full sm:w-1/2">
          <img
            src="/referral2.png"
            alt="Referral"
            className="w-full h-auto rounded-lg"
          />
        </div>

        <div className="w-full sm:w-1/2 space-y-4">
          <div className="rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3 ">
              Referral Link
            </h3>

            <div className="w-full  flex sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="w-full  bg-transparent text-gray-200 outline-none border-b border-gray-700 pb-1"
              />

              <motion.button
                onClick={copyToClipboard}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className=" sm:w-auto flex items-center justify-center text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isCopied ? <Check size={18} /> : <Copy size={18} />}
                {isCopied && (
                  <motion.span layout className="ml-2 text-sm">
                    Copied
                  </motion.span>
                )}
              </motion.button>
            </div>
          </div>

          <div className="relative">
            <motion.button
              onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex items-center justify-center bg-secondary-500-40 text-white px-4 py-2 rounded-lg hover:bg-secondary-500-50 transition-colors"
            >
              <Share2Icon size={18} className="mr-2" />
              Share Referral
            </motion.button>

            {isShareMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 bottom-full mb-2 w-full bg-black/80 rounded-lg shadow-lg p-3 flex justify-between"
              >
                <button
                  onClick={() => shareOnPlatform("whatsapp")}
                  className="hover:bg-secondary-500-50 p-2 rounded-full"
                >
                  <FaWhatsapp size={24} />
                </button>
                <button
                  onClick={() => shareOnPlatform("facebook")}
                  className="hover:bg-secondary-500-50 p-2 rounded-full"
                >
                  <FaFacebookF size={24} />
                </button>
                <button
                  onClick={() => shareOnPlatform("twitter")}
                  className="hover:bg-secondary-500-50 p-2 rounded-full"
                >
                  <FaXTwitter size={24} />
                </button>
                <button
                  onClick={globalShare}
                  className="hover:bg-secondary-500-50 p-2 rounded-full"
                >
                  <FaShareAlt size={24} />
                </button>
              </motion.div>
            )}
          </div>

          <p className="text-sm text-yellow-500 flex items-center">
            <Smile className="mr-2" size={16} />
            Share this link to invite friends and earn commissions.
          </p>
        </div>
      </div>
    );
  };

  const CommissionView = () => (
    <div className="space-y-4 sm:space-y-6">
      <UserIBcards commissionsData={commissionsData}></UserIBcards>
    </div>
  );

  // useEffect with proper dependency control
  useEffect(() => {
    // Only set isVisible once on mount
    if (!hasAnimatedRef.current) {
      setIsVisible(true);
      hasAnimatedRef.current = true;
    }

    getUpdateLoggedUser();
    fetchCommissions();
  }, []); // Empty dependency array for mount only

  // Separate useEffect for data updates that don't trigger animations
  useEffect(() => {
    if (loggedUser?.referralAccount && hasAnimatedRef.current) {
      fetchCommissions();
    }
  }, [loggedUser?.referralAccount]);

  return (
           <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 p-10 min-h-screen">

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className=" w-full mx-auto p-4 sm:p-8 rounded-xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-8 space-y-2 sm:space-y-0">
        {!loggedUser?.referralAccount ? (
          ""
        ) : (
          <div className="space-x-2 sm:space-x-4 flex">
            <TabButton
              label="Referral"
              isActive={activeTab === "referrals"}
              onClick={() => setActiveTab("referrals")}
            />
            <TabButton
              label="Affliate Dashboard"
              isActive={activeTab === "commission"}
              onClick={() => setActiveTab("commission")}
            />
          </div>
        )}
        {loggedUser?.referralAccount && (
          <div>
            <div className=" text-sm flex font-semibold gap-2">
              <HandCoins size={20} className="  text-yellow-500"></HandCoins>
              <p>Affiliate ID</p>
            </div>
            <div className=" bg-yellow-500/10 ml-4 shadow-2xl px-4 my-1 py-1 rounded-full text-center">
              <p className=" text-gray-200  font-semibold text-sm  md:text-md">
                {loggedUser?.referralAccount}
              </p>
            </div>
          </div>
        )}
      </div>
      {loggedUser?.referralAccount ? (
        <AnimatePresence mode="wait">
          {activeTab === "referrals" ? (
            <motion.div
              key="referrals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ReferralsView />
            </motion.div>
          ) : (
            <motion.div
              key="commission"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CommissionView />
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div className="p-4 md:mt-[-90px] mt-[-70px] rounded-2xl mb-8 w-full overflow-hidden">
          {/* Hero Section with Fade-in Animation - Only animates once */}
          <div
            className={`flex flex-col items-center text-center mb-12 transition-all duration-1000 transform ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-secondary-600/10 px-4 py-1 rounded-full text-sm font-medium text-secondary-500 mb-4 hover:bg-secondary-600/20 transition-colors">
              Earn unlimited IB commission
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Transform Your Network Into <br />
              <span className="text-secondary-500 inline-block hover:scale-105 transition-transform">
                Passive Income
              </span>
            </h2>
            <p className="text-gray-300 max-w-xl mb-6">
              Join our Affiliate program and earn unlimited commission for every
              trade. No complicated tiers, just straightforward earnings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button
                className="px-6 py-3 bg-secondary-500-90 hover:bg-secondary-500-80 rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={generateHandler}
              >
                <Users className="animate-pulse" size={20} />
                Generate Affiliate Account
              </button>
            </div>
          </div>

          {/* Stats Section with Stagger Animation - Only animates once */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { value: "Unlimited", label: "IB Commission" },
              { value: "24/7", label: "Instant Payouts" },
              { value: "100%", label: "Transparent Terms" },
              { value: "∞", label: "Unlimited Referrals" },
            ].map((stat, index) => (
              <div
                key={index}
                className={`bg-secondary-700/20 p-4 rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 transform hover:scale-105 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="text-2xl font-bold text-secondary-500">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features Grid with Hover Effects - Only animates once */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Gift,
                title: "Easy Registration",
                description:
                  "Generate your affiliate account instantly with one click. No lengthy forms or waiting periods.",
              },
              {
                icon: ChartBar,
                title: "Real-time Tracking",
                description:
                  "Monitor your referrals and earnings in real-time through our intuitive dashboard.",
              },
              {
                icon: Wallet,
                title: "Instant Payouts",
                description:
                  "Access your earnings immediately. No minimum threshold or waiting period.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`bg-secondary-700/10 p-6 rounded-xl shadow-sm group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="w-12 h-12 bg-secondary-700/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-secondary-600/20 transition-all duration-300 group-hover:scale-110">
                  <feature.icon className="w-6 h-6 text-secondary-500 transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Getting Started Section with Step Animation - Only animates once */}
          <div
            className={`bg-secondary-700/10 rounded-xl p-8 shadow-sm transition-all duration-1000 transform ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h3 className="text-xl font-semibold mb-6 text-center">
              Start Earning in 3 Simple Steps
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Generate Account",
                  description:
                    "Click the button to instantly create your affiliate account",
                },
                {
                  step: "2",
                  title: "Share Your Link",
                  description: "Invite traders using your unique referral link",
                },
                {
                  step: "3",
                  title: "Earn Commission",
                  description: "Get commission every trade",
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 group"
                  style={{ transitionDelay: `${index * 300}ms` }}
                >
                  <div className="w-8 h-8 bg-secondary-600/10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110">
                    <span className="text-secondary-500 font-medium">
                      {step.step}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">{step.title}</h4>
                    <p className="text-sm text-gray-300">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA with Pulse Animation - Only animates once */}
          <div
            className={`mt-12 text-center transition-all duration-1000 transform ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h3 className="text-2xl font-bold mb-4">
              Ready to Start Your affiliate Journey?
            </h3>
            <p className="text-gray-300 mb-6">
              Join our community of dedicated and successful affiliates.{" "}
            </p>
            <div>
              <button
                className="px-8 py-4 text-xs md:text-sm  bg-secondary-500-90 hover:bg-secondary-500-80 rounded-full flex items-center gap-2 mx-auto group transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={generateHandler}
              >
                <Users className="animate-pulse" size={20} />
                Generate affiliate Account
                <ArrowRight
                  className="transform transition-transform group-hover:translate-x-2"
                  size={20}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
    </div>
  );
};

export default UserReferal;
