// hooks/user/useGetIdInfo.js
import { metaApi } from "@/utils/apiClients";
import { useEffect, useState } from "react";

export function useGetIdInfo(id) {
  const [info, setInfo] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    let intervalId;

    const fetchAccountInfo = async () => {
      setLoading(true);
      try {
        const res = await metaApi.get(
          `/GetUserInfo?Manager_Index=${
            import.meta.env.VITE_MANAGER_INDEX
          }&MT5Account=${id}`
        );
        if (res.data?.Equity) {
          setInfo(res.data);
        } else {
          setInfo({});
        }
      } catch (error) {
        console.error("Failed to fetch account info:", error);
        setInfo({});
      } finally {
        setLoading(false);
      }
    };

    fetchAccountInfo(); // Call immediately on mount

    intervalId = setInterval(fetchAccountInfo, 2000); // Then every 3 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount or id change
  }, [id]);

  return { info, loading };
}
