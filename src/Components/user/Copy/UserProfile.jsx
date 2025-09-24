import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Flag } from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import UseUserHook from "../../hooks/user/UseUserHook";
import { backendApi } from "../../utils/apiClients";
import ModernHeading from "../lib/ModernHeading";


const UserProfile = () => {
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const [formData, setFormData] = useState({
    firstName: loggedUser.firstName || "",
    lastName: loggedUser.lastName || "",
    email: loggedUser.email || "",
    mobileNumber: loggedUser.phone || "",
    address: loggedUser.address || "",
    state: loggedUser.state || "",
    zipCode: loggedUser.zipCode || "",
    city: loggedUser.city || "",
    country: loggedUser.country || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const { getUpdateLoggedUser } = UseUserHook();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastID = toast.loading("Updating..");
    try {
      const res = await backendApi.put(`/update-user`, {
        id: loggedUser._id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        state: formData.state,
        city: formData.city,
        zipCode: formData.zipCode,
      });
      setIsLoading(false);
      toast.success("Updated Successfully", { id: toastID });
      getUpdateLoggedUser();
    } catch (error) {
      setIsLoading(false);
      toast.error("Something went wrong", { id: toastID });
      console.error("Error updating user data:", error);
    }
  };

  return (
    <motion.div
      className="max-w-8xl mx-auto p-8 bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className=" mb-6">
        <ModernHeading text={"Update Profile"}></ModernHeading>
      </div>

      <motion.form
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              name: "firstName",
              label: "First Name",
              icon: <User />,
              required: true,
            },
            {
              name: "lastName",
              label: "Last Name",
              icon: <User />,
              required: true,
            },
            {
              name: "email",
              label: "E-mail Address",
              icon: <Mail />,
              readOnly: true,
            },
            {
              name: "mobileNumber",
              label: "Mobile Number",
              icon: <Phone />,
              readOnly: true,
            },
            { name: "address", label: "Address", icon: <MapPin /> },
            { name: "state", label: "State", icon: <MapPin /> },
            { name: "zipCode", label: "Zip Code", icon: <MapPin /> },
            { name: "city", label: "City", icon: <MapPin /> },
            {
              name: "country",
              label: "Country",
              icon: <Flag />,
              readOnly: true,
            },
          ].map((field, index) => (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {field.readOnly ? (
                <ReadOnlyField
                  label={field.label}
                  icon={field.icon}
                  value={formData[field.name]}
                />
              ) : (
                <InputField
                  label={field.label}
                  icon={field.icon}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  name={field.name}
                  required={field.required}
                />
              )}
            </motion.div>
          ))}
        </div>
        <div className=" flex justify-center items-center">
          <motion.button
            type="submit"
            className="bg-gradient-to-br from-indigo-950  via-blue-800 to-indigo-950 px-12 hover:px-16 transition-all bg-secondary-500-90  hover:bg-secondary-500-80 text-white py-3 rounded-full font-semibold"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );
};

const InputField = ({
  label,
  icon,
  value,
  onChange,
  name,
  required = false,
}) => (
  <motion.div
    className="relative"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <label className="block text-sm font-medium mb-1">
      {label}
      {required && "*"}
    </label>
    <div className="relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-300">
        {icon}
      </div>
      <input
        type="text"
        className=" bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950 block w-full pl-10 pr-3 py-3 rounded-md leading-5 bg-secondary-900/20 border-2 border-gray-700/80 outline-none sm:text-sm focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500"
        value={value}
        onChange={onChange}
        name={name}
        required={required}
      />
    </div>
  </motion.div>
);

const ReadOnlyField = ({ label, icon, value }) => (
  <motion.div
    className="relative"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <label className="block text-sm font-medium mb-1">{label}</label>
    <div className="relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none cursor-not-allowed text-gray-500">
        {icon}
      </div>
      <input
        type="text"
        className="bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950 block w-full pl-10 pr-3 cursor-not-allowed py-3 border-none outline-none rounded-md leading-5 bg-secondary-800/60 text-gray-400 sm:text-sm"
        value={value}
        readOnly
      />
    </div>
  </motion.div>
);

export default UserProfile;
