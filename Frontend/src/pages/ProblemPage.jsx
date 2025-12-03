import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';
import { 
  Play, 
  Send, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  Maximize2,
  Code2,
  FileText,
  Clock,
  Cpu
} from 'lucide-react';

const ProblemPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Editor State
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [theme, setTheme] = useState('vs-dark');
  
  // Execution State
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('description'); // description, solutions
  const [activeCase, setActiveCase] = useState(0); // 0, 1, 2 (index of test case)

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const { data } = await axiosClient.get(`/problem/problemById/${id}`);
        setProblem(data);
        
        // Set initial code for default language
        const defaultStartCode = data.startCode.find(sc => sc.language === language);
        setCode(defaultStartCode ? defaultStartCode.initialCode : '// Write your code here');
      } catch (error) {
        console.error("Failed to load problem", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  // Handle Language Switch
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    const langCode = problem.startCode.find(sc => sc.language === newLang);
    setCode(langCode ? langCode.initialCode : '');
  };

  // Run Code (Visible Test Cases)
  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const { data } = await axiosClient.post(`/submission/run/${id}`, {
        code,
        language,
        problemId: id
      });
      setOutput({ type: 'run', results: data });
    } catch (error) {
      setOutput({ type: 'error', message: error.response?.data?.message || "Execution Failed" });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Code (Hidden Test Cases)
  const handleSubmit = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const { data } = await axiosClient.post(`/submission/submit/${id}`, {
        code,
        language,
        problemId: id
      });
      setOutput({ type: 'submit', result: data });
    } catch (error) {
      setOutput({ type: 'error', message: error.response?.data?.message || "Submission Failed" });
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) return <div className="h-screen bg-[#1a1a1a] flex items-center justify-center text-white">Loading Problem Workspace...</div>;

  return (
    <div className="h-screen flex flex-col bg-[#1a1a1a] text-gray-300 overflow-hidden">
      <Navbar />
      
      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Description */}
        <div className="w-1/2 flex flex-col border-r border-gray-700 bg-[#262626]">
          {/* Tabs */}
          <div className="flex bg-[#333] border-b border-gray-700">
            <button 
              onClick={() => setActiveTab('description')}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'description' ? 'bg-[#262626] text-white border-t-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
            >
              <FileText size={16} /> Description
            </button>
            <button 
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'submissions' ? 'bg-[#262626] text-white border-t-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
            >
              <Clock size={16} /> Submissions
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{problem.title}</h1>
                  <div className="flex gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-opacity-20 ${
                      problem.difficulty === 'easy' ? 'text-green-400 bg-green-400' :
                      problem.difficulty === 'medium' ? 'text-yellow-400 bg-yellow-400' :
                      'text-red-400 bg-red-400'
                    }`}>
                      {problem.difficulty}
                    </span>
                    {problem.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{problem.description}</p>
                </div>

                {/* Examples */}
                <div className="space-y-4">
                  {problem.visibleTestCases.map((testCase, idx) => (
                    <div key={idx} className="bg-[#333] rounded-lg p-4">
                      <h3 className="text-white font-semibold mb-2">Example {idx + 1}:</h3>
                      <div className="space-y-2 text-sm font-mono">
                        <div><span className="text-gray-400">Input:</span> <span className="text-white">{testCase.input}</span></div>
                        <div><span className="text-gray-400">Output:</span> <span className="text-white">{testCase.output}</span></div>
                        {testCase.explanation && <div><span className="text-gray-400">Explanation:</span> <span className="text-gray-300">{testCase.explanation}</span></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Editor & Console */}
        <div className="w-1/2 flex flex-col h-full">
          
          {/* Editor Header */}
          <div className="h-12 bg-[#262626] border-b border-gray-700 flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Code2 size={16} className="absolute left-2 top-2.5 text-gray-400" />
                <select 
                  value={language} 
                  onChange={handleLanguageChange}
                  className="bg-[#333] text-white text-sm pl-8 pr-8 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="c++">C++</option>
                  <option value="java">Java</option>
                </select>
                <ChevronDown size={14} className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCode(problem.startCode.find(sc => sc.language === language)?.initialCode)}
                className="p-1.5 hover:bg-[#333] rounded text-gray-400 hover:text-white transition" 
                title="Reset Code"
              >
                <RotateCcw size={16} />
              </button>
              <button className="p-1.5 hover:bg-[#333] rounded text-gray-400 hover:text-white transition" title="Settings">
                <Maximize2 size={16} />
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language === 'c++' ? 'cpp' : language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value)}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16 }
              }}
            />
          </div>

          {/* Bottom Panel: Test Cases / Results */}
          <div className="h-64 bg-[#262626] border-t border-gray-700 flex flex-col">
            
            {/* Console Toolbar */}
            <div className="h-10 bg-[#333] flex items-center px-4 gap-6 border-b border-gray-700">
              <button 
                onClick={() => setOutput(null)}
                className={`text-sm font-medium flex items-center gap-2 ${!output ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <CheckCircle2 size={14} className="text-green-500" /> Test Cases
              </button>
              <button 
                className={`text-sm font-medium flex items-center gap-2 ${output ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Cpu size={14} className={output?.type === 'error' ? 'text-red-500' : 'text-blue-500'} /> 
                {output?.type === 'submit' ? 'Submission Result' : 'Run Result'}
              </button>
              
              <div className="ml-auto flex items-center gap-3">
                <button 
                  onClick={handleRun}
                  disabled={isRunning}
                  className="btn btn-sm bg-[#333] hover:bg-[#444] border-gray-600 text-gray-300 gap-2"
                >
                  <Play size={14} /> Run
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isRunning}
                  className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none gap-2"
                >
                  {isRunning ? <span className="loading loading-spinner loading-xs"></span> : <Send size={14} />} 
                  Submit
                </button>
              </div>
            </div>

            {/* Console Content */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
              {isRunning ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 animate-pulse">
                  <Cpu size={32} className="mb-2" />
                  <span>Running code on Judge0...</span>
                </div>
              ) : output ? (
                // RESULT VIEW
                <div className="space-y-4">
                  {output.type === 'error' && (
                    <div className="text-red-400 p-3 bg-red-900/20 rounded border border-red-900/50">
                      <h3 className="font-bold flex items-center gap-2"><AlertCircle size={16} /> Error</h3>
                      <pre className="mt-2 text-xs whitespace-pre-wrap">{output.message}</pre>
                    </div>
                  )}

                  {output.type === 'run' && (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        {output.results.map((res, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setActiveCase(idx)}
                            className={`px-3 py-1 rounded text-xs transition ${
                              res.status.id === 3 ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-red-900/30 text-red-400 border-red-800'
                            } border ${activeCase === idx ? 'ring-1 ring-white' : ''}`}
                          >
                            Case {idx + 1}
                          </button>
                        ))}
                      </div>
                      
                      {output.results[activeCase] && (
                        <div className="space-y-2">
                          <div>
                            <span className="text-gray-500 block text-xs mb-1">Status</span>
                            <span className={output.results[activeCase].status.id === 3 ? 'text-green-400' : 'text-red-400'}>
                              {output.results[activeCase].status.description}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-xs mb-1">Output</span>
                            <div className="bg-[#111] p-3 rounded text-gray-300">
                              {output.results[activeCase].stdout || "No output"}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-xs mb-1">Expected</span>
                            <div className="bg-[#111] p-3 rounded text-gray-300">
                              {output.results[activeCase].expected_output || "No expected output"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {output.type === 'submit' && (
                    <div className="text-center py-8">
                        <h2 className={`text-2xl font-bold mb-2 ${output.result.status === 'accepted' ? 'text-green-500' : 'text-red-500'}`}>
                            {output.result.status === 'accepted' ? 'Accepted' : 'Wrong Answer'}
                        </h2>
                        <div className="flex justify-center gap-8 mt-4 text-gray-400">
                            <div>
                                <span className="block text-xs uppercase tracking-wider">Runtime</span>
                                <span className="text-lg text-white font-mono">{output.result.runtime} ms</span>
                            </div>
                            <div>
                                <span className="block text-xs uppercase tracking-wider">Memory</span>
                                <span className="text-lg text-white font-mono">{output.result.memory} KB</span>
                            </div>
                            <div>
                                <span className="block text-xs uppercase tracking-wider">Passed</span>
                                <span className="text-lg text-white font-mono">{output.result.testCasesPassed} / {output.result.testCasesTotal}</span>
                            </div>
                        </div>
                    </div>
                  )}
                </div>
              ) : (
                // DEFAULT TEST CASE VIEW
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {problem.visibleTestCases.map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveCase(idx)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                          activeCase === idx 
                            ? 'bg-[#444] text-white' 
                            : 'bg-[#333] text-gray-400 hover:bg-[#3d3d3d]'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Input</label>
                      <div className="bg-[#333] p-3 rounded-lg text-gray-300">
                        {problem.visibleTestCases[activeCase]?.input}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Expected Output</label>
                      <div className="bg-[#333] p-3 rounded-lg text-gray-300">
                        {problem.visibleTestCases[activeCase]?.output}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;