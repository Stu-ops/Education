// src/pages/Profile.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import Login from "./Login";
import { LogOut, Star, Edit, Save, Upload, X, Loader2, GraduationCap } from "lucide-react";
import LazyImage from "../components/LazyImage";

export default function Profile() {
  const { user, loading, logout, updateUser } = useUser();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const [animatedLevel, setAnimatedLevel] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (user) setForm(user);
  }, [user]);

  useEffect(() => {
    if (!user || hasAnimated.current) return;

    const targetPoints = user.points || 250;
    const targetLevel = user.level || 1;
    const duration = 1200;
    const steps = 60;
    const pointsIncrement = targetPoints / steps;
    const levelIncrement = targetLevel / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setAnimatedPoints(Math.min(Math.round(pointsIncrement * currentStep), targetPoints));
      setAnimatedLevel(Math.min(Math.round(levelIncrement * currentStep), targetLevel));

      if (currentStep >= steps) {
        clearInterval(timer);
        hasAnimated.current = true;
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-full text-masterly-navy"><p>Loading profile...</p></div>;
  if (!user) return <Login />;

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm((prev) => ({ ...prev, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => setForm((prev) => ({ ...prev, avatar: null }));

  const handleSave = async () => {
    setSaving(true);
    const updated = await updateUser(form);
    if (updated) {
      setEditing(false);
      hasAnimated.current = false;
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col items-center justify-start h-full text-masterly-navy px-4 py-6 animate-page-fade-in">
      <div className="mb-4 flex flex-col items-center">
        <div className="relative group">
          <div className="relative w-[120px] h-[120px] rounded-full border-[4px] border-masterly-orange bg-white shadow-sm">
            <LazyImage
              src={form?.avatar || "https://i.pravatar.cc/150"}
              alt={`${form?.name || user?.name || "User"} profile picture`}
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          {editing && form?.avatar && (
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-masterly-red hover:brightness-110 rounded-full p-2 text-white shadow-sm border border-black/10 transition-all duration-300"
              style={{ backgroundColor: "#FE3131" }}
              aria-label="Remove profile photo"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        <h2 className="text-xl font-bold mt-3">{form?.name || user.name}</h2>
        <p className="text-sm text-masterly-muted">Level {form?.level || user.level}</p>

        {editing && (
          <label className="cursor-pointer flex items-center gap-2 bg-masterly-blue px-4 py-2 rounded-full text-sm font-medium mt-3 text-white hover:brightness-110 transition-all shadow-sm border border-black/10"
          style={{ backgroundColor: "#07A0FD" }}>
            <Upload size={18} aria-hidden="true" />
            Upload Photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              aria-label="Upload profile photo"
            />
          </label>
        )}
      </div>

      <div className="flex gap-3 mb-4">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="bg-masterly-blue text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2 hover:brightness-110 shadow-sm border border-black/10"
            style={{ backgroundColor: "#07A0FD" }}
          >
            <Edit size={18} />
            Edit
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-masterly-green text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2 hover:brightness-110 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save
              </>
            )}
          </button>
        )}
        <button
          onClick={logout}
          className="bg-masterly-red text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2 hover:brightness-110 shadow-sm border border-black/10"
          style={{ backgroundColor: "#FE3131" }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {editing && (
        <div className="bg-masterly-cardSoft rounded-2xl p-5 w-full max-w-md border border-masterly-border mb-4">
          <div className="space-y-3">
            <label className="block text-masterly-navy text-sm font-medium">
              Class:
              <select
                name="classLevel"
                value={form.classLevel || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg mt-1 bg-masterly-input text-masterly-navy border border-masterly-border"
              >
                <option>Class 1</option><option>Class 2</option><option>Class 3</option>
                <option>Class 4</option><option>Class 5</option><option>Above Class 5</option>
              </select>
            </label>
            <label className="block text-masterly-navy text-sm font-medium">
              Level:
              <input
                type="number"
                name="level"
                value={form.level || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg mt-1 bg-masterly-input text-masterly-navy border border-masterly-border"
              />
            </label>
            <label className="block text-masterly-navy text-sm font-medium">
              Email:
              <input
                type="email"
                name="email"
                value={form.email || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg mt-1 bg-masterly-input text-masterly-navy border border-masterly-border"
              />
            </label>
            <label className="block text-masterly-navy text-sm font-medium">
              Age:
              <input
                type="number"
                name="age"
                value={form.age || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg mt-1 bg-masterly-input text-masterly-navy border border-masterly-border"
              />
            </label>
            <label className="block text-masterly-navy text-sm font-medium">
              School:
              <input
                type="text"
                name="school"
                value={form.school || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg mt-1 bg-masterly-input text-masterly-navy border border-masterly-border"
              />
            </label>
          </div>
        </div>
      )}

      <div className="bg-masterly-cardSoft rounded-2xl p-5 w-full max-w-md border border-masterly-border mb-4">
        <div className="grid grid-cols-1 gap-3 text-center">
          <div className="bg-[#FEE6DA] rounded-2xl py-3 border border-masterly-border">
            <div className="text-xl font-bold text-masterly-orange">{animatedPoints}</div>
            <div className="text-xs text-masterly-muted">Progress</div>
          </div>
          <div className="bg-[#E7F5FE] rounded-2xl py-3 border border-masterly-border">
            <div className="text-lg font-bold text-masterly-blue">Level {animatedLevel}</div>
          </div>
          <div className="bg-[#FEF9F1] rounded-2xl py-3 border border-masterly-border">
            <div className="flex justify-center gap-1 text-lg">
              {[1, 2, 3, 4, 5].map((starNum, idx) => {
                const rating = user?.rating || 3;
                const isFilled = idx < rating;
                return (
                  <Star
                    key={starNum}
                    size={20}
                    className={isFilled ? "fill-masterly-yellow text-masterly-yellow" : "text-masterly-soft"}
                  />
                );
              })}
            </div>
            <div className="text-xs text-masterly-muted mt-1">Achievement Rating</div>
          </div>
        </div>
      </div>

      <div className="bg-[#FDFBFA] rounded-2xl p-4 w-full max-w-md border border-masterly-border mb-4" style={{ backgroundColor: "#FDFBFA" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-masterly-orange rounded-full flex items-center justify-center text-white">
              <GraduationCap size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-masterly-navy">Teaching Hub</h3>
              <p className="text-masterly-muted text-xs">Share your knowledge with us!</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/teacher/login")}
            className="bg-masterly-orange text-white px-4 py-2 rounded-full text-sm font-semibold hover:brightness-110 shadow-sm border border-black/10"
            style={{ backgroundColor: "#FC6F1F" }}
          >
            Access
          </button>
        </div>
      </div>
    </div>
  );
}
