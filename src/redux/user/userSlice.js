import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isSidebarOpen: false,
  openTrades: [],
  loggedUser: "",
  platforms: [],
  paymentMethods: [],
  totalFinalPnL: 0,
  siteConfig: "",
  accountsData: [],
  accountsStats: {},
  ibAccountsData: [],
  notification: [],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    handleToggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setOpenTrades: (state, action) => {
      state.openTrades = action.payload;
    },
    setLoggedUser: (state, action) => {
      state.loggedUser = action.payload;
    },
    setPlatforms: (state, action) => {
      state.platforms = action.payload;
    },
    setPaymentMethods: (state, action) => {
      state.paymentMethods = action.payload;
    },
    setTotalFinalPnL: (state, action) => {
      state.totalFinalPnL = action.payload;
    },
    setSiteConfig: (state, action) => {
      state.siteConfig = action.payload;
    },
    setAccountsData: (state, action) => {
      state.accountsData = action.payload;
    },
    setAccountStats: (state, action) => {
      state.accountsStats = action.payload;
    },
    setIbAccountsData: (state, action) => {
      state.ibAccountsData = action.payload;
    },

    setNotification: (state, action) => {
      state.notification = action.payload;
    },

    resetTheme: (state) => {
      if (state.siteConfig) {
        state.siteConfig.themeColor = null;
      }
    },
  },
});

export const {
  setNotification,
  handleToggleSidebar,
  setLoggedUser,
  setOpenTrades,
  setPlatforms,
  setPaymentMethods,
  setTotalFinalPnL,
  setSiteConfig,
  setAccountsData,
  setAccountStats,
  setIbAccountsData,
  resetTheme,
} = userSlice.actions;

export default userSlice.reducer;
