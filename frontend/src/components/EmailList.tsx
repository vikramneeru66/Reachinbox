import React from 'react';
import { Search, Filter, RefreshCw, Star, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface EmailListProps {
  emails: any[];
  selectedEmailId: string | null;
  onSelectEmail: (email: any) => void;
  loading: boolean;
  onRefresh: () => void;
}

const EmailList: React.FC<EmailListProps> = ({ emails, selectedEmailId, onSelectEmail, loading, onRefresh }) => {
  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Search Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="relative w-full max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[#F4F7F4] border-none rounded-full py-3 px-12 text-sm text-gray-700 placeholder-gray-400 focus:ring-1 focus:ring-green-500"
          />
        </div>
        <div className="flex items-center gap-4 ml-6">
          <button className="p-2 text-gray-400 hover:text-gray-600"><Filter size={20} /></button>
          <button onClick={onRefresh} className="p-2 text-gray-400 hover:text-gray-600"><RefreshCw size={20} className={loading ? 'animate-spin' : ''} /></button>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading your emails...</div>
        ) : emails.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center opacity-40">
            <span className="text-gray-400 font-medium">Your inbox is empty</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => onSelectEmail(email)}
                className={`group px-10 py-5 cursor-pointer transition-all flex items-center gap-6 ${
                  selectedEmailId === email.id ? 'bg-[#FDFEFD]' : 'hover:bg-[#F9FAF9]'
                }`}
              >
                <div className="min-w-[140px] text-sm font-bold text-gray-800 truncate">
                  To: {email.recipient.split('@')[0]}
                </div>
                
                <div className="flex items-center gap-3">
                    {email.status === 'SENT' ? (
                        <div className="flex items-center gap-2 bg-[#EBF7F1] px-3 py-1 rounded-full border border-[#DDF2E8]">
                            <CheckCircle2 className="text-[#00A859]" size={12} />
                            <span className="text-[11px] font-bold text-[#00A859] whitespace-nowrap">
                                Sent {format(new Date(email.sentAt || Date.now()), 'MMM d, h:mm a')}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-[#FFF4E5] px-3 py-1 rounded-full border border-[#FFE7C8]">
                            <Clock className="text-[#FF9900]" size={12} />
                            <span className="text-[11px] font-bold text-[#FF9900] whitespace-nowrap">
                                {format(new Date(email.scheduledTime || Date.now()), 'EEE h:mm:ss a')}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className="font-bold text-sm text-gray-800 whitespace-nowrap">
                        {email.campaign.subject}
                    </span>
                    <span className="text-gray-400 text-sm">-</span>
                    <span className="text-gray-400 text-sm truncate" dangerouslySetInnerHTML={{ __html: email.campaign.body.replace(/<[^>]*>/g, '').substring(0, 100) }}>
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <Star 
                        size={18} 
                        className={email.isStarred ? 'text-yellow-400' : 'text-gray-200 group-hover:text-gray-300'} 
                        fill={email.isStarred ? 'currentColor' : 'none'}
                    />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailList;


