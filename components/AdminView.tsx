
import React, { useState, useCallback } from 'react';
import { Role, QuestionStats } from '../types';
import { extractTextFromPdf } from '../services/geminiService';
import useLocalStorage from '../hooks/useLocalStorage';
import { UploadIcon } from './icons/UploadIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';


interface AdminViewProps {
  setView: (view: Role) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ setView }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [, setPdfText] = useLocalStorage<string | null>('pdf_text', null);
  const [chatSessions, setChatSessions] = useLocalStorage<number>('chat_sessions', 0);
  const [questionStats, setQuestionStats] = useLocalStorage<QuestionStats>('question_stats', {});
  const [, setChatHistory] = useLocalStorage('chat_history', []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a PDF file first.' });
      return;
    }
    if (file.type !== 'application/pdf') {
        setMessage({ type: 'error', text: 'Invalid file type. Please upload a PDF.' });
        return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      const extractedText = await extractTextFromPdf(file);
      setPdfText(extractedText);
      
      // Reset stats and history for the new document
      setChatSessions(0);
      setQuestionStats({});
      setChatHistory([]);
      
      setMessage({ type: 'success', text: 'PDF processed successfully! The chatbot is now updated.' });
      setFile(null);
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message || 'An unknown error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDragEvents = (e: React.DragEvent<HTMLLabelElement>, over: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(over);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e, false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      if(droppedFiles[0].type === 'application/pdf') {
        setFile(droppedFiles[0]);
        setMessage(null);
      } else {
        setMessage({ type: 'error', text: 'Invalid file type. Please upload a PDF.' });
      }
    }
  };

  const chartData = Object.entries(questionStats)
    .map(([name, value]) => ({ name, questions: value }))
    .sort((a, b) => b.questions - a.questions);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
        <button onClick={() => setView('home')} className="bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold py-2 px-4 rounded-lg transition-colors">
          &larr; Back to Home
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-2xl font-semibold mb-4 text-gray-700">Update Hotel Information PDF</h3>
        <div className="space-y-4">
          <label 
            htmlFor="pdf-upload"
            onDragEnter={(e) => handleDragEvents(e, true)}
            onDragLeave={(e) => handleDragEvents(e, false)}
            onDragOver={(e) => handleDragEvents(e, true)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
          >
            <UploadIcon className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-gray-500"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-400">PDF only</p>
            <input id="pdf-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
          </label>
          {file && (
            <div className="text-center text-gray-600">
              Selected file: <span className="font-medium">{file.name}</span>
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={isLoading || !file}
            className="w-full flex justify-center items-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <SpinnerIcon /> : 'Upload and Process PDF'}
          </button>
          {message && (
            <div className={`mt-4 text-center p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
      
      {/* Statistics Section */}
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-2xl font-semibold mb-6 text-gray-700">Chatbot Usage Statistics</h3>
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p className="text-lg text-gray-600">Total Chat Sessions</p>
              <p className="text-5xl font-bold text-blue-600">{chatSessions}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p className="text-lg text-gray-600">Total Questions Asked</p>
              <p className="text-5xl font-bold text-blue-600">{Object.values(questionStats).reduce((a, b) => a + b, 0)}</p>
            </div>
        </div>
        <div className="mt-8">
            <h4 className="text-xl font-semibold mb-4 text-gray-600 text-center">Questions by Category</h4>
            {chartData.length > 0 ? (
                 <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="questions" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <p className="text-center text-gray-500 mt-4">No question data yet. Start a chat session to see statistics here.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminView;
