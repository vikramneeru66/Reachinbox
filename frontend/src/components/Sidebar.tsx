import React from 'react';
import { Clock, Send, ChevronDown, LogOut, Archive } from 'lucide-react';


interface SidebarProps {
  onCompose: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: any;
  stats: { scheduled: number, sent: number, archived: number };
}

const Sidebar: React.FC<SidebarProps> = ({ onCompose, activeTab, setActiveTab, user, stats }) => {

  return (
    <div className="w-[280px] bg-white flex flex-col h-screen border-r border-gray-100 p-6 flex-shrink-0">
      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-2xl font-black tracking-tighter text-black">ONB</h1>
      </div>

      {/* User Profile */}
      <div className="bg-[#F8F9F9] rounded-2xl p-3 flex items-center justify-between mb-8 border border-gray-50">
        <div className="flex items-center gap-3">
          <img 
            src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
            alt="User" 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800">{user?.name || 'Loading...'}</span>
            <span className="text-[10px] text-gray-400">{user?.email || '...'}</span>
          </div>
        </div>
        <ChevronDown size={14} className="text-gray-400" />
      </div>


      {/* Compose Button */}
      <button
        onClick={onCompose}
        className="w-full py-2.5 px-4 mb-10 border-2 border-[#00A859] text-[#00A859] rounded-full font-bold text-sm hover:bg-[#00A859] hover:text-white transition-all"
      >
        Compose
      </button>

      {/* Navigation */}
      <div className="flex flex-col space-y-2">
        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest pl-2 mb-2">Core</span>
        
        <button
          onClick={() => setActiveTab('inbox')}
          className={`group flex items-center justify-between p-3 rounded-xl transition-all ${
            activeTab === 'inbox' ? 'bg-[#EBF7F1] text-[#00A859]' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <Send size={18} className={activeTab === 'inbox' ? 'text-[#00A859]' : 'text-gray-400 group-hover:text-gray-600'} />
            <span className="text-sm font-bold">Inbox</span>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`group flex items-center justify-between p-3 rounded-xl transition-all ${
            activeTab === 'scheduled' ? 'bg-[#EBF7F1] text-[#00A859]' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <Clock size={18} className={activeTab === 'scheduled' ? 'text-[#00A859]' : 'text-gray-400 group-hover:text-gray-600'} />
            <span className="text-sm font-bold">Scheduled</span>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            activeTab === 'scheduled' ? 'bg-transparent' : 'text-gray-400'
          }`}>{stats.scheduled}</span>
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`group flex items-center justify-between p-3 rounded-xl transition-all ${
            activeTab === 'sent' ? 'bg-[#EBF7F1] text-[#00A859]' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <Send size={18} className={activeTab === 'sent' ? 'text-[#00A859]' : 'text-gray-400 group-hover:text-gray-600'} />
            <span className="text-sm font-bold">Sent</span>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            activeTab === 'sent' ? 'bg-transparent' : 'text-gray-400'
          }`}>{stats.sent}</span>
        </button>

        <button
          onClick={() => setActiveTab('archived')}
          className={`group flex items-center justify-between p-3 rounded-xl transition-all ${
            activeTab === 'archived' ? 'bg-[#EBF7F1] text-[#00A859]' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <Archive size={18} className={activeTab === 'archived' ? 'text-[#00A859]' : 'text-gray-400 group-hover:text-gray-600'} />
            <span className="text-sm font-bold">Archived</span>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            activeTab === 'archived' ? 'bg-transparent' : 'text-gray-400'
          }`}>{stats.archived}</span>
        </button>
      </div>

      <div className="mt-auto pt-6 border-t border-gray-100">
        <button 
          onClick={() => {
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};


export default Sidebar;

