import { useEffect, useState } from "react";
import { metaApi } from "@/utils/apiClients";

export function useGetMultipleIdInfo(accountIds = []) {
  const [dataMap, setDataMap] = useState({});

  useEffect(() => {
    if (!accountIds.length) return;

    let intervalId;

    const fetchData = async () => {
      const newMap = {};

      await Promise.all(
        accountIds.map(async (id) => {
          try {
            const res = await metaApi.get(
              `/GetUserInfo?Manager_Index=${
                import.meta.env.VITE_MANAGER_INDEX
              }&MT5Account=${id}`
            );

            if (res.data?.Equity) {
              newMap[id] = {
                balance: res.data?.Balance || 0,
                equity: res.data?.Equity || 0,
                pl: Number(res.data?.Equity - res.data?.Balance).toFixed(
                  2 || 0
                ),
              };
            } else {
              newMap[id] = null;
            }
          } catch (err) {
            newMap[id] = null;
          }
        })
      );

      setDataMap(newMap);
    };

    fetchData(); // initial
    intervalId = setInterval(fetchData, 2000); // poll every 3s

    return () => clearInterval(intervalId); // cleanup
  }, [accountIds.join(",")]);

  return dataMap;
}
