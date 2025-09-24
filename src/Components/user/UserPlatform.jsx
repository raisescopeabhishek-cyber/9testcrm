import { useEffect } from "react";
import {
  Download,
  Monitor,
  Smartphone,
  AppleIcon,
  Shield,
  UserCheck,
  FileText,
  Server,
  Globe,
  BarChart2,
  CodeIcon,
  Layers,
  Zap,
  CreditCard,
  ArrowRight,
  Link2Icon,
  MoveUpRight,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import UseUserHook from "../../hooks/user/UseUserHook";
import ModernHeading from "../lib/ModernHeading";
import { FloatingParticles } from "../../utils/FloatingParticles";
import { AnimatedGrid } from "../../utils/AnimatedGrid";

const UserPlatform = () => {
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const siteConfig = useSelector((state) => state.user.siteConfig);

  const { getUpdateLoggedUser } = UseUserHook();

  useEffect(() => {
    getUpdateLoggedUser();
  }, []);

          //  <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 p-10 min-h-screen">
  // 

  return (
    <div className="  flex items-center justify-center  bg-gradient-to-br from-gray-900 via-black to-gray-900
 p-10 min-h-screen">
        <AnimatedGrid />

            <FloatingParticles/>
  
      {!loggedUser.kycVerified ? (
        <KYCVerificationSection />
      ) : (
        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid md:grid-cols-2 gap-8 ">
              <PlatformDownloadSection siteConfig={siteConfig} />
              <PlatformFeatureSection />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const KYCVerificationSection = () => (
  <div className="w-full mx-auto p-4">
    <div className="text-center mb-12">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-secondary-500-10 rounded-full">
          <Shield className="w-16 h-16 text-secondary-500" />
        </div>
      </div>
      <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary-500 to-white mb-4">
        Identity Verification
      </h2>
      <p className="text-gray-300 max-w-2xl mx-auto">
        Secure your account and unlock full platform access through our
        comprehensive KYC process.
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-8">
      {[
        {
          icon: FileText,
          title: "Document Preparation",
          description:
            "Gather government-issued ID, proof of address, and supporting documents",
        },
        {
          icon: UserCheck,
          title: "Information Submission",
          description:
            "Securely upload and verify your personal and financial information",
        },
        {
          icon: Shield,
          title: "Final Verification",
          description:
            "Our expert team reviews and validates your submitted documents",
        },
      ].map(({ icon: Icon, title, description, color, gradient }, index) => (
        <motion.div
          key={index}
          className={`
            rounded-2xl p-6 bg-secondary-800/20 hover:bg-secondary-800/30 transition-all shadow-md 
            relative overflow-hidden group
          `}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 }}
        >
          <div className="absolute bg-secondary-800 group-hover:opacity-20 transition-all"></div>
          <div className="relative z-10">
            <div className="p-3 bg-secondary-900/30 rounded-full inline-block mb-4">
              <Icon className="w-8 h-8 text-secondary-500" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-white">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>
        </motion.div>
      ))}
    </div>

    <div className="text-center mt-12">
      <Link to="/user/account-details">
        <motion.button
          className="
            bg-secondary-500
            text-white px-12 py-4 rounded-full 
            font-semibold shadow-2xl hover:shadow-secondary-500-50 
            transition-all group
          "
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="flex whitespace-nowrap text-xs md:text-md items-center justify-center gap-2">
            Start Verification
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </span>
        </motion.button>
      </Link>
    </div>
  </div>
);

const PlatformDownloadSection = ({ siteConfig }) => (
  <div className="space-y-6">
    <div className="py-2 mb-4">
        <ModernHeading text={"MetaTrader 5"}></ModernHeading>
      </div>
    <p className="text-gray-300">
      Unlock the power of professional trading with our advanced MetaTrader 5
      platform. Designed for traders who demand precision, speed, and
      comprehensive market insights.
    </p>

    {/* Highlights Section */}
    <div className="flex flex-wrap gap-y-2  space-x-4 mb-6">
      {[
        { icon: <BarChart2 />, text: "Advanced Analytics" },
        { icon: <Globe />, text: "Global Market Access" },
        { icon: <CodeIcon />, text: "Algorithmic Trading" },
      ].map((highlight, index) => (
        <div
          key={index}
          className="flex items-center space-x-2 bg-secondary-900/50 px-3 py-2 rounded-lg hover:bg-secondary-900/70 transition-all w-full sm:w-auto mb-4 sm:mb-0"
        >
          <div className="text-secondary-500">{highlight.icon}</div>
          <span className="text-white text-sm">{highlight.text}</span>
        </div>
      ))}
    </div>

    {/* Platform Download Section */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {[
        {
          icon: <Smartphone className="w-6 h-6 text-secondary-500" />,
          text: "Android",
          link: siteConfig?.androidDL,
          description: "Trade on the go with full platform capabilities",
        },
        {
          icon: <AppleIcon className="w-6 h-6 text-secondary-500" />,
          text: "iOS",
          link: siteConfig?.iosDL,
          description: "Seamless trading experience for Apple devices",
        },
        {
          icon: <Monitor className="w-6 h-6 text-secondary-500" />,
          text: "Windows",
          link: siteConfig?.windowsDL,
          description: "Full-featured desktop trading environment",
        },
      ].map((platform, index) => (
        <motion.a
          key={index}
          href={platform.link}
          target="_blank"
          className="group"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="bg-secondary-800/20 group transition-all hover:bg-secondary-800/50 rounded-xl p-4 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              {platform.icon}
              <span className="text-white text-sm font-semibold">
                {platform.text}
              </span>
            </div>
            <p className="text-xs text-gray-400 text-center">
              {platform.description}
            </p>
            <Download className="text-secondary-500 group-hover:animate-bounce transition-all" />
          </div>
        </motion.a>
      ))}
    </div>

    {/* Security Section */}
    <a target="_blank" href={siteConfig?.webLink || siteConfig?.androidDL}>
      <div className="bg-secondary-900/30 cursor-pointer group rounded-xl p-4 mt-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-white font-semibold">Web Link</h3>
          <ExternalLink className="text-secondary-500 group-hover:animate-bounce group-hover:ml-4 transition-all w-6 h-6" />
        </div>
        <p className="text-gray-400 text-sm mt-2">
          Trade seamlessly on our official website by clicking it and unlock a
          world of opportunities!
        </p>
      </div>
    </a>
    {/* web link */}
    <div className="bg-secondary-900/30 rounded-xl p-4 mt-4">
      <div className="flex items-center space-x-3">
        <Shield className="text-secondary-500 w-6 h-6" />
        <h3 className="text-white font-semibold">Secure & Compliant</h3>
      </div>
      <p className="text-gray-400 text-sm mt-2">
        Bank-grade encryption, regulatory compliance, and multi-factor
        authentication ensure your trading security.
      </p>
    </div>
  </div>
);

const PlatformFeatureSection = () => (
  <div className=" rounded-2xl p-6 space-y-6">
    <h3 className="text-2xl font-bold text-white">Why Choose Our Platform</h3>
    {[
      {
        icon: <Server />,
        title: "Robust Infrastructure",
        description: "99.9% uptime with low-latency global servers",
      },
      {
        icon: <Shield />,
        title: "Bank-Grade Security",
        description: "Multi-factor authentication and encryption",
      },
      {
        icon: <Layers />,
        title: "Multi-Asset Trading",
        description: "Trade forex, stocks, crypto from one platform",
      },
      {
        icon: <Zap />,
        title: "Lightning Fast Execution",
        description: "Millisecond trade execution speeds",
      },
      {
        icon: <CreditCard />,
        title: "Easy Deposits",
        description: "Multiple payment methods, instant processing",
      },
    ].map((feature, index) => (
      <motion.div
        key={index}
        className="flex items-center space-x-4 bg-secondary-900/60 p-4 rounded-xl hover:bg-secondary-800/20 transition-all"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <div className="p-3 bg-secondary-500-10 rounded-full text-secondary-500">
          {feature.icon}
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">{feature.title}</h4>
          <p className="text-gray-400 text-sm">{feature.description}</p>
        </div>
      </motion.div>
    ))}
  </div>
);

export default UserPlatform;
