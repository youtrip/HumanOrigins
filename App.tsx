import React, { useState, useEffect, useRef } from 'react';
import { Brain, Flame, MessageSquare, Hammer, Sparkles, ChevronRight, ArrowRight, Send, Loader2 } from 'lucide-react';
import { fetchEvolutionAnalysis, streamChatResponse } from './services/geminiService';
import { EvolutionChart } from './components/EvolutionChart';
import { SingularityResponse, Theory, ChatMessage } from './types';
import { GenerateContentResponse } from '@google/genai';

const DEFAULT_PROMPT = "从猿到人最关键的奇点事件是什么？";

const INITIAL_DATA: SingularityResponse = {
    mainThesis: "认知革命（The Cognitive Revolution）被普遍认为是人类超越其他物种的关键奇点。",
    theories: [],
    timeline: [],
    conclusion: ""
};

function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [analysisData, setAnalysisData] = useState<SingularityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleInitialAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEvolutionAnalysis(DEFAULT_PROMPT);
      setAnalysisData(data);
      setHasStarted(true);
    } catch (err) {
      setError("API Key missing or request failed. Please check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isChatting) return;
    
    const newUserMsg: ChatMessage = { role: 'user', text: inputMessage };
    setMessages(prev => [...prev, newUserMsg]);
    setInputMessage('');
    setIsChatting(true);

    try {
        // Prepare history for context
        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));
        // Add context from main analysis if available
        if (analysisData && history.length === 0) {
             history.unshift({
                role: 'user',
                parts: [{text: `Context: Based on this thesis: "${analysisData.mainThesis}" and conclusion "${analysisData.conclusion}", answer the following.`}]
             }, {
                role: 'model',
                parts: [{text: "Understood. I will answer based on the provided evolutionary context."}]
             });
        }

        const streamResult = await streamChatResponse(history, newUserMsg.text);
        
        let botText = '';
        const botMsgIndex = messages.length + 1; // Position of new bot message
        
        // Add placeholder for bot
        setMessages(prev => [...prev, { role: 'model', text: '' }]);

        for await (const chunk of streamResult) {
            const c = chunk as GenerateContentResponse;
            if (c.text) {
                botText += c.text;
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = { role: 'model', text: botText };
                    return newMsgs;
                });
            }
        }
    } catch (err) {
        setMessages(prev => [...prev, { role: 'model', text: "Error: Could not generate response.", isError: true }]);
    } finally {
        setIsChatting(false);
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Icon mapper
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'brain': return <Brain className="w-8 h-8 text-pink-400" />;
      case 'fire': return <Flame className="w-8 h-8 text-orange-500" />;
      case 'message': return <MessageSquare className="w-8 h-8 text-blue-400" />;
      case 'tool': return <Hammer className="w-8 h-8 text-emerald-400" />;
      default: return <Sparkles className="w-8 h-8 text-yellow-400" />;
    }
  };

  // Intro Screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-space-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?grayscale&blur=2')] opacity-10 bg-cover bg-center pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-space-800 border border-space-700 shadow-[0_0_40px_rgba(251,191,36,0.2)] mb-4 animate-pulse-slow">
             <Brain className="w-10 h-10 text-accent-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight">
            进化奇点
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
            从猿到人，是什么关键事件让我们成为了地球的主宰，同时也掌握了毁灭它的力量？
          </p>
          <p className="text-accent-400 italic text-lg">"The Singularity of Evolution"</p>
          
          <div className="pt-8">
             <button 
                onClick={handleInitialAnalysis}
                disabled={loading}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-accent-500 hover:bg-accent-400 text-space-900 font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.4)]"
             >
               {loading ? (
                 <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    正在分析历史数据...
                 </>
               ) : (
                 <>
                    探索起源
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 </>
               )}
             </button>
             {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  // Main Content
  return (
    <div className="min-h-screen bg-space-900 text-gray-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-space-900/80 backdrop-blur-md border-b border-space-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Brain className="w-6 h-6 text-accent-400" />
             <span className="font-bold text-lg tracking-wide">进化奇点</span>
           </div>
           <button onClick={() => setHasStarted(false)} className="text-sm text-gray-400 hover:text-white transition-colors">
             重置
           </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
        
        {/* Thesis Section */}
        <section className="space-y-6 animate-fade-in-up">
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-space-800 to-space-900 border border-space-700 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <h2 className="text-accent-400 text-sm font-bold uppercase tracking-wider mb-2">核心论点 (Main Thesis)</h2>
                <p className="text-3xl md:text-4xl font-serif font-medium leading-normal text-white">
                    {analysisData?.mainThesis}
                </p>
            </div>
        </section>

        {/* Theories Grid */}
        <section>
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                竞争理论 (Competing Theories)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analysisData?.theories.map((theory, idx) => (
                    <div key={idx} className="group bg-space-800 rounded-xl border border-space-700 p-6 hover:border-accent-500/50 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-space-700 rounded-lg group-hover:bg-space-600 transition-colors">
                                {getIcon(theory.icon)}
                            </div>
                            <div className="text-sm font-mono text-gray-500">
                                Credibility: <span className="text-accent-400">{theory.credibilityScore}/10</span>
                            </div>
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">{theory.title}</h4>
                        <p className="text-gray-400 text-sm mb-4 flex-grow">{theory.shortDescription}</p>
                        <div className="pt-4 border-t border-space-700">
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {theory.fullAnalysis}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* Visualization Section */}
        <section className="bg-space-800/50 rounded-2xl border border-space-700 p-6 md:p-10">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-white">进化轨迹 (The Ascent)</h3>
                <p className="text-gray-400">从生物学适应到全球主宰的影响力指数</p>
            </div>
            {analysisData?.timeline && <EvolutionChart data={analysisData.timeline} />}
        </section>

        {/* Conclusion & Reflection */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
                 <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Flame className="w-6 h-6 text-red-500" />
                    双刃剑 (The Double-Edged Sword)
                 </h3>
                 <div className="prose prose-invert max-w-none">
                     <p className="text-lg text-gray-300 leading-relaxed border-l-4 border-accent-500 pl-6 italic">
                         {analysisData?.conclusion}
                     </p>
                 </div>
                 
                 {/* Interactive Chat */}
                 <div className="mt-8 bg-space-800 rounded-xl border border-space-700 overflow-hidden flex flex-col h-[500px]">
                    <div className="p-4 border-b border-space-700 bg-space-800/80">
                        <h4 className="font-semibold text-gray-200 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            与 AI 人类学家对话
                        </h4>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 mt-20">
                                <p>对某个理论有疑问？</p>
                                <p className="text-sm">试着问："为什么认知革命比火更重要？"</p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                    msg.role === 'user' 
                                    ? 'bg-accent-600 text-white rounded-tr-none' 
                                    : 'bg-space-700 text-gray-200 rounded-tl-none border border-space-600'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 border-t border-space-700 bg-space-800">
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="输入你的问题..."
                                className="flex-1 bg-space-900 border border-space-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                            />
                            <button 
                                onClick={handleSendMessage}
                                disabled={isChatting || !inputMessage.trim()}
                                className="p-2 bg-accent-500 text-space-900 rounded-lg hover:bg-accent-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isChatting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                 </div>
            </div>
            
            <div className="relative hidden lg:block h-[600px] rounded-2xl overflow-hidden shadow-2xl border border-space-700 group">
                 <img 
                    src="https://picsum.photos/800/1200?grayscale" 
                    alt="Human Silhouette" 
                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-space-900/50 to-transparent"></div>
                 <div className="absolute bottom-10 left-10 right-10 text-gray-300">
                     <h4 className="text-xl font-bold text-white mb-2">进化的终章？</h4>
                     <p>
                         那个让我们学会使用工具、语言和虚构故事的大脑，现在创造了能像它自己一样思考的机器。我们是否正在接近下一个奇点？
                     </p>
                 </div>
            </div>
        </section>

      </main>
    </div>
  );
}

export default App;
