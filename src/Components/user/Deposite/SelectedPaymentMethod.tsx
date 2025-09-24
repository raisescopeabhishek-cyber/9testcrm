import { BanknoteIcon, ClipboardIcon, EyeIcon, UploadIcon, XIcon } from "lucide-react";

export default function SelectedPaymentMethod(paymentProps) {

    console.log(paymentProps);
    

    const {
        selectedPayment,
         paymentDetails ,
          formatTextWithLinks ,
           copyText ,
            paymentImage,
            bankTransfers,
            handleFileChange,
            fileInputRef,
            file,
            togglePreview,
            previewUrl,
            handleInputChange,
            formData,
            handleRemoveFile
    } =  paymentProps;







  return (
    <div>



            {selectedPayment && selectedPayment !== "crypto" && (
              <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl animate-slide-in-up">
                  {paymentDetails && selectedPayment !== "Online Payment" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">Payment Details</h3>
                      <span className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 rounded-full text-sm font-medium border border-cyan-500/30">
                        {selectedPayment}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-900/60 rounded-xl border border-gray-600">
                          <div className="text-gray-300 text-sm leading-relaxed">
                            {formatTextWithLinks(paymentDetails)}
                          </div>
                          <button
                            onClick={() => copyText(paymentDetails)}
                            className="mt-3 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors transform hover:scale-105"
                          >
                            <ClipboardIcon />
                            <span className="text-sm">Copy Details</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <div className="p-4 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 rounded-xl border border-gray-600 text-center">
                          {paymentImage ? (
                            <>
                              <img
                                src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${paymentImage}`}
                                alt="Payment QR"
                                className="w-48 h-48 object-contain rounded-lg shadow-md mx-auto"
                              />
                              <a
                                href={`${import.meta.env.VITE_BACKEND_BASE_URL}/${paymentImage}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300 block mt-2 text-sm"
                              >
                                View QR
                              </a>
                            </>
                          ) : (
                            <>
                              <div className="w-48 h-48 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg flex items-center justify-center text-6xl">
                                📱
                              </div>
                              <p className="text-center text-cyan-400 mt-2 text-sm">QR Code</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

      
              </div>
            )}




                        {/* Upload + Txn */}
       {selectedPayment && selectedPayment !== "crypto" &&     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              {/* Upload */}
              <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 backdrop-blur-xl rounded-2xl border border-gray-700/50 animate-slide-in-up">
                <h4 className="text-lg font-semibold text-white mb-4">Upload Proof</h4>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-cyan-500 transition-colors group">
                  <div className="group-hover:scale-110 transition-transform">
                    <UploadIcon />
                  </div>
                  <span className="text-sm text-gray-400 mt-2 group-hover:text-cyan-400 transition-colors">
                    Click to upload image
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    accept="image/*"
                  />
                </label>

                {file && (
                  <div className="mt-4 flex items-center justify-between p-3 bg-gray-800/60 rounded-lg animate-slide-in-up">
                    <span className="text-sm text-gray-300 truncate">{file.name}</span>
                    <div className="flex gap-2">
                      {previewUrl && (
                        <button
                          onClick={togglePreview}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors transform hover:scale-110"
                        >
                          <EyeIcon />
                        </button>
                      )}
                      <button
                        onClick={handleRemoveFile}
                        className="text-red-400 hover:text-red-300 transition-colors transform hover:scale-110"
                      >
                        <XIcon />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Txn ID */}
              <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 backdrop-blur-xl rounded-2xl border border-gray-700/50 animate-slide-in-up">
                <h4 className="text-lg font-semibold text-white mb-4">Transaction ID</h4>
                <input
                  type="text"
                  name="transactionId"
                  placeholder="Enter transaction ID"
                  value={formData.transactionId}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900/80 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </div>}



















      





{/* 
            {selectedPayment && (
              <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl animate-slide-in-up">
                {paymentDetails && selectedPayment !== "Online Payment" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">Payment Details</h3>
                      <span className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 rounded-full text-sm font-medium border border-cyan-500/30">
                        {selectedPayment}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-900/60 rounded-xl border border-gray-600">
                          <div className="text-gray-300 text-sm leading-relaxed">
                            {formatTextWithLinks(paymentDetails)}
                          </div>
                          <button
                            onClick={() => copyText(paymentDetails)}
                            className="mt-3 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors transform hover:scale-105"
                          >
                            <ClipboardIcon />
                            <span className="text-sm">Copy Details</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <div className="p-4 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 rounded-xl border border-gray-600 text-center">
                          {paymentImage ? (
                            <>
                              <img
                                src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${paymentImage}`}
                                alt="Payment QR"
                                className="w-48 h-48 object-contain rounded-lg shadow-md mx-auto"
                              />
                              <a
                                href={`${import.meta.env.VITE_BACKEND_BASE_URL}/${paymentImage}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300 block mt-2 text-sm"
                              >
                                View QR
                              </a>
                            </>
                          ) : (
                            <>
                              <div className="w-48 h-48 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg flex items-center justify-center text-6xl">
                                📱
                              </div>
                              <p className="text-center text-cyan-400 mt-2 text-sm">QR Code</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayment === "Bank Transfer" && bankTransfers?.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bankTransfers.map((bank: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-6 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl border border-emerald-500/30 animate-slide-in-up"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <BanknoteIcon />
                          <h4 className="text-lg font-semibold text-white">Bank #{idx + 1}</h4>
                        </div>

                        <div className="space-y-3 text-sm">
                          {Object.entries(bank.bankTransfer || {}).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                              <span className="text-white font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedPayment === "Online Payment" && paymentDetails && (
                  <a
                    href={paymentDetails}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-lg hover:from-green-400 hover:to-green-500 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Pay Now
                  </a>
                )}
              </div>
            )} */}

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-left { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0);} }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0);} }
        @keyframes slide-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0);} }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1);} }
        @keyframes spin-slow { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-slide-in-left { animation: slide-in-left 0.6s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.6s ease-out; }
        .animate-slide-in-up { animation: slide-in-up 0.5s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
      `}</style>
    </div>
  );
}
