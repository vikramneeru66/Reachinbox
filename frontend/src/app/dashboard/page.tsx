"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import EmailList from "@/components/EmailList";
import EmailDetail from "@/components/EmailDetail";
import ComposeModal from "@/components/ComposeModal";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "sent" | "scheduled" | "archived">("scheduled");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [senders, setSenders] = useState<any[]>([]);
  const [stats, setStats] = useState({ scheduled: 0, sent: 0, archived: 0 });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      initUser(parsedUser.id);
    }
  }, []);

  const initUser = async (userId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    try {
        console.log(`[Dashboard] Initializing user: ${userId} at ${baseUrl}`);
        
        // 1. Fetch senders
        const sUrl = `${baseUrl}/api/senders?userId=${userId}`;
        const sResponse = await fetch(sUrl);
        
        if (!sResponse.ok) {
            const text = await sResponse.text();
            throw new Error(`Failed to fetch senders: ${sResponse.status} - ${text.substring(0, 100)}`);
        }

        const sData = await sResponse.json();
        let currentSenders = sData;
        
        // 2. If no senders, auto-create a test account for workability
        if (sData.length === 0) {
            console.log("[Dashboard] No senders found, creating test account...");
            const createUrl = `${baseUrl}/api/sender/ethereal`;
            const createResponse = await fetch(createUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            
            if (!createResponse.ok) {
                const text = await createResponse.text();
                throw new Error(`Failed to create test sender: ${createResponse.status} - ${text.substring(0, 100)}`);
            }

            const newSender = await createResponse.json();
            currentSenders = [newSender];
        }
        setSenders(currentSenders);
    } catch (err: any) {
        console.error("Dashboard Init Error:", err.message || err);
    }
  };


  const fetchEmails = async () => {
    if (!user) return;
    setLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    try {
      const endpoint = activeTab === "sent" ? "sent" : activeTab === "archived" ? "archived" : "scheduled";
      const response = await fetch(
          `${baseUrl}/api/emails/${endpoint}?userId=${user.id}`
      );
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch emails: ${response.status} - ${text.substring(0, 100)}`);
      }

      const data = await response.json();
      setEmails(data);
    } catch (error: any) {
      console.error("Failed to fetch emails:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    try {
      const response = await fetch(`${baseUrl}/api/stats?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };


  useEffect(() => {
    fetchEmails();
    fetchStats();
  }, [user, activeTab]);

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      <Sidebar 
        onCompose={() => setIsComposeOpen(true)} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user}
        stats={stats}
      />

      <div className="flex flex-1 relative">
        {selectedEmail ? (
            <EmailDetail 
                email={selectedEmail} 
                onBack={() => setSelectedEmail(null)} 
                onUpdate={() => {
                    fetchEmails();
                    fetchStats();
                    setSelectedEmail(null);
                }}
            />
        ) : (
            <EmailList 
                emails={emails} 
                selectedEmailId={null} 
                onSelectEmail={setSelectedEmail} 
                loading={loading}
                onRefresh={fetchEmails}
            />
        )}
      </div>

      {isComposeOpen && (
        <ComposeModal 
          onClose={() => setIsComposeOpen(false)} 
          onSuccess={() => {
            setIsComposeOpen(false);
            fetchEmails();
            setActiveTab('scheduled');
          }}
          userId={user?.id}
          senders={senders}
        />
      )}
    </div>
  );
}


