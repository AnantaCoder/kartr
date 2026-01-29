import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Loader, Lock } from "lucide-react";
import { useAppSelector } from "../store/hooks";
import { selectIsAuthenticated, selectAuthInitialized } from "../store/slices/authSlice";

const API_BASE_URL = "http://localhost:8000";

const AutoPosting: React.FC = () => {
  const navigate = useNavigate();

  // Auth check
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectAuthInitialized);

  const [caption, setCaption] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [useAIImage, setUseAIImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      navigate('/login', { state: { from: '/auto-posting' } });
    }
  }, [isAuthenticated, isInitialized, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setUseAIImage(false);
      setMessage(null);
    }
  };

  const handleUseAIImage = () => {
    setSelectedImage(null);
    setUseAIImage(true);
    // TODO: Integrate with virtual AI page to fetch image
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (!caption.trim()) {
        setMessage({ type: "error", text: "Please write a caption" });
        setIsLoading(false);
        return;
      }

      if (!username.trim() || !password.trim()) {
        setMessage({ type: "error", text: "Please enter Bluesky credentials" });
        setIsLoading(false);
        return;
      }

      // Get JWT token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login', { state: { from: '/auto-posting' } });
        return;
      }

      // Step 1: Connect Bluesky account (verify credentials and save to profile)
      const connectRes = await fetch(`${API_BASE_URL}/bluesky/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          identifier: username,
          password: password,
        }),
      });

      if (!connectRes.ok) {
        const error = await connectRes.json();
        throw new Error(error.detail || "Failed to verify Bluesky credentials");
      }

      // Step 2: Post to Bluesky (using saved credentials from profile)
      const postFormData = new FormData();
      postFormData.append("text", caption);
      postFormData.append("image_path", ""); // Empty string means no saved image path
      postFormData.append("alt_text", caption);

      if (selectedImage) {
        postFormData.append("image_file", selectedImage);
      }

      const postRes = await fetch(`${API_BASE_URL}/bluesky/post`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          // Don't set Content-Type - browser will set it with boundary
        },
        body: postFormData,
      });

      if (!postRes.ok) {
        const error = await postRes.json();
        throw new Error(error.detail || "Failed to post to Bluesky");
      }

      const postData = await postRes.json();
      setMessage({
        type: "success",
        text: `✅ Posted successfully! Post URI: ${postData.post_uri}`,
      });

      // Reset form
      setCaption("");
      setUsername("");
      setPassword("");
      setSelectedImage(null);
      setUseAIImage(false);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header bgClass="bg-purple-700 shadow-xl" />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-12">
        <div className="w-full max-w-xl p-8 rounded-3xl shadow-2xl bg-white/90 animate-fade-in-up">
          <h2 className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">Auto-Post to Bluesky</h2>
          <form onSubmit={handlePost} className="space-y-8">
            <div className="flex gap-4 justify-center mb-4">
              <label className="flex flex-col items-center cursor-pointer group">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <span className="px-5 py-2 bg-indigo-500 text-white rounded-xl shadow-md group-hover:scale-105 group-hover:bg-indigo-600 transition-all duration-200">Upload a File</span>
              </label>
              <button type="button" onClick={handleUseAIImage} className="px-5 py-2 bg-purple-500 text-white rounded-xl shadow-md hover:scale-105 hover:bg-purple-600 transition-all duration-200">
                Use Image from Virtual AI
              </button>
            </div>
            <div className="mb-4 min-h-[28px] text-center">
              {selectedImage && <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 animate-fade-in">Selected: {selectedImage.name}</span>}
              {useAIImage && <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 animate-fade-in">Using image from Virtual AI (to be implemented)</span>}
            </div>
            <div className="relative">
              <label className="block mb-2 font-semibold text-indigo-700">Caption</label>
              <input
                type="text"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Write a caption for your image..."
                className="w-full border-2 border-indigo-200 rounded-xl px-4 py-3 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block mb-2 font-semibold text-indigo-700">Bluesky Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your Bluesky username"
                  className="w-full border-2 border-indigo-200 rounded-xl px-4 py-3 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                  required
                />
              </div>
              <div className="relative">
                <label className="block mb-2 font-semibold text-indigo-700">Bluesky Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your Bluesky password"
                  className="w-full border-2 border-indigo-200 rounded-xl px-4 py-3 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 animate-fade-in disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </button>
            {message && (
              <div
                className={`p-4 rounded-xl text-center font-semibold animate-fade-in ${message.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }`}
              >
                {message.text}
              </div>
            )}
          </form>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.7s cubic-bezier(.4,0,.2,1) both; }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 3s ease-in-out infinite; }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.5s both; }
      `}</style>
    </>
  );
};

export default AutoPosting;