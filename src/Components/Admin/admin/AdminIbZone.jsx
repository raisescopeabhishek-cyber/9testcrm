import React, { useEffect, useState } from "react";
import { Edit2, Check, X } from "lucide-react";
import { backendApi } from "../../../utils/apiClients";
import { data } from "autoprefixer";
import toast from "react-hot-toast";

const AdminIbZone = () => {
  const [formData, setFormData] = useState([
    { level: 1, id: "", levelBonus: "" },
    { level: 2, id: "", levelBonus: "" },
    { level: 3, id: "", levelBonus: "" },
    { level: 4, id: "", levelBonus: "" },
    { level: 5, id: "", levelBonus: "" },
    { level: 6, id: "", levelBonus: "" },
    { level: 7, id: "", levelBonus: "" },
    { level: 8, id: "", levelBonus: "" },
    { level: 9, id: "", levelBonus: "" },
    { level: 10, id: "", levelBonus: "" },
  ]);

  const [editingIndex, setEditingIndex] = useState(-1);
  const [accountsTypes, setAccountsTypes] = useState([]);
  const [iBs, setIbs] = useState([]);
  const [currentAccount, setCurrentAccount] = useState("");

  const resetFormData = () => {
    setFormData([
      { level: 1, id: "", levelBonus: "" },
      { level: 2, id: "", levelBonus: "" },
      { level: 3, id: "", levelBonus: "" },
      { level: 4, id: "", levelBonus: "" },
      { level: 5, id: "", levelBonus: "" },
      { level: 6, id: "", levelBonus: "" },
      { level: 7, id: "", levelBonus: "" },
      { level: 8, id: "", levelBonus: "" },
      { level: 9, id: "", levelBonus: "" },
      { level: 10, id: "", levelBonus: "" },
    ]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedFormData = [...formData];
    updatedFormData[index][field] = Number(value);
    setFormData(updatedFormData);
  };

  const fetchAccountTypes = async () => {
    try {
      const res = await backendApi.get(`/get-custom-groups`);
      setAccountsTypes(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchIbs = async () => {
    // Reset form data immediately to clear UI

    resetFormData();

    try {
      const res = await backendApi.get(`/admin-ibs`);
      const filteredRes = res.data.data.filter(
        (value) => value.accountTypeId === currentAccount?._id
      );

      if (filteredRes.length > 0) {
        const updatedFormData = Array.from({ length: 10 }, (_, index) => {
          const level = index + 1;
          const ibData = filteredRes.find(
            (ib) =>
              ib.level === level && ib.accountTypeId === currentAccount?._id
          );

          return {
            level,
            id: ibData ? ibData._id : "",
            levelBonus: ibData ? ibData.commission : "",
          };
        });

        setFormData(updatedFormData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const currentEditing = formData.find(
    (value) => value.level === editingIndex + 1
  );

  const handleEdit = (index) => {
    setEditingIndex(index);
  };

  const handleSave = async () => {
    setEditingIndex(-1);

    const toastId = toast.loading(`Please wait..`);
    if (currentEditing.levelBonus === 0) {
      toast.error("Level bonus can't be empty!!");
    }
    try {
      if (!currentEditing.id) {
        const res = await backendApi.post(`/add-admin-ib`, {
          accountType: currentAccount.customGroup,
          accountTypeId: currentAccount._id,
          level: currentEditing.level,
          commission: currentEditing.levelBonus,
        });
        toast.success(`Added Successfully`, { id: toastId });
        // console.log("add res", res.data);
      } else if (currentEditing.id) {
        const res = await backendApi.put(
          `/update-admin-ib/${currentEditing.id}`,
          {
            commission: currentEditing.levelBonus,
          }
        );
        toast.success(`Updated Successfully`, { id: toastId });
        // console.log("update res", res.data);
      }
      fetchIbs();
    } catch (error) {
      console.log(error);
      toast.success(`Added Successfully`, { id: toastId });
    }
  };

  const handleCancel = () => {
    setEditingIndex(-1);
    // Add your cancel logic here
  };

  // for fetching fetchAccountTypes----
  useEffect(() => {
    fetchAccountTypes();
  }, []);
  // for fetching fetchIbs ----
  useEffect(() => {
    fetchIbs();
  }, [currentAccount]);
  //   useEffect to set default currentAccount --
  useEffect(() => {
    setCurrentAccount(accountsTypes[0]);
  }, [accountsTypes]);
  return (
    <div className="bg-primary-800/820 flex items-center justify-center p-4">
      <div className="w-full bg-primary-700/60 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-primary-700 px-6 py-6 border-b border-gray-600 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-white tracking-wide">
            IB Configuration
          </h1>
          <div className=" text-xl my-2">
            {accountsTypes.length > 0 && (
              <select
                onChange={(e) => {
                  const selectedValue = accountsTypes?.find(
                    (value) => value?._id === e.target.value
                  );
                  setCurrentAccount(selectedValue);
                }}
                id="accountNumber"
                name="accountNumber"
                className="w-full border-none items-center   py-1  rounded-full border bg-secondary-500-10 px-2 outline-none font-semibold border-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 border-b"
              >
                <option
                  disabled
                  className=" border-none hover:bg-white outline-none bg-primary-700 text-gray-500"
                  value=""
                >
                  Select Account
                </option>
                {accountsTypes.map((value) => (
                  <option
                    key={value?._id}
                    className=" border-none outline-none bg-primary-700 text-gray-100"
                    value={value?._id}
                  >
                    {value?.customGroup}
                  </option>
                ))}
              </select>
            )}
          </div>{" "}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-600 text-gray-200">
                <th className="px-6 py-4 text-center w-4/12 font-medium">
                  Level
                </th>
                <th className="px-6 py-4 text-center w-4/12 font-medium">
                  Level Bonus/Lot
                </th>
                <th className="px-6 py-4 text-center w-3/12 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {formData.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-700/60 hover:bg-gray-700/30 transition-colors duration-200"
                >
                  <td className="px-6 text-center py-4">
                    <span className="text-white">{row.level}</span>
                  </td>
                  <td className="px-6 text-center py-4">
                    {editingIndex === index ? (
                      <input
                        type="number"
                        value={row.levelBonus}
                        onChange={(e) =>
                          handleInputChange(index, "levelBonus", e.target.value)
                        }
                        className="w-[40%] bg-gray-600/30 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-white">
                        {row.levelBonus || "⚠️ Not Added "}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editingIndex === index ? (
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={handleSave}
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-600 p-2 rounded-full transition-colors duration-200"
                        >
                          <Check size={20} />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-red-500/10 hover:bg-red-700/30 text-red-500 p-2 rounded-full transition-colors duration-200"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(index)}
                        className="bg-blue-600/10 hover:bg-blue-600/30 text-blue-500 hover:text-white rounded-full px-4 py-2 flex items-center justify-center mx-auto transition-colors duration-200"
                      >
                        <Edit2 size={16} className="mr-2" /> Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminIbZone;
