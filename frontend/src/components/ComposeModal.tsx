import React, { useState } from 'react';
import { ArrowLeft, Paperclip, Clock, ChevronDown, List, Type, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, ListOrdered, Quote, Link2, Code } from 'lucide-react';

interface ComposeModalProps {
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  senders: any[];
}

const ComposeModal: React.FC<ComposeModalProps> = ({ onClose, onSuccess, userId, senders }) => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSenderId, setSelectedSenderId] = useState(senders[0]?.id || '');
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);

  const [delay, setDelay] = useState(30);

  const handleSend = async () => {
    if (!recipient || !subject || !selectedSenderId) return;
    setIsLoading(true);
    
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/campaigns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                name: 'Manual Campaign',
                subject,
                body,
                startTime: scheduledTime || new Date(),
                delay: Number(delay),
                recipients: [recipient],
                senderId: selectedSenderId
            }),
        });

        if (response.ok) {
            onSuccess();
        }
    } catch (err) {
        console.error("Send error:", err);
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col font-sans">
      {/* Header */}
      <div className="px-8 py-5 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-6">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft size={22} />
            </button>
            <h2 className="text-xl font-bold text-gray-800">Compose New Email</h2>
        </div>
        
        <div className="flex items-center gap-6">
            <button className="text-gray-300 hover:text-gray-500"><Paperclip size={20} /></button>
            <button className="text-gray-300 hover:text-gray-500"><Clock size={20} /></button>
            <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-white border-2 border-[#00A859] text-[#00A859] px-6 py-2 rounded-full font-bold text-sm hover:bg-[#00A859] hover:text-white transition-all disabled:opacity-50"
            >
                {isLoading ? 'Sending...' : 'Send'}
            </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex-[3] flex flex-col p-12 overflow-y-auto custom-scrollbar">
            <div className="space-y-8 max-w-4xl w-full mx-auto">
                {/* Fields */}
                <div className="space-y-6">
                    <div className="flex items-center gap-6">
                        <span className="text-sm font-bold text-gray-400 w-16">From</span>
                        <div className="relative group">
                            <select 
                                value={selectedSenderId}
                                onChange={(e) => setSelectedSenderId(e.target.value)}
                                className="appearance-none bg-gray-50 px-8 py-1.5 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors text-sm font-bold text-gray-700 focus:ring-0"
                            >
                                {senders.map(s => (
                                    <option key={s.id} value={s.id}>{s.email}</option>
                                ))}
                            </select>
                            <div className="w-5 h-5 rounded-full bg-green-500 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center text-[8px] text-white font-bold">
                                {senders.find(s => s.id === selectedSenderId)?.email[0].toUpperCase() || 'A'}
                            </div>
                            <ChevronDown size={14} className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>


                    <div className="flex items-center gap-6 border-b border-gray-50 pb-2">
                        <span className="text-sm font-bold text-gray-400 w-16">To</span>
                        <input 
                            type="text" 
                            placeholder="recipient@example.com"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="flex-1 bg-transparent border-none text-sm font-medium text-gray-800 focus:ring-0 placeholder-gray-300"
                        />
                    </div>

                    <div className="flex items-center gap-6 border-b border-gray-50 pb-2">
                        <span className="text-sm font-bold text-gray-400 w-16">Subject</span>
                        <input 
                            type="text" 
                            placeholder="Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="flex-1 bg-transparent border-none text-sm font-medium text-gray-800 focus:ring-0 placeholder-gray-300"
                        />
                    </div>

                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-gray-400">Delay between 2 emails</span>
                            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg px-3 py-1">
                                <input 
                                    type="number" 
                                    value={delay}
                                    onChange={(e) => setDelay(Number(e.target.value))}
                                    className="w-12 bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 p-0"
                                />
                                <span className="text-xs font-bold text-gray-300 ml-1">sec</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-gray-400">Hourly Limit</span>
                            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg px-3 py-1 opacity-50">
                                <span className="text-sm font-bold text-gray-300 mr-2">50</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Editor */}
                <div className="flex flex-col flex-1 min-h-[400px] bg-[#F9FAF9] rounded-2xl border border-gray-50 p-6">
                    <div className="flex items-center gap-2 mb-6 text-gray-300 border-b border-[#F0F2F0] pb-4 overflow-x-auto no-scrollbar">
                        <button className="p-2 hover:text-gray-500"><List size={18} /></button>
                        <div className="h-4 w-[1px] bg-[#F1F3F1] mx-1"></div>
                        <button className="p-2 hover:text-gray-500 flex items-center gap-1 text-xs font-bold"><Type size={18} /> <ChevronDown size={12} /></button>
                        <div className="h-4 w-[1px] bg-[#F1F3F1] mx-1"></div>
                        <button className="p-2 hover:text-gray-500"><Bold size={18} /></button>
                        <button className="p-2 hover:text-gray-500"><Italic size={18} /></button>
                        <button className="p-2 hover:text-gray-500"><Underline size={18} /></button>
                        <div className="h-4 w-[1px] bg-[#F1F3F1] mx-1"></div>
                        <button className="p-2 hover:text-gray-500"><AlignLeft size={18} /></button>
                        <button className="p-2 hover:text-gray-500"><AlignCenter size={18} /></button>
                        <button className="p-2 hover:text-gray-500"><AlignRight size={18} /></button>
                        <div className="h-4 w-[1px] bg-[#F1F3F1] mx-1"></div>
                        <button className="p-2 hover:text-gray-500"><ListOrdered size={18} /></button>
                        <button className="p-2 hover:text-gray-500"><Quote size={18} /></button>
                        <button className="p-2 hover:text-gray-500"><Link2 size={18} /></button>
                        <button className="p-2 hover:text-gray-500"><Code size={18} /></button>
                    </div>
                    <textarea 
                        placeholder="Type Your Reply..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="flex-1 bg-transparent border-none text-gray-700 focus:ring-0 resize-none placeholder-gray-200"
                    />
                </div>
            </div>
        </div>

        {/* Send Later Sidebar */}
        <div className="flex-1 border-l border-gray-50 bg-white p-8 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 p-6 flex flex-col gap-6">
                <h4 className="text-sm font-bold text-gray-800">Send Later</h4>
                
                <div className="relative">
                    <input type="text" placeholder="Pick date & time" className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-4 text-xs font-bold text-gray-400" />
                    <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>

                <div className="flex flex-col gap-1">
                    {['Tomorrow', 'Tomorrow, 10:00 AM', 'Tomorrow, 11:00 AM', 'Tomorrow, 3:00 PM'].map((opt) => (
                        <button key={opt} className="w-full text-left p-3 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                            {opt}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 mt-4">
                    <button onClick={onClose} className="flex-1 p-2 text-xs font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                    <button onClick={handleSend} className="flex-1 p-2 bg-[#EBF7F1] text-[#00A859] rounded-lg text-xs font-bold border border-green-100 hover:bg-[#DDF2E8]">Done</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ComposeModal;

