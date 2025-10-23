import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Role, Message, QuestionStats } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { generateChatResponse, categorizeQuestion } from '../services/geminiService';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { UserIcon } from './icons/UserIcon';
import { ChatIcon } from './icons/ChatIcon';

interface UserViewProps {
  setView: (view: Role) => void;
}

const UserView: React.FC<UserViewProps> = ({ setView }) => {
  const [pdfText] = useLocalStorage<string | null>('pdf_text', null);
  const [messages, setMessages] = useLocalStorage<Message[]>('chat_history', []);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  
  const [, setChatSessions] = useLocalStorage<number>('chat_sessions', 0);
  const [, setQuestionStats] = useLocalStorage<QuestionStats>('question_stats', {});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Increment session count if it's a new session
    if (messages.length === 0) {
      setChatSessions(prev => prev + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim() || isLoading || !pdfText) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: userInput.trim() };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setShowContactForm(false);
    
    // Categorize question in the background
    categorizeQuestion(userInput.trim()).then(category => {
        setQuestionStats(prev => ({
            ...prev,
            [category]: (prev[category] || 0) + 1
        }));
    });

    try {
        const responseText = await generateChatResponse(pdfText, userInput.trim());
        const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: responseText };
        setMessages(prev => [...prev, assistantMessage]);

        if (responseText.trim() === "I'm sorry, I don't have that information right now.") {
            setShowContactForm(true);
        }
    } catch (error) {
        const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'system', content: "Sorry, I encountered an error. Please try again." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  }, [userInput, isLoading, pdfText, setMessages, setQuestionStats]);

  const ContactForm = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 text-sm animate-fade-in">
        <p className="font-semibold text-blue-800 mb-2">A customer service representative can get back to you. Please leave your details.</p>
        <div className="space-y-2">
            <input type="text" placeholder="Name" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"/>
            <input type="tel" placeholder="Phone" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"/>
            <input type="email" placeholder="Email" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">Note: This is a demonstration. Contact details are not stored or sent.</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold text-gray-800">Chat with Us</h2>
        <button onClick={() => setView('home')} className="bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold py-2 px-4 rounded-lg transition-colors">
          &larr; Back to Home
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-[70vh]">
        {pdfText && (
          <div className="p-3 text-center bg-blue-50 border-b border-blue-200 rounded-t-xl">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Ready to help!</span> I'll answer based on the latest hotel information.
            </p>
          </div>
        )}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white"><ChatIcon className="w-5 h-5"/></div>}
                <div className={`max-w-sm md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                    msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 
                    msg.role === 'assistant' ? 'bg-gray-200 text-gray-800 rounded-bl-none' : 'bg-red-100 text-red-800 text-center w-full'
                }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600"><UserIcon className="w-5 h-5"/></div>}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white"><ChatIcon className="w-5 h-5"/></div>
                <div className="bg-gray-200 text-gray-800 rounded-2xl rounded-bl-none px-4 py-3">
                    <SpinnerIcon />
                </div>
            </div>
          )}
          {showContactForm && <ContactForm />}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          {!pdfText ? (
            <div className="text-center p-3 rounded-lg bg-yellow-100 text-yellow-800">
              Hotel information not available. Please ask an admin to upload a PDF document.
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about the hotel..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !userInput.trim()}
                className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserView;