import { useState, useRef } from "react";
import "./App.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import apiKey from "./data";
import html2pdf from "html2pdf.js";

function App() {
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState("");
  const [showContent, setShowContent] = useState(false);

  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("");
  const [duration, setDuration] = useState("");

  const key = apiKey;
  const genAI = new GoogleGenerativeAI(key);

  const contentRef = useRef();

  const fetchData = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const fullPrompt = `
        I'm a teacher for grade ${grade}th, I want to teach about ${topic} for ${duration} minutes.
      `;
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      let text = await response.text();
      text = text.replace(/\*/g, "");
      setApiData(text);
      setLoading(false);
      setShowContent(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setShowContent(false);
    fetchData();
  };

  const handleRegenerate = () => {
    setLoading(true);
    setShowContent(false);
    fetchData();
  };

  const handleDownloadPdf = () => {
    const element = contentRef.current;
    html2pdf().from(element).save();
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Learning Management System</h1>
      <h3 className="text-xl mb-6">Lesson Plan Generator</h3>
      <div className="form-container mb-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Topic</label>
            <input
              type="text"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your topic here"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade</label>
            <input
              type="text"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Enter the grade here"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration</label>
            <input
              type="text"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Enter the duration here"
              required
            />
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700">Submit</button>
        </form>
      </div>
      {loading ? (
        <div className="flex justify-center items-center">
          <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2">Loading...</span>
        </div>
      ) : (
        showContent && (
          <div className="response-container mt-4">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Generated Content</h2>
              <div ref={contentRef} className="p-4 rounded-md border border-gray-100 bg-gray-300">
                <pre className="whitespace-pre-wrap text-gray-800 text-xl font-sans">{apiData}</pre>
              </div>
              <button 
                onClick={handleRegenerate} 
                className="mt-4 bg-indigo-600 text-white px-4 py-2 mr-4 rounded-md shadow-sm hover:bg-indigo-700"
              >
                Regenerate
              </button>
              <button
                onClick={handleDownloadPdf}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-700"
              >
                Download PDF
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default App;
