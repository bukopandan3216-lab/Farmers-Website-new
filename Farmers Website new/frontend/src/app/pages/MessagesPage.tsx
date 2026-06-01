import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Search, Send, Paperclip, MoreVertical, Trash2, Ban, CheckCheck, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messageApi } from "../services/api";

/* API-driven messaging: conversations are fetched from `messageApi.conversations()` */

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
            {new Date(message.timestamp ?? message.createdAt).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
          {isOwn && (message.read ?? false) && <CheckCheck className="w-3 h-3 text-blue-500" />}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ────────────────────────────────────────── */

export function MessagesPage() {
  const { user } = useAuth();
  const { otherUserId } = useParams<{ otherUserId?: string }>();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showAdminOptions, setShowAdminOptions] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const { data: conversations = [] } = useQuery<any>({
    queryKey: ["conversations"],
    queryFn: () => messageApi.conversations(),
    enabled: !!user,
  });

  useEffect(() => {
    if (otherUserId) {
      const existing = conversations.find((conv: any) => conv.otherUserId === otherUserId);
      if (existing) {
        setSelectedConversation(existing);
        return;
      }

      if (!selectedConversation || selectedConversation.otherUserId !== otherUserId) {
        setSelectedConversation({
          otherUserId,
          participantName: "Farmer",
          participantPhoto: "",
          participantRole: "farmer",
          lastMessage: "",
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
        });
      }
      return;
    }

    if (conversations.length && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [otherUserId, conversations, selectedConversation]);

  const filteredConversations = conversations.filter((conv: any) =>
    (conv.participantName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const conversationQuery = useQuery<any>({
    queryKey: ["conversation", selectedConversation?.otherUserId],
    queryFn: () => messageApi.conversation(selectedConversation?.otherUserId),
    enabled: !!selectedConversation?.otherUserId,
  });

  const messages = conversationQuery.data?.messages ?? selectedConversation?.messages ?? [];

  const sendMutation = useMutation<any, any, string, any>({
    mutationFn: (content: string) => messageApi.send(selectedConversation?.otherUserId, content),
    onSuccess: () => {
      queryClient.invalidateQueries(["conversation", selectedConversation?.otherUserId] as any);
      queryClient.invalidateQueries(["conversations"] as any);
      setNewMessage("");
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    sendMutation.mutate(newMessage.trim());
  };

  const handleDeleteConversation = () => {
    if (confirm("Remove this conversation from view?")) {
      setSelectedConversation(null);
      queryClient.invalidateQueries(["conversations"] as any);
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
            filteredConversations.map((conv: any) => (
              <ConversationItem
                key={conv.otherUserId}
                conversation={conv}
                active={selectedConversation?.otherUserId === conv.otherUserId}
                onClick={() => setSelectedConversation(conv)}
              />
            ))
          )}

          {/* Admin: show recent conversations */}
          {isAdmin && (
            <div className="p-4 bg-purple-50 border-t-2 border-purple-200">
              <h3 className="font-semibold text-sm text-purple-900 mb-3">All Platform Conversations</h3>
              {conversations.map((conv: any) => (
                <div key={conv.otherUserId} className="bg-white rounded-lg p-3 mb-2 border border-purple-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-xs text-gray-900">{conv.participantName}</p>
                  </div>
                  <p className="text-xs text-gray-500">{conv.participantRole}</p>
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
                        onClick={() => handleDeleteConversation()}
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
              {messages.map((msg: any) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.senderId === user?.id}
                />
              ))}
              {selectedConversation?.online && (
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
