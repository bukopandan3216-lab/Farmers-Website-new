import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Search, Send, Paperclip, MoreVertical, Trash2, Ban, CheckCheck, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

/* ─── MOCK DATA ─────────────────────────────────────────────── */

const mockConversations = [
  {
    id: 1,
    participantName: "Juan Dela Cruz",
    participantRole: "farmer",
    participantPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
    lastMessage: "Thank you for your order! Your vegetables are ready for delivery.",
    lastMessageTime: "2026-05-25T10:30:00Z",
    unreadCount: 2,
    online: true,
    messages: [
      { id: 1, senderId: 1, senderName: "You", content: "Hi, I'd like to order fresh broccoli.", timestamp: "2026-05-25T09:00:00Z", read: true },
      { id: 2, senderId: 2, senderName: "Juan Dela Cruz", content: "Hello! Yes, I have fresh broccoli available. How many kg do you need?", timestamp: "2026-05-25T09:05:00Z", read: true },
      { id: 3, senderId: 1, senderName: "You", content: "I need about 2kg. Can you deliver tomorrow?", timestamp: "2026-05-25T09:10:00Z", read: true },
      { id: 4, senderId: 2, senderName: "Juan Dela Cruz", content: "Yes, definitely! I can deliver tomorrow morning. Total will be ₱160.", timestamp: "2026-05-25T09:15:00Z", read: true },
      { id: 5, senderId: 1, senderName: "You", content: "Perfect! I'll place the order now.", timestamp: "2026-05-25T10:00:00Z", read: true },
      { id: 6, senderId: 2, senderName: "Juan Dela Cruz", content: "Thank you for your order! Your vegetables are ready for delivery.", timestamp: "2026-05-25T10:30:00Z", read: false },
    ]
  },
  {
    id: 2,
    participantName: "Maria Santos",
    participantRole: "farmer",
    participantPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    lastMessage: "The tomatoes are organic certified!",
    lastMessageTime: "2026-05-24T14:20:00Z",
    unreadCount: 0,
    online: false,
    messages: [
      { id: 1, senderId: 1, senderName: "You", content: "Are your tomatoes organic?", timestamp: "2026-05-24T14:00:00Z", read: true },
      { id: 2, senderId: 3, senderName: "Maria Santos", content: "The tomatoes are organic certified!", timestamp: "2026-05-24T14:20:00Z", read: true },
    ]
  },
  {
    id: 3,
    participantName: "Admin Support",
    participantRole: "admin",
    participantPhoto: null,
    lastMessage: "We'll process your refund within 3-5 business days.",
    lastMessageTime: "2026-05-23T11:00:00Z",
    unreadCount: 0,
    online: true,
    messages: [
      { id: 1, senderId: 1, senderName: "You", content: "I need help with my recent order #1234", timestamp: "2026-05-23T10:30:00Z", read: true },
      { id: 2, senderId: 4, senderName: "Admin Support", content: "Hello! I can help you with that. What seems to be the issue?", timestamp: "2026-05-23T10:35:00Z", read: true },
      { id: 3, senderId: 1, senderName: "You", content: "I received damaged items and would like a refund.", timestamp: "2026-05-23T10:40:00Z", read: true },
      { id: 4, senderId: 4, senderName: "Admin Support", content: "We'll process your refund within 3-5 business days.", timestamp: "2026-05-23T11:00:00Z", read: true },
    ]
  },
];

/* ─── ADMIN VIEW: ALL CONVERSATIONS ───────────────────────── */

const adminAllConversations = [
  {
    id: 101,
    participants: "Maria Santos ↔ Pedro Cruz",
    participantRoles: "buyer ↔ farmer",
    lastMessage: "Order confirmed, thank you!",
    lastMessageTime: "2026-05-25T11:00:00Z",
    status: "active"
  },
  {
    id: 102,
    participants: "Ana Reyes ↔ Juan Dela Cruz",
    participantRoles: "buyer ↔ farmer",
    lastMessage: "Can you deliver to Quezon City?",
    lastMessageTime: "2026-05-24T16:30:00Z",
    status: "active"
  },
  {
    id: 103,
    participants: "Jose Garcia ↔ Admin Support",
    participantRoles: "buyer ↔ admin",
    lastMessage: "Reported suspicious activity",
    lastMessageTime: "2026-05-24T09:15:00Z",
    status: "flagged"
  },
];

