'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Users, Plus, ArrowLeft, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Navbar2 from '@/components/header/Navbar2';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/services/checkAuth';
import { useDispatch, useSelector } from 'react-redux';
import { 
  createGroupChat, 
  createPrivateChat, 
  fetchAllUsers, 
  fetchChatToken, 
  fetchMessages, 
  sendMessage
} from '@/features/chat/chatSlice';

// Utility functions for localStorage
const STORAGE_KEYS = {
  USER_CHATS: 'user_chats',
  USER_GROUPS: 'user_groups',
  CHAT_MESSAGES: 'chat_messages'
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage save error:', e);
  }
};

const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Storage get error:', e);
    return null;
  }
};

// Enhanced Redux actions
const fetchUserChats = (userId) => async (dispatch) => {
  dispatch({ type: 'chat/fetchUserChatsStart' });
  try {
    const response = await fetch(`/api/chat/user-chats/${userId}`);
    const data = await response.json();
    
    if (data.success) {
      const chats = data.chats || [];
      saveToStorage(STORAGE_KEYS.USER_CHATS, chats);
      dispatch({ type: 'chat/fetchUserChatsSuccess', payload: chats });
      return chats;
    }
    throw new Error(data.message || 'Failed to fetch chats');
  } catch (error) {
    // Fallback to localStorage
    const cachedChats = getFromStorage(STORAGE_KEYS.USER_CHATS) || [];
    dispatch({ type: 'chat/fetchUserChatsSuccess', payload: cachedChats });
    return cachedChats;
  }
};

const fetchUserGroups = (userId) => async (dispatch) => {
  dispatch({ type: 'chat/fetchUserGroupsStart' });
  try {
    const response = await fetch(`/api/chat/user-groups/${userId}`);
    const data = await response.json();
    
    if (data.success) {
      const groups = data.groups || [];
      saveToStorage(STORAGE_KEYS.USER_GROUPS, groups);
      dispatch({ type: 'chat/fetchUserGroupsSuccess', payload: groups });
      return groups;
    }
    throw new Error(data.message || 'Failed to fetch groups');
  } catch (error) {
    const cachedGroups = getFromStorage(STORAGE_KEYS.USER_GROUPS) || [];
    dispatch({ type: 'chat/fetchUserGroupsSuccess', payload: cachedGroups });
    return cachedGroups;
  }
};

