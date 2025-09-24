import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { CheckCircle, Mail, XCircle } from "lucide-react";
import { backendApi } from "../../utils/apiClients";
import ModernHeading from "../lib/ModernHeading";

const UserVerify = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);

  //   initial UI --------------

  const [cooldownTime, setCooldownTime] = useState(5);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    let timer;
    if (cooldownTime > 0 && isButtonDisabled) {
      timer = setTimeout(() => setCooldownTime(cooldownTime - 1), 1000);
    } else if (cooldownTime === 0 && isButtonDisabled) {
      setIsButtonDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [cooldownTime, isButtonDisabled]);

  const resendHandler = async () => {
    const toastId = toast.loading("Plese wait..");

    try {
      const res = await backendApi.get(`/get-user?id=${id}`);
      await backendApi.post(`/send-link`, {
        userId: id,
        email: res.data.data.email,
      });
      setCooldownTime(60);
      setIsButtonDisabled(true);
      toast.success(`Verification link sent to ${res.data.data.email}`, {
        id: toastId,
      });
    } catch (error) {
      console.log("error in fetching user--", error);
      toast.error("Something went wrong,Please try again later", {
        id: toastId,
      });
    }
  };

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const verifyRes = await backendApi.post(`/verify-link`, {
          userId: id,
          token: token,
        });
        setVerificationStatus("success");
        setTimeout(() => navigate("/user/login"), 5000); // Redirect to login after 5 seconds
      } catch (error) {
        setVerificationStatus("error");
        console.log("error while verifying--", error);
      } finally {
        setLoading(false);
      }
    };

    if (token !== "000") {
      verifyEmail();
    }
  }, []);

  if (token === "000") {
    return (
      <div className="flex items-center px-5 justify-center min-h-screen bg-gray-900">
        <Toaster></Toaster>
        <div className="max-w-md w-full bg-gray-800/80 shadow-lg rounded-lg overflow-hidden border border-gray-700">
          <div className="bg-secondary-800/30 p-4 flex items-center justify-center">
            <Mail className="text-secondary-500 w-12 h-12" />
          </div>
          <div className="p-6">
            <div className=" mb-4">
              <ModernHeading text={"Verify Your Email"}></ModernHeading>
            </div>
            <p className="text-gray-300 mb-6">
              We've sent a verification link to your email address. Please check
              your inbox and click the link to activate your account.
            </p>
            <div className="bg-green-700/20 border-l-4 border-green-500 p-4 mb-6">
              <p className="text-white font-medium">
                <CheckCircle className="inline-block w-5 h-5 mr-2" />
                Link sent successfully!
              </p>
            </div>
            <div className="space-y-4">
              <button
                className={`block w-full text-center ${
                  isButtonDisabled
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "border-secondary-500/90 border hover:border-[2px] hover:my-8  transition-all text-gray-100"
                } font-semibold py-2 px-4 rounded transition duration-300 ease-in-out`}
                onClick={resendHandler}
                disabled={isButtonDisabled}
              >
                {isButtonDisabled
                  ? `Resend in ${cooldownTime}s`
                  : "Resend Verification Email"}
              </button>
              <Link className="" to={"/user/login"}>
                <button className="bg-secondary-500-90 block w-full mt-5 hover:bg-secondary-500-70 text-gray-100 font-semibold py-2 px-4 rounded transition duration-300 ease-in-out">
                  Go to Login
                </button>
              </Link>
            </div>
          </div>
          <div className=" bg-gray-900/40 px-6 py-4">
            <p className="text-sm text-gray-400">
              Didn't receive the email? Check your spam folder or contact
              support .
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          <h2 className="mt-4 text-2xl text-white font-semibold">
            Verifying your email...
          </h2>
          <p className="mt-2 text-gray-300">This may take a few moments.</p>
        </div>
      );
    }

    if (verificationStatus === "success") {
      return (
        <div className="bg-green-100 border-l-4 border-green-500 p-4 sm:p-6 md:p-8 w-full max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center">
            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex-grow">
              <p className="text-sm sm:text-base font-medium text-green-800">
                Success! Your email has been successfully verified.
              </p>
              <p className="mt-2 text-sm sm:text-base text-green-700">
                You will be redirected to the login page in 5 seconds.
              </p>
              <button
                onClick={() => navigate("/user/login")}
                className="mt-4 w-full sm:w-auto bg-green-600 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out text-sm sm:text-base"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-red-100 border-l-4 border-red-500 p-4 sm:p-6 md:p-8 w-full max-w-2xl mx-auto">
        <Toaster />
        <div className="flex flex-col sm:flex-row items-start sm:items-center">
          <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
          <div className="flex-grow">
            <p className="text-sm sm:text-base font-medium text-red-800">
              Verification Failed
            </p>
            <p className="mt-2 text-sm sm:text-base text-red-700">
              The verification link may be invalid or expired. Please try again
              or contact support.
            </p>
            <button
              onClick={resendHandler}
              className="mt-4 w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out text-sm sm:text-base"
            >
              Resend Verification Email
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-secondary-900">
      <div className="max-w-md w-full p-8 bg-secondary-800/40 rounded-lg shadow-lg">
        <div className=" mb-8">
          <ModernHeading text={" Email Verification"}></ModernHeading>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default UserVerify;
