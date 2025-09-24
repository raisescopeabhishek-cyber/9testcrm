// src/utils/authService.js
import axios from "axios";
import { backendApi } from "../../utils/apiClients";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const API_KEY = import.meta.env.VITE_API_KEY;

// const API_URL = "http://localhost:3000/api";

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/admin/login`,
      { email, password },
      {
        headers: {
          "x-api-key": API_KEY, // Replace with your actual API key
        },
      }
    );
    console.log(response);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const fetchUserNotifications = async (userId) => {
  if (!userId) return [];

  try {
    const { data } = await backendApi.get(`/get-all-notification/${userId}`);
    if (data.success) return data.data;
    return [];
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return [];
  }
};


export const markNotificationRead = async (noteId) => {
  try {
    await backendApi.put(`/mark-notification-read/${noteId}`);
  } catch (err) {
    console.error("Error marking notification read:", err);
  }
};
