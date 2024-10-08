import React, { useState, useEffect } from "react";
import { CodeiumEditor } from "@codeium/react-code-editor";
import { userAtom } from "../atoms/userAtom";
import { useRecoilValue } from "recoil";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // Import spinner icon

const CodeEditor: React.FC = () => {
  const [code, setCode] = useState<any>("// Write your code here...");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState<string[]>([]); // Output logs
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const user = useRecoilValue(userAtom);

  useEffect(() => {
    if (!socket) {
      const ws = new WebSocket(`ws://localhost:5000`, user.id); // Connect to WebSocket server
      
      setSocket(ws);
  
      ws.onopen = () => {
        console.log("Connected to WebSocket");
      };
  
      ws.onmessage = (event) => {
        const data = event.data;
        setOutput((prevOutput) => [...prevOutput, data]); // Append real-time output
      };
  
      ws.onclose = () => {
        console.log("WebSocket connection closed");
      };
  
      return () => {
        ws.close(); // Cleanup WebSocket connection on unmount
      };
    }
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    const submission = {
      code,
      language,
      userId: user?.id,
    };

    socket?.send(user?.id ? user.id : "");
    
    console.log(submission);
    const res = await fetch("http://localhost:3000/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submission),
    });
  
    setIsLoading(false);
  
    if (!res.ok) {
      setOutput((prevOutput) => [
        ...prevOutput,
        "Error submitting code. Please try again.",
      ]);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-blue-400 mb-6 text-center">Code Playground</h1>

        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg transition duration-300"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        {/* Code Editor */}
        <div className="border border-gray-700 rounded-lg overflow-hidden shadow-lg">
          <CodeiumEditor
            value={code}
            language={language}
            theme="vs-dark"
            onChange={setCode}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 mt-4 rounded-lg shadow-lg transition-transform duration-300 transform ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <AiOutlineLoading3Quarters className="animate-spin" />
                <span>Submitting...</span>
              </span>
            ) : (
              "Submit Code"
            )}
          </button>
        </div>

        {/* Output Section */}
        <h2 className="text-xl font-bold text-gray-400 mt-8">Output:</h2>
        <div className="bg-gray-800 text-green-400 p-4 rounded-lg mt-2 h-64 overflow-y-auto shadow-lg space-y-2">
          {output.length > 0 ? (
            output.map((line, index) => (
              <pre key={index} className="whitespace-pre-wrap">{line}</pre>
            ))
          ) : (
            <p className="text-gray-500">No output yet. Submit your code to see results.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
