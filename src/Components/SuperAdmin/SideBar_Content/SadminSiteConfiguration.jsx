// ✨ Super Admin Site Configuration - Premium UI
import { useState, useEffect } from "react";
import { Pencil, Check, X, Loader2, ExternalLink, Save, CheckCircle2 } from "lucide-react";
import backendApi from "../../../../backendApi";

const SadminSiteConfiguration = () => {
  const [details, setDetails] = useState({
    serverName: "",
    mt5Digit: "",
    websiteName: "",
    logo: "",
    favicon: "",
    inrUi: false,
    logoSize: 4,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const generalSettingsFields = [
    { name: "serverName", type: "text", placeholder: "Enter server name" },
    { name: "mt5Digit", type: "text", placeholder: "Enter MT5 digit" },
    { name: "websiteName", type: "text", placeholder: "Enter website name" },
    { name: "logoSize", type: "number", placeholder: "Logo size in rem" },
  ];

  const uiSettings = [
    { name: "inrUi", description: "Enable or disable INR UI" },
    { name: "bankDetailsUi", description: "Show bank details in account" },
    { name: "kycForWithdrawal", description: "Require KYC for withdrawal" },
    { name: "emailToAll", description: "Allow admin to email all users" },
    { name: "ibZone", description: "Enable/Disable IB panel" },
  ];

  const mediaAssets = [
    { name: "logo", type: "image", placeholder: "Logo URL", altText: "Logo" },
    { name: "favicon", type: "image", placeholder: "Favicon URL", altText: "Favicon" },
  ];

  const fetchData = async () => {
    try {
      const res = await backendApi.get("/api/auth/site-config");
      setDetails({ ...details, ...res.data.data });
    } catch (err) {
      console.error("❌ Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDetails((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await backendApi.put("/api/auth/site-config", details);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Save Error:", err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatLabel = (key) =>
    key
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-blue-900 to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-primary-800/50 backdrop-blur-xl border border-primary-700/50 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-500 hover:shadow-primary-500/20">
          <div>
            <h1 className="text-4xl text-white font-bold bg-gradient-to-r from-primary-200 to-primary-400 bg-clip-text text-transparent">
              Site Configuration
            </h1>
            <p className="text-gray-300/80 mt-1">Manage website core settings and appearance</p>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-5 py-2.5 bg-green-500/20 text-green-500 rounded-full flex items-center gap-2 shadow-lg transition-all duration-300 hover:px-6 ${
                    saving ? "opacity-70 cursor-not-allowed" : "hover:shadow-green-500/20"
                  }`}
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-gray-700/60 rounded-full flex items-center gap-2 hover:bg-gray-600/40"
                >
                  <X className="w-5 h-5" /> Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-blue-600/30 text-blue-500 rounded-full flex items-center gap-2 shadow-lg transition-all duration-300 hover:px-6 hover:shadow-blue-500/20"
              >
                <Pencil className="w-5 h-5" /> Edit Settings
              </button>
            )}
          </div>
        </div>

        {/* Save Success */}
        {saveSuccess && (
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-green-500/20 text-green-300 border border-green-500/40 animate-fade-in">
            <CheckCircle2 className="w-5 h-5" /> Changes saved successfully!
          </div>
        )}

        {/* Loader */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-primary-800/30 backdrop-blur-lg rounded-2xl border border-primary-700/30 animate-pulse">
            <Loader2 className="w-12 h-12 animate-spin text-primary-400" />
            <p className="mt-4 text-primary-300 font-medium">Loading configuration...</p>
          </div>
        ) : (
          <>
            {/* General Settings */}
            <Section title="General Settings">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generalSettingsFields.map((field) => (
                  <SettingCard
                    key={field.name}
                    field={field}
                    details={details}
                    isEditing={isEditing}
                    saving={saving}
                    handleChange={handleChange}
                    formatLabel={formatLabel}
                  />
                ))}
              </div>
            </Section>

            {/* UI Settings */}
            <Section title="UI Settings" subtitle="Configure user interface preferences">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uiSettings.map((setting) => (
                  <ToggleCard
                    key={setting.name}
                    setting={setting}
                    details={details}
                    isEditing={isEditing}
                    saving={saving}
                    handleChange={handleChange}
                    formatLabel={formatLabel}
                  />
                ))}
              </div>
            </Section>

            {/* Media Assets */}
            <Section title="Media Assets">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mediaAssets.map((asset) => (
                  <MediaCard
                    key={asset.name}
                    asset={asset}
                    details={details}
                    isEditing={isEditing}
                    saving={saving}
                    handleChange={handleChange}
                    formatLabel={formatLabel}
                  />
                ))}
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
};

/* ===== Reusable Subcomponents ===== */

const Section = ({ title, subtitle, children }) => (
  <div className="bg-primary-800/30 backdrop-blur-md rounded-2xl border border-primary-700/30 shadow-xl">
    <div className="p-6 border-b border-primary-700/50">
      <h2 className="text-xl font-semibold text-primary-200">{title}</h2>
      {subtitle && <p className="text-gray-300/80 text-sm mt-1">{subtitle}</p>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const SettingCard = ({ field, details, isEditing, saving, handleChange, formatLabel }) => (
  <div className="bg-primary-700/40 rounded-xl border border-primary-600/30 hover:border-primary-500/50 transition-all duration-300 overflow-hidden">
    <div className="px-5 py-4 bg-primary-700/20 border-b border-primary-600/20">
      <h3 className="text-sm font-medium text-primary-300">{formatLabel(field.name)}</h3>
    </div>
    <div className="p-5">
      {isEditing ? (
        <input
          type={field.type}
          name={field.name}
          value={details[field.name] || ""}
          onChange={handleChange}
          className="w-full bg-primary-800/60 text-white p-3 rounded-lg border border-primary-600/30 focus:border-primary-400 outline-none"
          disabled={saving}
          placeholder={field.placeholder || `Enter ${formatLabel(field.name)}`}
        />
      ) : (
        <div className="bg-primary-800/40 p-3 rounded-lg border border-primary-700/30 min-h-12 flex items-center">
          <span className="text-lg font-medium text-gray-300 break-words">
            {details[field.name] || <span className="text-primary-400/60 italic">Not Set</span>}
          </span>
        </div>
      )}
    </div>
  </div>
);

const ToggleCard = ({ setting, details, isEditing, saving, handleChange, formatLabel }) => (
  <div className="bg-primary-700/40 rounded-lg border border-primary-600/30 hover:border-primary-500/50 transition-all duration-300">
    <div className="flex items-center justify-between p-4">
      <div>
        <h3 className="text-sm font-medium text-primary-200">{formatLabel(setting.name)}</h3>
        <p className="text-xs text-gray-300 mt-1">{setting.description}</p>
      </div>
      {isEditing ? (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name={setting.name}
            checked={details[setting.name] || false}
            onChange={handleChange}
            className="sr-only peer"
            disabled={saving}
          />
          <div
            className={`w-11 h-6 bg-gray-700 rounded-full peer-checked:bg-green-500 transition-all duration-300`}
          >
            <div
              className={`absolute top-1 bg-white rounded-full transition-all duration-300 w-4 h-4 ${
                details[setting.name] ? "left-6" : "left-1"
              }`}
            ></div>
          </div>
        </label>
      ) : (
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            details[setting.name]
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {details[setting.name] ? "Enabled" : "Disabled"}
        </div>
      )}
    </div>
  </div>
);

const MediaCard = ({ asset, details, isEditing, saving, handleChange, formatLabel }) => (
  <div className="bg-primary-700/40 rounded-xl border border-primary-600/30 hover:border-primary-500/50 transition-all duration-300">
    <div className="px-5 py-4 bg-primary-700/20 border-b border-primary-600/20">
      <h3 className="text-sm font-medium text-primary-300">{formatLabel(asset.name)}</h3>
    </div>
    <div className="p-5">
      {isEditing ? (
        <>
          {details[asset.name] && (
            <div className="mb-4 flex items-center gap-4 bg-primary-800/60 p-4 rounded-lg border border-primary-600/30">
              <div className="w-32 h-20 flex items-center justify-center bg-primary-900/60 rounded-lg overflow-hidden">
                <img src={details[asset.name]} alt={asset.altText} className="max-w-full max-h-full object-contain" />
              </div>
              <a href={details[asset.name]} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm">
                <ExternalLink className="w-4 h-4 inline-block mr-1" /> View full size
              </a>
            </div>
          )}
          <input
            type="text"
            name={asset.name}
            value={details[asset.name] || ""}
            onChange={handleChange}
            placeholder={asset.placeholder}
            className="w-full bg-primary-800/60 text-white p-3 rounded-lg border border-primary-600/30 focus:border-primary-400"
            disabled={saving}
          />
        </>
      ) : details[asset.name] ? (
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="w-40 h-24 flex items-center justify-center bg-primary-900/60 rounded-lg p-2">
            <img src={details[asset.name]} alt={asset.altText} className="max-w-full max-h-full object-contain" />
          </div>
          <div>
            <p className="text-primary-400 text-sm break-all">{details[asset.name]}</p>
            <a
              href={details[asset.name]}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-sm"
            >
              <ExternalLink className="w-4 h-4" /> Open in new tab
            </a>
          </div>
        </div>
      ) : (
        <p className="text-primary-400/60 italic">No {formatLabel(asset.name)} Set</p>
      )}
    </div>
  </div>
);

export default SadminSiteConfiguration;
