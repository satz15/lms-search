import { useState, useRef } from "react";
import "./App.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import apiKey from "./data";
import html2pdf from "html2pdf.js";
import PptxGenJS from "pptxgenjs";

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
      const model = await genAI.getGenerativeModel({ model: "gemini-pro" });
      const fullPrompt = `
        I'm a teacher for grade ${grade}th, I want to teach about ${topic} for ${duration} minutes.
      `;
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = await response.text();
      const cleanedText = text.replace(/\*/g, "");
      setApiData(cleanedText);
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

  const handleDownloadPpt = () => {
    const pptx = new PptxGenJS();
    
    // Split the content into lines
    const lines = apiData.split("\n");
  
    // Variables to store the topic and its definition
    let topicTitle = lines[0]; // Assuming the first line is the main topic
    let topicDefinition = '';
    let subtopicStartIndex = 1;
  
    // Find the definition of the topic until a subtopic keyword is encountered
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.match(/^[A-Z]/)) { // Assuming subtopics start with a capital letter
        subtopicStartIndex = i;
        break;
      }
      topicDefinition += line + '\n';
    }
  
    // Add the main information to the first slide
    const slide1 = pptx.addSlide();
    slide1.addText(`Lesson: ${topicTitle}`, { x: 1, y: 0.5, fontSize: 24, color: '363636', fontFace: 'Arial' });
    slide1.addText(`Time: ${duration}`, { x: 1, y: 1, fontSize: 18, color: '363636', fontFace: 'Arial' });
    slide1.addText(`Grade: ${grade}`, { x: 1, y: 1.5, fontSize: 18, color: '363636', fontFace: 'Arial' });
    slide1.addText(`Subject: ${topic}`, { x: 1, y: 2, fontSize: 18, color: '363636', fontFace: 'Arial' });
    slide1.addText(topicDefinition.trim(), { x: 1, y: 2.5, fontSize: 18, color: '363636', fontFace: 'Arial' });
  
    // Process the rest of the lines to create subtopic slides
    const subtopics = lines.slice(subtopicStartIndex);
    let currentSubtopic = '';
    let currentContent = '';
  
    const addContentToSlide = (pptx, title, content) => {
      const maxHeight = 5; // Maximum height available for content
      const titleHeight = 1; // Height reserved for the title
      const fontSize = 18; // Font size for content
      const lineHeight = 0.7; // Estimated height for each line of text
  
      const contentLines = content.split('\n');
      let slide = pptx.addSlide();
      slide.addText(title, { x: 1, y: 1, fontSize: 24, color: '363636', fontFace: 'Arial' });
  
      let y = titleHeight + 1.5; // Initial y position after the title
      contentLines.forEach((line, index) => {
        if (y + lineHeight > maxHeight) {
          // Add new slide if current slide exceeds max height
          slide = pptx.addSlide();
          slide.addText(title, { x: 1, y: 1, fontSize: 24, color: '363636', fontFace: 'Arial' });
          y = titleHeight + 1.5; // Reset y position for new slide
        }
        slide.addText(line, { x: 1, y: y, fontSize: fontSize, color: '363636', fontFace: 'Arial' });
        y += lineHeight; // Increment y position
      });
    };
  
    subtopics.forEach(line => {
      if (line.match(/^[A-Z]/)) { // Assuming each subtopic starts with a capital letter
        if (currentSubtopic) {
          // Add the current subtopic and its content to a new slide
          addContentToSlide(pptx, currentSubtopic, currentContent.trim());
        }
        // Start a new subtopic
        currentSubtopic = line;
        currentContent = '';
      } else {
        currentContent += line + '\n';
      }
    });
  
    // Add the last subtopic and its content to a new slide
    if (currentSubtopic) {
      addContentToSlide(pptx, currentSubtopic, currentContent.trim());
    }
  
    // Save the PowerPoint file
    pptx.writeFile({ fileName: `${topic}_Lesson_Plan.pptx` });
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
              <div ref={contentRef} className="p-4 rounded-md border border-gray-100 ">
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
                className="mt-4 bg-green-600 text-white px-4 py-2 mr-4 rounded-md shadow-sm hover:bg-green-700"
              >
                Download PDF
              </button>
              <button
                onClick={handleDownloadPpt}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700"
              >
                Download PPT
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default App;
