import {
  setLoggedUser,
  setOpenTrades,
  setPaymentMethods,
  setPlatforms,
  setTotalFinalPnL,
} from "@/redux/user/userSlice";
import { backendApi } from "@/utils/apiClients";
import { useDispatch, useSelector } from "react-redux";
import { useRef, useEffect } from "react";

export default function UseUserHook() {
  const dispatch = useDispatch();
  const loggedUser = useSelector((store) => store.user.loggedUser);
  // const accounts = loggedUser?.accounts?.map((value) => +value.accountNumber);

  const ws = useRef(null);
  const isConnected = useRef(false);
  // const URL = "wss://socket.infoapi.biz/ws/get-user-by-accounts/";

  // 🔁 Updates user from DB
  const getUpdateLoggedUser = async () => {
    try {
      console.log(loggedUser._id);
      
      const res = await backendApi.get(`/get-user?id=${loggedUser._id}`);
      dispatch(setLoggedUser(res.data.data));
    } catch (error) {
      console.log("error in update loggedUser hook", error);
    }
  };

  // 🔁 Resets user-related state
  const getReset = () => {
    dispatch(setLoggedUser(""));
    dispatch(setOpenTrades([]));
    dispatch(setPlatforms([]));
    dispatch(setPaymentMethods([]));
    ws.current?.close();
    isConnected.current = false;
  };

  // 🔌 Manual call to connect socket
  // const connectWebSocket = () => {
  //   if (!accounts.length || isConnected.current) return;

  //   ws.current = new WebSocket(URL);

  //   ws.current.onopen = () => {
  //     isConnected.current = true;
  //     ws.current.send(
  //       JSON.stringify({
  //         action: "subscribe",
  //         Manager_Index: import.meta.env.VITE_MANAGER_INDEX,
  //         MT5Accounts: accounts,
  //         db: "api",
  //       })
  //     );
  //   };

  //   ws.current.onmessage = (event) => {
  //     try {
  //       const res = JSON.parse(event.data);
  //       // console.log("res socket hook", res);
  //       if (Array.isArray(res.data.users)) {
  //         const totalEquity = res?.data?.users?.reduce(
  //           (sum, user) => sum + (user.Equity || 0),
  //           0
  //         );
  //         // console.log("totalEquity", totalEquity);
  //         dispatch(setTotalFinalPnL(totalEquity));
  //       }
  //     } catch (err) {
  //       console.error("Invalid socket data:", event.data);
  //     }
  //   };

  //   ws.current.onerror = (err) => {
  //     console.error("WebSocket error:", err);
  //   };
  // };

  // Clean up WebSocket on component unmount
  // useEffect(() => {
  //   return () => {
  //     if (ws.current) {
  //       ws.current.close(); // close WebSocket connection on unmount
  //       isConnected.current = false;
  //     }
  //   };
  // }, []); // Empty dependency array to only run cleanup when the component unmounts

  return {
    getUpdateLoggedUser,
    getReset,
    // connectWebSocket, // only this needs to be called manually with accounts
  };
}