const joinPublicGroup = (data) => async (dispatch) => {
  try {
    const response = await fetch('/api/chat/join-group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Chat View Component
function ChatView({ chat, onBack, currentUser }) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();
  const { messages, loadingMessages } = useSelector((state) => state.chat);
  const intervalRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (chat?.channelId) {
      dispatch(fetchMessages(chat.channelId));
      
      intervalRef.current = setInterval(() => {
        dispatch(fetchMessages(chat.channelId));
      }, 2000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [chat?.channelId, dispatch]);

  const displayMessages = React.useMemo(() => {
    if (!messages || !chat?.channelId) return [];
    
    if (messages[chat.channelId]?.messages) {
      return messages[chat.channelId].messages;
    }
    if (Array.isArray(messages)) return messages;
    if (messages.data) return messages.data;
    
    return [];
  }, [messages, chat?.channelId]);

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages, scrollToBottom]);

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (newMessage.trim() && currentUser?._id && chat?.channelId) {
      dispatch(sendMessage({
        userId: currentUser._id,
        channelId: chat.channelId,
        text: newMessage
      }));
      
      setNewMessage('');
      
      // Update chat list with new message
      setTimeout(() => {
        dispatch(fetchUserChats(currentUser._id));
        dispatch(fetchUserGroups(currentUser._id));
      }, 500);
    }
  }, [newMessage, currentUser?._id, chat?.channelId, dispatch]);

  return (
    <div className="flex flex-col h-full pt-16 sm:pt-0">
      <div className="flex items-center space-x-4 px-4 py-[14px] bg-gradient-to-r from-blue-600 to-indigo-600 text-primary-foreground">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <Avatar>
          <AvatarImage src={chat?.avatar} alt={chat?.name} />
          <AvatarFallback className="text-black">{chat?.name?.[0]?.toUpperCase() || 'C'}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold">{chat?.name}</h2>
      </div>
      
      <ScrollArea className="flex-grow p-4">
        {loadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayMessages.length > 0 ? (
              displayMessages.map((message, index) => {
                const isCurrentUser = 
                  message.userId === currentUser?._id || 
                  message.sender === currentUser?._id;
                
                return (
                  <div
                    key={message._id || `msg-${index}`}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div
                      className={`max-w-64 md:max-w-lg p-2 break-words rounded-lg ${
                        isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-100'
                      }`}
                    >
                      <p className="break-words text-base">{message.text || message.message}</p>
                      <p className="text-xs font-light flex justify-end mt-1">
                        {message.createdAt 
                          ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'now'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex justify-center items-center h-40">
                <p className="text-muted-foreground">No messages yet</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t md:mb-0 mb-12">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            className="flex-grow"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

// User List Component
function UserList({ onSelectUser }) {
  const dispatch = useDispatch();
  const { users, loadingUsers } = useSelector(state => state.chat);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const filteredUsers = React.useMemo(() => {
    if (!users || !Array.isArray(users)) return [];
    return users.filter(user => {
      const userName = user.name || user.id?.name || '';
      return userName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [users, searchTerm]);

  return (
    <div className="p-4">
      <DialogHeader>
        <DialogTitle>Select User</DialogTitle>
      </DialogHeader>
      <div className="relative my-4">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search users..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ScrollArea className="h-[300px]">
        {loadingUsers ? (
          <div className="flex justify-center p-4">
            <p>Loading...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map(user => {
            const userId = user._id || user.id?._id || '';
            const userName = user.name || user.id?.name || 'Unknown';
            const userBatch = user.batch || user.id?.batch || '';
            const userCompany = user.companyName || user.id?.companyName || '';
            
            return (
              <div
                key={userId}
                className="flex items-center space-x-4 p-4 hover:bg-gray-100 cursor-pointer"
                onClick={() => onSelectUser(user)}
              >
                <Avatar>
                  <AvatarFallback>{userName[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{userName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {userBatch} {userCompany ? `• ${userCompany}` : ''}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// Dialog Components
function CreateGroupDialog({ onOpenChange, currentUser, dispatch }) {
  const [groupName, setGroupName] = useState('');
  
  const handleCreateGroup = useCallback(() => {
    if (groupName.trim() && currentUser?._id) {
      dispatch(createGroupChat({ 
        creatorId: currentUser._id, 
        groupName 
      })).then(() => {
        dispatch(fetchUserGroups(currentUser._id));
      });
      setGroupName('');
      onOpenChange(false);
    }
  }, [groupName, currentUser?._id, dispatch, onOpenChange]);

  return (
    <DialogContent className="bg-white text-black">
      <DialogHeader>
        <DialogTitle>Create New Group</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <Input
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <Button className="w-full" onClick={handleCreateGroup}>
          Create Group
        </Button>
      </div>
    </DialogContent>
  );
}

function JoinGroupDialog({ onOpenChange, currentUser, dispatch }) {
  const [groupCode, setGroupCode] = useState('');
  
  const handleJoinGroup = useCallback(() => {
    if (groupCode.trim() && currentUser?._id) {
      dispatch(joinPublicGroup({ 
        userId: currentUser._id, 
        groupCode 
      })).then(() => {
        dispatch(fetchUserGroups(currentUser._id));
      });
      setGroupCode('');
      onOpenChange(false);
    }
  }, [groupCode, currentUser?._id, dispatch, onOpenChange]);

  return (
    <DialogContent className="bg-white text-black">
      <DialogHeader>
        <DialogTitle>Join Public Group</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <Input
          placeholder="Group Code"
          value={groupCode}
          onChange={(e) => setGroupCode(e.target.value)}
        />
        <Button className="w-full" onClick={handleJoinGroup}>
          Join Group
        </Button>
      </div>
    </DialogContent>
  );
}

// Main Component
export default function WhatsAppClone() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [newChatDialog, setNewChatDialog] = useState(false);
  const [newGroupDialog, setNewGroupDialog] = useState(false);
  const [joinGroupDialog, setJoinGroupDialog] = useState(false);
  
  const dispatch = useDispatch();
  const router = useRouter();
  const { chats = [], groups = [], loading } = useSelector(state => state.chat);
  const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    if (currentUser?._id) {
      dispatch(fetchChatToken({ userId: currentUser._id }));
      dispatch(fetchUserChats(currentUser._id));
      dispatch(fetchUserGroups(currentUser._id));
      
      pollIntervalRef.current = setInterval(() => {
        dispatch(fetchUserChats(currentUser._id));
        dispatch(fetchUserGroups(currentUser._id));
      }, 5000);
    }
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [router, dispatch, currentUser?._id]);

  const handleChatClick = useCallback((chat) => {
    const processedChat = {
      ...chat,
      channelId: chat.channelId || chat._id,
      name: chat.name || "Chat",
      avatar: chat.avatar || chat.profileImage
    };
    
    setSelectedChat(processedChat);
    
    if (processedChat.channelId) {
      dispatch(fetchMessages(processedChat.channelId));
    }
  }, [dispatch]);

  const handleSelectUser = useCallback((user) => {
    const userId = user._id || user.id?._id;
    const userName = user.name || user.id?.name || 'Unknown';
    const userAvatar = user.profileImage || user.id?.profileImage || '';
    
    if (currentUser?._id && userId && userId !== currentUser._id) {
      const existingChat = chats.find(chat => 
        chat.participants?.some(p => (p._id || p) === userId)
      );
      
      if (existingChat) {
        handleChatClick(existingChat);
        setNewChatDialog(false);
      } else {
        dispatch(createPrivateChat({
          senderId: currentUser._id,
          receiverId: userId
        })).then((result) => {
          if (result.payload?.data) {
            const newChat = {
              _id: result.payload.data._id || result.payload.data.channelId,
              channelId: result.payload.data.channelId,
              name: userName,
              avatar: userAvatar,
              participants: [{ _id: userId }, { _id: currentUser._id }]
            };
            
            handleChatClick(newChat);
            setNewChatDialog(false);
            dispatch(fetchUserChats(currentUser._id));
          }
        });
      }
    }
  }, [currentUser?._id, chats, handleChatClick, dispatch]);

  const processedChats = React.useMemo(() => {
    return chats.map(chat => {
      let chatName = chat.name;
      let chatAvatar = chat.avatar || chat.profileImage;
      
      if (!chatName && chat.participants?.length) {
        const otherParticipant = chat.participants.find(p => {
          const participantId = p._id || p;
          return participantId !== currentUser?._id;
        });
        
        if (otherParticipant) {
          chatName = otherParticipant.name || "Chat";
          chatAvatar = otherParticipant.profileImage || otherParticipant.avatar;
        }
      }
      
      return {
        ...chat,
        name: chatName || 'Unknown Chat',
        avatar: chatAvatar
      };
    });
  }, [chats, currentUser?._id]);

  const filteredChats = processedChats.filter(chat => 
    chat?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter(group => 
    group?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative flex flex-row justify-center mx-auto">
      <Navbar2 />
      <div className="max-w-[2100px] mx-auto flex w-full h-[91%] bg-background border-white border-[1px] fixed bottom-0 overflow-x-clip">
        <div className="w-full md:w-96 flex flex-col border-r">
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#A51C30] to-[#D43F56] text-primary-foreground">
            <h1 className="text-xl font-bold">Chat</h1>
            <div className="flex space-x-2">
              <Dialog open={newChatDialog} onOpenChange={setNewChatDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-5 w-5" color={'#C03046'} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <UserList onSelectUser={handleSelectUser} />
                </DialogContent>
              </Dialog>
              
              <Dialog open={newGroupDialog} onOpenChange={setNewGroupDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Users className="h-5 w-5" color={'#C03046'} />
                  </Button>
                </DialogTrigger>
                <CreateGroupDialog 
                  onOpenChange={setNewGroupDialog} 
                  currentUser={currentUser}
                  dispatch={dispatch}
                />
              </Dialog>
            </div>
          </div>

          <div className="p-4 bg-secondary">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search chats..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="chats" className="flex-grow flex flex-col mt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chats">Chats</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
            </TabsList>
            <TabsContent value="chats" className="flex-grow">
              <ScrollArea className="h-[calc(92vh-200px)] md:pb-10 pb-20">
                {loading ? (
                  <div className="flex justify-center items-center p-4">
                    <p>Loading...</p>
                  </div>
                ) : filteredChats.length > 0 ? (
                  filteredChats.map((chat) => (
                    <div
                      key={chat._id || chat.channelId}
                      className={`flex items-center space-x-4 p-4 ${
                        selectedChat && (selectedChat._id === chat._id || selectedChat.channelId === chat.channelId) 
                          ? 'bg-gray-200' : ''
                      } hover:bg-gray-100 cursor-pointer`}
                      onClick={() => handleChatClick(chat)}
                    >
                      <Avatar>
                        <AvatarImage src={chat?.avatar} alt={chat?.name} />
                        <AvatarFallback>{chat?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <h3 className="font-semibold">{chat?.name}</h3>
                        <div className="flex justify-between">
                          <p className="text-sm text-muted-foreground">
                            {chat?.lastMessage?.text || chat?.lastMessage || 'No messages yet'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {chat?.lastMessageTime ? 
                              formatDistanceToNow(new Date(chat?.lastMessageTime), { addSuffix: true }) : 
                              'just now'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-40">
                    <p className="text-muted-foreground">No chats found</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="groups" className="flex-grow">
              <div className="flex justify-between items-center px-4 py-2">
                <h3 className="font-semibold">Your Groups</h3>
                <Dialog open={joinGroupDialog} onOpenChange={setJoinGroupDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Join Public Group
                    </Button>
                  </DialogTrigger>
                  <JoinGroupDialog 
                    onOpenChange={setJoinGroupDialog}
                    currentUser={currentUser}
                    dispatch={dispatch}
                  />
                </Dialog>
              </div>
              <ScrollArea className="h-[calc(92vh-230px)] md:pb-10 pb-20">
                {loading ? (
                  <div className="flex justify-center items-center p-4">
                    <p>Loading...</p>
                  </div>
                ) : filteredGroups.length > 0 ? (
                  filteredGroups.map((group) => (
                    <div
                      key={group._id || group.channelId}
                      className={`flex items-center space-x-4 p-4 ${
                        selectedChat && (selectedChat._id === group._id || selectedChat.channelId === group.channelId) 
                          ? 'bg-gray-200' : ''
                      } hover:bg-gray-100 cursor-pointer`}
                      onClick={() => handleChatClick(group)}
                    >
                      <Avatar>
                        <AvatarImage src={group.avatar} alt={group.name} />
                        <AvatarFallback>{group.name?.[0]?.toUpperCase() || 'G'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <h3 className="font-semibold">{group.name}</h3>
                        <div className="flex justify-between">
                          <p className="text-sm text-muted-foreground">
                            {group.lastMessage?.text || group.lastMessage || 'No messages yet'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {group.lastMessageTime ? 
                              formatDistanceToNow(new Date(group.lastMessageTime), { addSuffix: true }) : 
                              'just now'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-40">
                    <p className="text-muted-foreground">No groups found</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden md:block flex-grow">
          {selectedChat ? (
            <ChatView 
              chat={selectedChat} 
              onBack={() => setSelectedChat(null)} 
              currentUser={currentUser}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a chat to start messaging
            </div>
          )}
        </div>
        
        {selectedChat && (
          <div className="fixed inset-0 bg-background md:hidden">
            <ChatView 
              chat={selectedChat} 
              onBack={() => setSelectedChat(null)} 
              currentUser={currentUser}
            />
          </div>
        )}
      </div>
    </div>
  );
}