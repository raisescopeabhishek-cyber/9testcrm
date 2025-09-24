import React, { useEffect, useState } from "react";
import {
  Trash2,
  Plus,
  Eye,
  Upload,
  X,
  XCircle,
  CreditCard,
  Landmark,
} from "lucide-react";
import { Switch } from "../ui/Switch";
import axios from "axios";
import toast from "react-hot-toast";
import { backendApi } from "../../../utils/apiClients";

export default function MethodConfiguration() {
  const [arrayData, setArrayData] = useState([]);
  const [bankData, setBankData] = useState([]);
  const [newField, setNewField] = useState({
    name: "",
    details: "",
    image: null,
    status: "active",
  });
  const [newBankField, setNewBankField] = useState({
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    ifscCode: "",
    branchName: "",
    status: "active",
    name: "Bank Transfer",
  });
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [popupImageUrl, setPopupImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState("payment-methods");

  // Payment Method Functions
  const addField = async () => {
    const toastId = toast.loading("Please wait...");
    if (newField.name && newField.details) {
      try {
        const formData = new FormData();
        formData.append("name", newField.name);
        formData.append("details", newField.details);
        formData.append("status", newField.status);
        formData.append("image", newField.image);

        const res = await backendApi.post(`/add-payment-method`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res.data.status) {
          setArrayData([...arrayData, res.data.data]);
          toast.success("Method added", { id: toastId });
          setNewField({ name: "", details: "", image: null, status: "active" });
        } else {
          toast.error(res.data.msg || "Failed to add method", { id: toastId });
        }
      } catch (error) {
        toast.error("Something went wrong", { id: toastId });
        console.log("error in add payment method", error);
      }
    } else {
      toast.error("Please fill all fields and upload an image", {
        id: toastId,
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewField({ ...newField, image: file });
    }
  };

  const toggleActive = async (id, currentStatus) => {
    const toastId = toast.loading("Updating status...");
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await backendApi.put(`/update-payment-method`, {
        id: id,
        status: newStatus,
      });

      if (res.data.status) {
        setArrayData(
          arrayData.map((platform) =>
            platform._id === id ? { ...platform, status: newStatus } : platform
          )
        );
        toast.success("Status updated", { id: toastId });
      } else {
        toast.error(res.data.msg || "Failed to update Method status", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Error in payment method toggleActive:", error);
      toast.error("Something went wrong !!", { id: toastId });
    }
  };

  const deletePlatform = async (id) => {
    const toastId = toast.loading("Please wait...");
    try {
      const res = await backendApi.delete(`/delete-payment-method/?id=${id}`);

      if (res.data.status) {
        setArrayData(arrayData.filter((platform) => platform._id !== id));
        toast.success("Method deleted successfully", { id: toastId });
      } else {
        toast.error(res.data.msg || "Failed to delete method", {
          id: toastId,
        });
      }
    } catch (error) {
      console.log("error in delete method", error);
      toast.error("Something went wrong", { id: toastId });
    }
  };

  const getAllPlatforms = async () => {
    try {
      const res = await backendApi.get(`/get-payment-methods`);
      const filterNotBankData = res.data.data.filter(
        (value) => value.name !== "Bank Transfer"
      );
      setArrayData(filterNotBankData);
    } catch (error) {
      console.log("error in getAllPlatform", error);
    }
  };

  const handleViewImage = (imageUrl) => {
    setPopupImageUrl(imageUrl);
    setShowImagePopup(true);
  };

  // Bank Transfer Functions
  const addBankDetails = async () => {
    const toastId = toast.loading("Adding bank details...");
    if (
      newBankField.bankName &&
      newBankField.accountNumber &&
      newBankField.accountHolderName &&
      newBankField.ifscCode
    ) {
      try {
        const res = await backendApi.post(`/add-payment-method`, newBankField);

        if (res.data.status) {

          setBankData([...bankData, res.data.data]);
          toast.success("Bank details added", { id: toastId });
          setNewBankField({
            bankName: "",
            accountNumber: "",
            accountHolderName: "",
            ifscCode: "",
            branchName: "",
            status:  "active",
            name:  "Bank Transfer" ,
          });


        } else {
          toast.error(res.data.msg || "Failed to add bank details", {
            id: toastId,
          });
        }
      } catch (error) {
        toast.error("Something went wrong", { id: toastId });
        console.log("error in add bank details", error);
      }
    } else {
      toast.error("Please fill all required fields", {
        id: toastId,
      });
    }
  };

  const toggleBankActive = async (id, currentStatus) => {
    const toastId = toast.loading("Updating status...");
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await backendApi.put(`/update-payment-method`, {
        id: id,
        status: newStatus,
      });

      if (res.data.status) {
        setBankData(
          bankData.map((bank) =>
            bank._id === id ? { ...bank, status: newStatus } : bank
          )
        );
        toast.success("Status updated", { id: toastId });
      } else {
        toast.error(res.data.msg || "Failed to update bank status", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Error in bank toggleActive:", error);
      toast.error("Something went wrong !!", { id: toastId });
    }
  };

  const deleteBank = async (id) => {
    const toastId = toast.loading("Please wait...");
    try {
      const res = await backendApi.delete(`/delete-payment-method/?id=${id}`);

      if (res.data.status) {
        setBankData(bankData.filter((bank) => bank._id !== id));
        toast.success("Bank details deleted successfully", { id: toastId });
      } else {
        toast.error(res.data.msg || "Failed to delete bank details", {
          id: toastId,
        });
      }
    } catch (error) {
      console.log("error in delete bank details", error);
      toast.error("Something went wrong", { id: toastId });
    }
  };

  const getAllBankDetails = async () => {
    try {
      const res = await backendApi.get(`/get-payment-methods`);
      const filterBankData = res.data.data.filter(
        (value) => value.name === "Bank Transfer"
      );
      setBankData(filterBankData);
    } catch (error) {
      console.log("error in getAllBankDetails", error);
    }
  };

  useEffect(() => {
    getAllPlatforms();
    getAllBankDetails();
  }, [activeTab]);

  const isAddButtonDisabled = !newField.name || !newField.details;
  const isBankAddButtonDisabled =
    !newBankField.bankName ||
    !newBankField.accountNumber ||
    !newBankField.accountHolderName ||
    !newBankField.ifscCode;

  return (
    <div className="w-full mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-3xl font-bold mb-6 text-white">Payment Methods</h2>

      {/* Custom Tabs */}
      <div className="flex mb-6 bg-primary-800 rounded-lg overflow-hidden">
        <button
          className={`flex items-center justify-center px-6 py-3 ${
            activeTab === "payment-methods"
              ? "bg-primary-400 text-white"
              : "text-gray-300 hover:bg-primary-700"
          } transition-colors duration-200 ease-in-out w-1/2`}
          onClick={() => setActiveTab("payment-methods")}
        >
          <CreditCard size={18} className="mr-2" />
          Payment Methods
        </button>
        <button
          className={`flex items-center justify-center px-6 py-3 ${
            activeTab === "bank-transfer"
              ? "bg-primary-400 text-white"
              : "text-gray-300 hover:bg-primary-700"
          } transition-colors duration-200 ease-in-out w-1/2`}
          onClick={() => setActiveTab("bank-transfer")}
        >
          <Landmark size={18} className="mr-2" />
          Bank Transfer
        </button>
      </div>

      {/* Payment Methods Tab Content */}
      {activeTab === "payment-methods" && (
        <>
          {/* Form Section */}
          <div className="bg-primary-700 overflow-hidden text-white rounded-lg shadow-lg p-6">
            <div className="flex flex-wrap sm:flex-nowrap space-y-4 sm:space-y-0 sm:space-x-4">
              <input
                type="text"
                placeholder="Name (display name)"
                value={newField.name}
                onChange={(e) =>
                  setNewField({ ...newField, name: e.target.value })
                }
                className="w-full sm:flex-1 px-4 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Details"
                value={newField.details}
                onChange={(e) =>
                  setNewField({ ...newField, details: e.target.value })
                }
                className="w-full sm:flex-1 px-4 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="relative w-full sm:w-auto">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center w-full px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition-colors duration-300"
                >
                  <Upload size={18} className="mr-2" />
                  Upload Image
                </label>
              </div>
              {newField.image && (
                <button
                  onClick={() =>
                    handleViewImage(URL.createObjectURL(newField.image))
                  }
                  className="py-2 text-green-500 rounded-md hover:scale-110 transition-all duration-300"
                >
                  <Eye size={22} />
                </button>
              )}
              <button
                onClick={addField}
                disabled={isAddButtonDisabled}
                className={`w-full sm:w-auto px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isAddButtonDisabled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                <Plus size={18} className="mx-auto" />
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-primary-800 mt-5 rounded-lg shadow-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-primary-400 text-white">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    S.No.
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-primary-700 divide-y divide-gray-400">
                {arrayData?.map((platform, index) => (
                  <tr key={platform?._id}>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {index + 1}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm ">
                      {platform?.name}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm ">
                      {platform?.details}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm ">
                      <Switch
                        checked={platform?.status === "active"}
                        onCheckedChange={() =>
                          toggleActive(platform?._id, platform?.status)
                        }
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() =>
                            handleViewImage(
                              import.meta.env.VITE_BACKEND_BASE_URL +
                                "/" +
                                platform?.image
                            )
                          }
                          className="text-blue-500 hover:text-blue-700 hover:scale-110 transition-all"
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          onClick={() => deletePlatform(platform?._id)}
                          className="text-red-600 hover:text-red-800 hover:scale-110 transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Bank Transfer Tab Content */}
      {activeTab === "bank-transfer" && (
        <>
          {/* Bank Form Section */}
          <div className="bg-primary-700 overflow-hidden text-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Bank Name *"
                value={newBankField.bankName}
                onChange={(e) =>
                  setNewBankField({ ...newBankField, bankName: e.target.value })
                }
                className="w-full px-4 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Account Number *"
                value={newBankField.accountNumber}
                onChange={(e) =>
                  setNewBankField({
                    ...newBankField,
                    accountNumber: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Account Holder Name *"
                value={newBankField.accountHolderName}
                onChange={(e) =>
                  setNewBankField({
                    ...newBankField,
                    accountHolderName: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="IFSC Code *"
                value={newBankField.ifscCode}
                onChange={(e) =>
                  setNewBankField({ ...newBankField, ifscCode: e.target.value })
                }
                className="w-full px-4 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addBankDetails}
                disabled={isBankAddButtonDisabled}
                className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center ${
                  isBankAddButtonDisabled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                <Plus size={18} className="mr-2" />
                Add Bank Details
              </button>
            </div>
          </div>

          {/* Bank Table Section */}
          <div className="bg-primary-800 mt-5 rounded-lg shadow-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-primary-400 text-white">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    S.No.
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Bank Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Account Number
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Account Holder
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    IFSC Code
                  </th>

                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-primary-700 divide-y divide-gray-400">
                {bankData?.map((bank, index) => (
                  <tr key={bank?._id}>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {index + 1}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                      {bank?.bankTransfer?.bankName}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                      {bank?.bankTransfer?.accountNumber}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                      {bank?.bankTransfer?.accountHolderName}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                      {bank?.bankTransfer?.ifscCode}
                    </td>

                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                      <Switch
                        checked={bank?.status === "active"}
                        onCheckedChange={() =>
                          toggleBankActive(bank?._id, bank?.status)
                        }
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteBank(bank?._id)}
                        className="text-red-600 hover:text-red-800 hover:scale-110 transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Image Popup */}
      {showImagePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative bg-primary-800/90 rounded-lg p-4">
            <button
              onClick={() => setShowImagePopup(false)}
              className="absolute top-2 right-2 text-red-600 hover:text-red-800"
            >
              <XCircle size={30} />
            </button>
            <div className="max-w-xl flex justify-center items-center">
              <img
                src={popupImageUrl}
                alt="Popup"
                className="w-[70%] h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