/* ─── COMPONENTS ────────────────────────────────────────────── */

function ConversationItem({ conversation, active, onClick }: any) {
  const roleColors: Record<string, string> = {
    farmer: "bg-green-100 text-green-800",
    buyer: "bg-blue-100 text-blue-800",
    admin: "bg-purple-100 text-purple-800",
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
        active ? "bg-emerald-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="w-12 h-12">
            <AvatarImage src={conversation.participantPhoto} />
            <AvatarFallback className="bg-emerald-100 text-emerald-700">
              {conversation.participantName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {conversation.online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {conversation.participantName}
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${roleColors[conversation.participantRole]}`}>
                {conversation.participantRole}
              </span>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {new Date(conversation.lastMessageTime).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 truncate flex-1">{conversation.lastMessage}</p>
            {conversation.unreadCount > 0 && (
              <Badge className="ml-2 bg-emerald-600 text-white text-xs px-2 py-0">
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, isOwn }: any) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[70%] ${isOwn ? "order-2" : "order-1"}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? "bg-emerald-600 text-white rounded-br-sm"
              : "bg-gray-100 text-gray-900 rounded-bl-sm"
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1 px-2 ${isOwn ? "justify-end" : "justify-start"}`}>
          <span className="text-xs text-gray-400">
            {new Date(message.timestamp).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
          {isOwn && message.read && <CheckCheck className="w-3 h-3 text-blue-500" />}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ────────────────────────────────────────── */

export function MessagesPage() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showAdminOptions, setShowAdminOptions] = useState(false);
  const [conversations, setConversations] = useState(mockConversations);

  const isAdmin = user?.role === "admin";

  const filteredConversations = conversations.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      id: selectedConversation.messages.length + 1,
      senderId: 1,
      senderName: "You",
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setConversations(prevConvs =>
      prevConvs.map(conv =>
        conv.id === selectedConversation.id
          ? {
              ...conv,
              messages: [...conv.messages, newMsg],
              lastMessage: newMessage,
              lastMessageTime: newMsg.timestamp,
            }
          : conv
      )
    );

    setSelectedConversation(prev => ({
      ...prev,
      messages: [...prev.messages, newMsg],
      lastMessage: newMessage,
      lastMessageTime: newMsg.timestamp,
    }));

    setNewMessage("");
  };

  const handleDeleteConversation = (convId: number) => {
    if (confirm("Delete this conversation?")) {
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (selectedConversation.id === convId) {
        setSelectedConversation(conversations[0]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Conversations List */}
      <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
          {isAdmin && (
            <div className="mt-3">
              <Badge className="bg-purple-100 text-purple-800">Admin View - All Conversations</Badge>
            </div>
          )}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                active={selectedConversation?.id === conv.id}
                onClick={() => setSelectedConversation(conv)}
              />
            ))
          )}

          {/* Admin: Monitor All Conversations */}
          {isAdmin && (
            <div className="p-4 bg-purple-50 border-t-2 border-purple-200">
              <h3 className="font-semibold text-sm text-purple-900 mb-3">All Platform Conversations</h3>
              {adminAllConversations.map((conv) => (
                <div key={conv.id} className="bg-white rounded-lg p-3 mb-2 border border-purple-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-xs text-gray-900">{conv.participants}</p>
                    {conv.status === "flagged" && (
                      <Badge className="bg-red-100 text-red-700 text-xs">Flagged</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{conv.participantRoles}</p>
                  <p className="text-xs text-gray-600 mt-1">{conv.lastMessage}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedConversation.participantPhoto} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {selectedConversation.participantName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {selectedConversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedConversation.participantName}</h2>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.online ? "Active now" : "Offline"}
                  </p>
                </div>
              </div>

              {/* Admin Controls */}
              {isAdmin && (
                <div className="relative">
                  <button
                    onClick={() => setShowAdminOptions(!showAdminOptions)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                  {showAdminOptions && (
                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-48 z-20">
                      <button
                        onClick={() => handleDeleteConversation(selectedConversation.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Conversation
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2">
                        <Ban className="w-4 h-4" />
                        Suspend User
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {selectedConversation.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.senderName === "You"}
                />
              ))}
              {selectedConversation.online && (
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                  <span>typing...</span>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ImageIcon className="w-5 h-5 text-gray-600" />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 rounded-full px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
