import React, { useState, useRef, useEffect, useContext } from 'react';
import { Send, MessageCircle, User, Bot, Clock, CheckCircle, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { SidebarContext } from './Sidebar';

const Chatbot = () => {
  // Sidebar open state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored === 'true';
  });

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm here to help you with any questions or issues you might have. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(Date.now() - 5000)
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Sample FAQ data with responses
  const faqData = {
    'hello': "Hello! How can I help you today?",
    'hi': "Hi there! What can I do for you?",
    'help': "I'm here to help! You can ask me about account issues, billing, technical problems, or general questions.",
    'account': "For account-related issues, I can help you with password resets, profile updates, or account verification. What specific account issue are you experiencing?",
    'billing': "I can assist with billing questions including payment methods, invoices, refunds, and subscription changes. What billing issue can I help you with?",
    'password': "To reset your password: 1) Go to the login page 2) Click 'Forgot Password' 3) Enter your email 4) Check your email for reset instructions. If you don't receive the email, check your spam folder.",
    'refund': "For refunds, please provide your order number and reason for the refund request. Most refunds are processed within 5-7 business days.",
    'technical': "For technical issues, please describe the problem you're experiencing. Common issues include login problems, slow loading, or feature malfunctions.",
    'contact': "You can reach our support team at support@company.com or call us at (555) 123-4567. Our hours are Monday-Friday 9AM-6PM EST.",
    'hours': "Our support hours are Monday through Friday, 9:00 AM to 6:00 PM Eastern Time. We're currently closed on weekends.",
    'cancel': "To cancel your subscription: 1) Log into your account 2) Go to Settings > Billing 3) Click 'Cancel Subscription' 4) Follow the prompts. You'll retain access until your current billing period ends.",
    'thanks': "You're welcome! Is there anything else I can help you with today?",
    'thank you': "You're welcome! Is there anything else I can help you with today?",
    'bye': "Goodbye! Feel free to reach out if you need any further assistance. Have a great day!",
    'goodbye': "Goodbye! Feel free to reach out if you need any further assistance. Have a great day!",
    // Campus-specific responses
    'campus': "I can help you with campus-related questions including facilities, events, dining, transportation, and academic services. What would you like to know?",
    'dining': "Our campus dining halls are open Monday-Friday 7AM-9PM, weekends 8AM-8PM. We have vegetarian, vegan, and halal options available. Meal plans can be managed through your student portal.",
    'library': "The campus library is open 24/7 during academic terms. You can reserve study rooms, access digital resources, and get research assistance. Visit library.campus.edu for more information.",
    'parking': "Student parking permits are required and can be purchased through the campus portal. Visitor parking is available in designated areas. Parking violations can be appealed online.",
    'wifi': "Campus WiFi network name is 'CampusSecure'. Use your student credentials to connect. For connection issues, try forgetting and reconnecting to the network.",
    'grades': "You can check your grades through the student portal under 'Academic Records'. If you have concerns about a grade, contact your instructor first, then the department if needed.",
    'registration': "Course registration opens according to your class standing. Check your registration date in the student portal. For holds or issues, contact the registrar's office.",
    'financial aid': "Financial aid information is available in your student portal under 'Financial Aid'. For questions about loans, grants, or scholarships, visit the Financial Aid office or call (555) 123-FAID."
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    for (const [key, response] of Object.entries(faqData)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }
    return "I understand you're looking for help, but I'm not sure how to assist with that specific question. Please try rephrasing your question or contact our support team at support@campus.edu for personalized assistance.";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickActions = [
    "Campus dining hours",
    "Library information",
    "WiFi help",
    "Parking permits",
    "Check grades",
    "Financial aid"
  ];

  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
      <div className="flex h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`flex-1 flex flex-col relative h-screen overflow-y-auto min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          {/* Mobile Header */}
          <div className="lg:hidden p-4 bg-white shadow flex items-center">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <span className="ml-4 font-bold">Rojgar Setu</span>
          </div>
          <div className="h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100 p-2 flex-1 flex flex-col items-center overflow-y-auto">
            <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-stretch justify-center h-full">
              {/* Chat Window */}
              <div className="flex-1 flex flex-col rounded-2xl shadow-2xl border border-gray-200 bg-white/90 backdrop-blur-lg overflow-hidden h-full min-w-0 max-w-3xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-6 border-b border-indigo-100/30">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-full">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold text-white drop-shadow">Campus Support Chat</h1>
                      <div className="flex items-center space-x-1 text-sm text-green-200">
                        <CheckCircle className="w-4 h-4" />
                        <span>Online - Average response time: 30 seconds</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/70" style={{ minHeight: 0 }}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.sender === 'bot' && (
                        <div className="bg-indigo-600 p-2 rounded-full flex-shrink-0 shadow">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                          message.sender === 'user'
                            ? 'bg-indigo-600 text-white ml-auto'
                            : 'bg-gray-100 text-gray-800 mr-auto'
                        }`}
                      >
                        <p className="text-sm break-words whitespace-pre-line">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-indigo-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>

                      {message.sender === 'user' && (
                        <div className="bg-gray-600 p-2 rounded-full flex-shrink-0 shadow">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-start space-x-3">
                      <div className="bg-indigo-600 p-2 rounded-full">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-white/90 p-4 border-t border-gray-100">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message here..."
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-colors shadow"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Typically replies within minutes</span>
                    </div>
                    <span>Press Enter to send</span>
                  </div>
                </div>
              </div>
              {/* Quick Actions (right of chat window on desktop, below on mobile) */}
              <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-3 md:mt-0 mt-8 h-full justify-between">
                <div>
                  <div className="rounded-2xl shadow-lg border border-gray-200 bg-white/90 p-4 flex flex-col items-stretch">
                    <span className="text-sm font-semibold text-gray-700 mb-3 text-center">Quick Actions</span>
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(action)}
                        className="mb-2 last:mb-0 px-4 py-2 bg-gray-100 hover:bg-indigo-100 rounded-lg text-sm text-gray-700 transition-colors text-left shadow-sm border border-gray-100"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Footer/Extra Info (to the right, below quick actions) */}
                <div className="text-center mt-8 text-xs text-gray-400 pb-2 w-full max-w-5xl md:mt-6">
                  Need more help? Contact us at{' '}
                  <a href="mailto:support@campus.edu" className="text-indigo-600 hover:underline">
                    support@campus.edu
                  </a>{' '}
                  or call{' '}
                  <a href="tel:+15551234567" className="text-indigo-600 hover:underline">
                    (555) 123-4567
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Chatbot;