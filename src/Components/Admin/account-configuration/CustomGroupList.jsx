import React, { useEffect, useState } from "react";
import { Trash2, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { backendApi } from "../../../utils/apiClients";

export default function CustomGroupList({ refresh, setRefresh }) {
  const [customGroups, setCustomGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await backendApi.get(`/get-custom-groups`);
      setCustomGroups(res.data.data);
    } catch (error) {
      console.log("Error in custom list group", error);
      toast.error("Failed to fetch groups");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHandler = async (id, groupName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the custom group "${groupName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await backendApi.delete(`/delete-custom-group?id=${id}`);
      setRefresh(!refresh);
      toast.success("Group deleted successfully");
    } catch (error) {
      console.log("Error in custom list group", error);
      toast.error("Failed to delete group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Existing Groups</h1>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 transition-all"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      )}

      {!isLoading && (
        <>
          {/* Mobile View - Card Layout */}
          <div className="block sm:hidden space-y-4">
            {customGroups?.map((value, index) => (
              <div
                key={index}
                className="bg-primary-800 rounded-xl p-4 text-white border border-primary-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-200">
                    #{index + 1}
                  </span>
                  <button
                    onClick={() => deleteHandler(value._id, value.customGroup)}
                    disabled={isLoading}
                    className="p-1 text-red-500 hover:text-red-600 focus:outline-none disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-sm">API Group</label>
                    <div className="font-medium text-gray-100">
                      {value?.apiGroup}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">
                      Custom Group
                    </label>
                    <div className="font-medium text-gray-100">
                      {value?.customGroup}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tablet/Desktop View - Table Layout */}
          <div className="hidden sm:block overflow-x-auto bg-primary-800 rounded-xl shadow-lg">
            <table className="min-w-full divide-y divide-primary-700">
              <thead className="bg-primary-600">
                <tr>
                  <th className="py-3 px-6 text-center text-sm font-medium text-gray-100 uppercase tracking-wider">
                    Sr. No.
                  </th>
                  <th className="py-3 px-6 text-center text-sm font-medium text-gray-100 uppercase tracking-wider">
                    API Group
                  </th>
                  <th className="py-3 px-6 text-center text-sm font-medium text-gray-100 uppercase tracking-wider">
                    Custom Group
                  </th>
                  <th className="py-3 px-6 text-center text-sm font-medium text-gray-100 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-700">
                {customGroups?.map((value, index) => (
                  <tr
                    key={index}
                    className="text-white hover:bg-primary-700/50 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm text-center text-gray-200">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6 text-sm text-center text-gray-200">
                      {value?.apiGroup}
                    </td>
                    <td className="py-4 px-6 text-sm text-center text-gray-200">
                      {value?.customGroup}
                    </td>
                    <td className="py-4 px-6 text-sm text-center">
                      <button
                        onClick={() =>
                          deleteHandler(value._id, value.customGroup)
                        }
                        disabled={isLoading}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-primary-800 disabled:opacity-50 transition-all"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {customGroups?.length === 0 && (
            <div className="text-center py-8 text-gray-400 bg-primary-800 rounded-xl shadow-lg">
              No custom groups found
            </div>
          )}
        </>
      )}
    </div>
  );
}
