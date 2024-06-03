import { useState } from "react";
import "./App.css";
import { GoogleGenerativeAI } from "@google/generative-ai";

function App() {
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // form states
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("");
  const [duration, setDuration] = useState("");

  // api key
  const genAI = new GoogleGenerativeAI("AIzaSyBYqmeame9V10lbKVwD9NObTRn3WwOBm3M");

  // Function to fetch image URL based on topic
  const fetchImage = async (topic) => {
    try {
      const response = await fetch(`https://pixabay.com/api/?key=44201396-8aaada7e3a6aaf141c00ce9d3&q=${topic}&image_type=photo`);
      const data = await response.json();
      if (data.hits.length > 0) {
        setImageUrl(data.hits[0].webformatURL);
      } else {
        setImageUrl("");
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  // Response from API
  const fetchData = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const fullPrompt = `
        I'm a teacher for grade ${grade}th, I want to teach about ${topic} for ${duration} minutes.
      `;
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = await response.text();
      await fetchImage(topic);
      setApiData(text);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchData();
  };

  const handleRegenerate = () => {
    setLoading(true);
    fetchData();
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Learning Management System</h1>
      <h3 className="text-xl mb-6">Custom AI Query</h3>
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
      <div className="response-container mt-4">
        {loading ? (
          <div className="flex justify-center items-center">
            <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Generated Content</h2>
            <pre className="bg-gray-100 p-4 rounded-md shadow-inner whitespace-pre-wrap text-sm text-gray-700">{apiData}</pre>
            {imageUrl && (
              <div className="mt-4">
                <img src={imageUrl} alt={topic} className="w-full h-auto rounded-md shadow-md" />
              </div>
            )}
            <button 
              onClick={handleRegenerate} 
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700"
            >
              Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
