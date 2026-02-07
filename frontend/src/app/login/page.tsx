"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isError, setIsError] = useState(false);

  const handleLoginSuccess = async (credentialResponse: any) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    try {
      const decoded: GoogleUser = jwtDecode(credentialResponse.credential);
      console.log(`[Login] Google Login Success for: ${decoded.email}`);
      
      const response = await fetch(`${baseUrl}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: decoded.email, 
          name: decoded.name, 
          avatar: decoded.picture, 
          googleId: decoded.sub
        }),
      });

      if (!response.ok) {
        throw new Error("Backend authentication failed");
      }

      const user = await response.json();
      localStorage.setItem("user", JSON.stringify(user));
      router.push("/dashboard");
    } catch (error) {
      console.error("Auth error:", error);
      setIsError(true);
    }
  };

  const handleManualLogin = async () => {
    // For manual login, we still use the simulated route for now
    if (!email) return;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    try {
        const response = await fetch(`${baseUrl}/api/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              email: email, 
              name: email.split('@')[0], 
              avatar: `https://ui-avatars.com/api/?name=${email}&background=00A859&color=fff`,
              googleId: `manual_${email}`
            }),
          });
          if (response.ok) {
            const user = await response.json();
            localStorage.setItem("user", JSON.stringify(user));
            router.push("/dashboard");
          }
    } catch (err) {
        console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#111111] font-sans">
      <div className="text-gray-400 self-start p-8 absolute top-0 text-sm">Login Screen</div>
      
      <div className="w-[450px] bg-white rounded-[20px] p-12 flex flex-col items-center shadow-xl">
        <h1 className="text-black text-3xl font-bold mb-10">Login</h1>
        
        {/* Google Login Component */}
        <div className="w-full flex justify-center mb-6">
            <GoogleLogin 
                onSuccess={handleLoginSuccess}
                onError={() => setIsError(true)}
                useOneTap
                theme="outline"
                shape="pill"
                width="100%"
            />
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-4 mb-8">
          <div className="flex-1 h-[1px] bg-gray-100"></div>
          <span className="text-gray-400 text-[10px] uppercase tracking-wider">or sign up through email</span>
          <div className="flex-1 h-[1px] bg-gray-100"></div>
        </div>

        {/* Form Inputs */}
        <div className="w-full space-y-4">
          <input 
            type="text" 
            placeholder="Email ID" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 bg-[#F4F7F4] border-none rounded-xl text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500" 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 bg-[#F4F7F4] border-none rounded-xl text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500" 
          />
        </div>

        {/* Login Button */}
        <button 
          onClick={handleManualLogin}
          className="w-full mt-10 bg-[#00A859] hover:bg-[#008F4C] text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-[0.98]"
        >
          Login
        </button>

        {isError && (
          <p className="text-red-500 text-xs mt-4">Authentication failed. Please try again.</p>
        )}
      </div>
    </div>
  );
}

