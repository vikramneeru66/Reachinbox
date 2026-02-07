import React, { useState } from 'react';
import { ArrowLeft, Star, Trash2, Archive, ChevronDown, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface EmailDetailProps {
  email: any | null;
  onBack?: () => void;
  onUpdate?: () => void;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ email, onBack, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!email) {
    return (
      <div className="flex-[2] bg-white flex items-center justify-center text-gray-300">
        <div className="flex flex-col items-center gap-4 opacity-50">
            <Archive size={48} strokeWidth={1} />
            <span className="text-sm font-medium">Select an email to read</span>
        </div>
      </div>
    );
  }

  const handleAction = async (action: 'star' | 'archive' | 'delete') => {
    setIsUpdating(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    try {
        let response;
        if (action === 'delete') {
            response = await fetch(`${baseUrl}/api/emails/${email.id}`, { method: 'DELETE' });
        } else {
            response = await fetch(`${baseUrl}/api/emails/${email.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isStarred: action === 'star' ? !email.isStarred : undefined,
                    isArchived: action === 'archive' ? true : undefined
                })
            });
        }

        if (response.ok) {
            onUpdate?.();
        }
    } catch (err) {
        console.error(`Failed to ${action}:`, err);
    } finally {
        setIsUpdating(false);
    }
  };

  return (
    <div className="flex-[2] flex flex-col h-screen bg-white border-l border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50">
        <div className="flex items-center gap-6">
            <button onClick={onBack} className="text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft size={22} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 truncate max-w-md">{email.campaign.subject}</h2>
        </div>
        
        <div className="flex items-center gap-6">
            <div className={`flex items-center gap-4 text-gray-300 ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
                <button 
                    onClick={() => handleAction('star')}
                    className={`transition-colors ${email.isStarred ? 'text-yellow-400' : 'hover:text-yellow-400'}`}
                >
                    <Star size={20} fill={email.isStarred ? 'currentColor' : 'none'} />
                </button>
                <button 
                    onClick={() => handleAction('archive')}
                    className="hover:text-gray-500 transition-colors"
                >
                    <Archive size={20} />
                </button>
                <button 
                    onClick={() => handleAction('delete')}
                    className="hover:text-red-500 transition-colors"
                >
                    <Trash2 size={20} />
                </button>
            </div>
            <div className="h-6 w-[1px] bg-gray-100"></div>
            <div className="flex items-center gap-2">
                <div className="text-right">
                    <div className="text-xs font-bold text-gray-800">Status</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{email.status}</div>
                </div>
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
        <div className="flex items-start gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-[#00A859] flex items-center justify-center text-white font-bold text-lg">
                {email.recipient[0].toUpperCase()}
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800 text-lg">{email.recipient.split('@')[0]}</span>
                        <span className="text-gray-400 text-sm">&lt;{email.recipient}&gt;</span>
                    </div>
                    <span className="text-gray-400 text-sm">
                        {email.sentAt ? format(new Date(email.sentAt), 'MMM d, h:mm a') : format(new Date(email.scheduledTime), 'MMM d, h:mm a')}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <span>to me</span>
                    <ChevronDown size={14} />
                    {email.status === 'SENT' ? (
                        <CheckCircle2 size={14} className="text-green-500 ml-2" />
                    ) : (
                        <Clock size={14} className="text-orange-400 ml-2" />
                    )}
                </div>
            </div>
        </div>

        <div className="space-y-6 text-gray-700 leading-relaxed mb-12">
            <div 
                className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: email.campaign.body }}
            />
        </div>

        {/* Campaign Info */}
        <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h4 className="text-sm font-bold text-gray-800 mb-4">Campaign Details</h4>
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Campaign Name</div>
                    <div className="text-sm font-medium text-gray-700">{email.campaign.name}</div>
                </div>
                <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Originally Scheduled</div>
                    <div className="text-sm font-medium text-gray-700">{format(new Date(email.scheduledTime), 'PPP p')}</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;

