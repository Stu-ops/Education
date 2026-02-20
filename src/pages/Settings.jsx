import React, { useState } from "react";
import { Globe, Cpu, KeyRound, Save } from "lucide-react";

const Settings = () => {
  const [formData, setFormData] = useState({
    api_base: "",
    model_name: "",
    api_key: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8000/config/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage("Configuration saved successfully!");
        setFormData({
          api_base: "",
          model_name: "",
          api_key: "",
        });
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || "Failed to save configuration.");
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-md border border-orange-100 rounded-3xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          ⚙️ Settings
        </h1>
        <p className="text-center text-gray-500 mb-8 text-sm">
          Configure your AI model connection
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* API Base URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              API Base URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="url"
                name="api_base"
                value={formData.api_base}
                onChange={handleChange}
                required
                placeholder="https://api.openai.com/v1"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Model Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Model Name
            </label>
            <div className="relative">
              <Cpu className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                name="model_name"
                value={formData.model_name}
                onChange={handleChange}
                required
                placeholder="gpt-4o-mini or gemini/gemini-2.5-flash-lite"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 focus:outline-none transition"
              />
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              API Key
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                name="api_key"
                value={formData.api_key}
                onChange={handleChange}
                required
                placeholder="sk-..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            <Save size={18} />
            {isLoading ? "Saving..." : "Save Configuration"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div
            className={`mt-6 p-4 rounded-xl text-sm font-medium ${
              message.includes("successfully")
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;