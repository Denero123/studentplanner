import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  RotateCcw, 
  ArrowRight, 
  Trophy, 
  Play,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  score: string;
  category: string;
  timestamp: string;
}

interface DailyPracticeProps {
  navigate: (path: string) => void;
}

export const DailyPractice: React.FC<DailyPracticeProps> = ({ navigate }) => {
  const { success, error: toastError } = useToast();
  const { user } = useAuth();

  const [activeCategory, setActiveCategory] = useState<'Coding' | 'Web Development' | 'AI & Machine Learning' | 'Cybersecurity'>('Coding');
  const [leaderboardFilter, setLeaderboardFilter] = useState<'Today' | 'All time'>('Today');

  // Quiz Player State
  const [quizRunning, setQuizRunning] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  // Leaderboard Data State
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { id: '1', name: 'Aakarshit Srivastava', score: '10/10', category: 'Coding', timestamp: '2m ago' },
    { id: '2', name: 'Harshit Singh', score: '9/10', category: 'Web Development', timestamp: '15m ago' },
    { id: '3', name: 'Alex Parker', score: '9/10', category: 'AI & ML', timestamp: '32m ago' },
    { id: '4', name: 'Samantha Vance', score: '8/10', category: 'Cybersecurity', timestamp: '1h ago' },
    { id: '5', name: 'David Chen', score: '8/10', category: 'Coding', timestamp: '2h ago' }
  ]);

  const categories = ['Coding', 'Web Development', 'AI & Machine Learning', 'Cybersecurity'] as const;

  const questionsBank: Record<string, Question[]> = {
    'Coding': [
      {
        id: 1,
        question: 'What is the average time complexity of QuickSort in the worst-case scenario?',
        options: ['O(n log n)', 'O(n^2)', 'O(n)', 'O(log n)'],
        correctIndex: 1,
        explanation: 'QuickSort has a worst-case time complexity of O(n^2) when pivot selection is unbalanced.'
      },
      {
        id: 2,
        question: 'Which data structure operates on a Last-In, First-Out (LIFO) principle?',
        options: ['Queue', 'Stack', 'Array', 'Binary Tree'],
        correctIndex: 1,
        explanation: 'A Stack is a LIFO data structure where elements are added and removed from the top.'
      },
      {
        id: 3,
        question: 'In object-oriented programming, what keyword inherits properties from a parent class?',
        options: ['implements', 'extends', 'inherits', 'super'],
        correctIndex: 1,
        explanation: 'The "extends" keyword is used in JavaScript/TypeScript/Java for class inheritance.'
      },
      {
        id: 4,
        question: 'What is the primary purpose of a hash function in computer science?',
        options: ['Encryption', 'Sorting data', 'Mapping data to fixed-size values for fast O(1) lookup', 'Memory compression'],
        correctIndex: 2,
        explanation: 'Hash functions map keys to hash table indices for rapid retrieval.'
      },
      {
        id: 5,
        question: 'Which sorting algorithm is considered stable by default?',
        options: ['QuickSort', 'HeapSort', 'MergeSort', 'SelectionSort'],
        correctIndex: 2,
        explanation: 'MergeSort preserves the relative order of equal elements.'
      },
      {
        id: 6,
        question: 'What does API stand for in software engineering?',
        options: ['Advanced Programming Interface', 'Application Programming Interface', 'Automated Program Integration', 'Application Protocol Interaction'],
        correctIndex: 1,
        explanation: 'API stands for Application Programming Interface.'
      },
      {
        id: 7,
        question: 'Which of the following is a non-linear data structure?',
        options: ['Queue', 'Stack', 'Graph', 'Linked List'],
        correctIndex: 2,
        explanation: 'Graphs and Trees are non-linear data structures.'
      },
      {
        id: 8,
        question: 'What is recursion in programming?',
        options: ['An infinite loop', 'A function calling itself to solve smaller subproblems', 'Passing pointers', 'Dynamic memory allocation'],
        correctIndex: 1,
        explanation: 'Recursion occurs when a function calls itself directly or indirectly.'
      },
      {
        id: 9,
        question: 'What is the space complexity of standard recursive Fibonacci without memoization?',
        options: ['O(1)', 'O(n)', 'O(2^n)', 'O(log n)'],
        correctIndex: 1,
        explanation: 'The call stack depth is proportional to n, resulting in O(n) space complexity.'
      },
      {
        id: 10,
        question: 'Which design pattern ensures a class has only one instance and provides global access?',
        options: ['Observer', 'Factory', 'Singleton', 'Strategy'],
        correctIndex: 2,
        explanation: 'The Singleton pattern restricts class instantiation to a single object instance.'
      }
    ],
    'Web Development': [
      {
        id: 1,
        question: 'Which CSS property controls the order of flex items in a flex container?',
        options: ['z-index', 'order', 'flex-direction', 'align-self'],
        correctIndex: 1,
        explanation: 'The "order" property specifies the order in which a flex item appears inside its flex container.'
      },
      {
        id: 2,
        question: 'What does DOM stand for in web development?',
        options: ['Document Object Model', 'Data Object Management', 'Digital Ordinance Method', 'Document Oriented Markup'],
        correctIndex: 0,
        explanation: 'DOM stands for Document Object Model.'
      },
      {
        id: 3,
        question: 'Which HTTP status code indicates a successful request and resource creation?',
        options: ['200 OK', '201 Created', '204 No Content', '301 Moved Permanently'],
        correctIndex: 1,
        explanation: 'HTTP 201 Created signifies successful creation of a resource.'
      },
      {
        id: 4,
        question: 'What is JSX in React?',
        options: ['A database query language', 'A JavaScript syntax extension allowing HTML-like markup', 'A CSS preprocessor', 'An HTTP routing protocol'],
        correctIndex: 1,
        explanation: 'JSX allows writing HTML-like syntax directly in JavaScript.'
      },
      {
        id: 5,
        question: 'Which hook in React is used for managing component state?',
        options: ['useEffect', 'useMemo', 'useState', 'useRef'],
        correctIndex: 2,
        explanation: 'useState is the primary React Hook for component state management.'
      },
      {
        id: 6,
        question: 'What is the purpose of semantic HTML tags like <article> and <section>?',
        options: ['To add animations', 'To improve accessibility and SEO', 'To enforce strict CSS rules', 'To connect to databases'],
        correctIndex: 1,
        explanation: 'Semantic tags clearly describe their meaning to browsers and search engines.'
      },
      {
        id: 7,
        question: 'Which CSS unit is relative to the font-size of the root element?',
        options: ['em', 'rem', 'vw', 'px'],
        correctIndex: 1,
        explanation: 'rem stands for root em.'
      },
      {
        id: 8,
        question: 'What is CORS in web security?',
        options: ['Cross-Origin Resource Sharing', 'Cascading Object Rendering System', 'Client-Side Routing Service', 'Common Output Request Schema'],
        correctIndex: 0,
        explanation: 'CORS controls resource sharing across different domain origins.'
      },
      {
        id: 9,
        question: 'Which method is used in JavaScript to parse a JSON string into an object?',
        options: ['JSON.stringify()', 'JSON.parse()', 'JSON.object()', 'JSON.convert()'],
        correctIndex: 1,
        explanation: 'JSON.parse() converts JSON strings into JavaScript objects.'
      },
      {
        id: 10,
        question: 'What is Tailwind CSS primarily known for?',
        options: ['Runtime CSS-in-JS', 'Utility-first CSS framework', 'Object-oriented compiler', 'Sass framework'],
        correctIndex: 1,
        explanation: 'Tailwind CSS is a utility-first CSS framework.'
      }
    ],
    'AI & Machine Learning': [
      {
        id: 1,
        question: 'What is the primary purpose of an activation function in neural networks?',
        options: ['To initialize weights', 'To introduce non-linearity', 'To reduce dataset size', 'To normalize inputs'],
        correctIndex: 1,
        explanation: 'Activation functions enable neural networks to learn non-linear patterns.'
      },
      {
        id: 2,
        question: 'Which loss function is commonly used for binary classification?',
        options: ['Mean Squared Error', 'Binary Cross-Entropy', 'Categorical Cross-Entropy', 'Huber Loss'],
        correctIndex: 1,
        explanation: 'Binary Cross-Entropy evaluates probability outputs between 0 and 1.'
      },
      {
        id: 3,
        question: 'What is overfitting in machine learning?',
        options: ['Good training accuracy, poor test generalization', 'Model is too simple', 'Training takes too long', 'Missing data values'],
        correctIndex: 0,
        explanation: 'Overfitting occurs when a model memorizes training noise rather than general patterns.'
      },
      {
        id: 4,
        question: 'What does LLM stand for in modern AI?',
        options: ['Large Language Model', 'Linear Logic Machine', 'Labeled Learning Matrix', 'Latent Language Module'],
        correctIndex: 0,
        explanation: 'LLM stands for Large Language Model.'
      },
      {
        id: 5,
        question: 'Which algorithm builds an ensemble of multiple decision trees?',
        options: ['Linear Regression', 'K-Means', 'Random Forest', 'Perceptron'],
        correctIndex: 2,
        explanation: 'Random Forest builds multiple decision trees to improve accuracy and robustness.'
      },
      {
        id: 6,
        question: 'What is gradient descent used for?',
        options: ['Data visualization', 'Optimizing model weights to minimize loss', 'Tokenizing text', 'Calculating precision'],
        correctIndex: 1,
        explanation: 'Gradient descent minimizes loss by iteratively adjusting model weights.'
      },
      {
        id: 7,
        question: 'What key mechanism was introduced by the Transformer architecture in 2017?',
        options: ['Convolution', 'Recurrent gating', 'Self-Attention', 'Max Pooling'],
        correctIndex: 2,
        explanation: 'Self-attention allows models to weigh relationships between all tokens simultaneously.'
      },
      {
        id: 8,
        question: 'What is unsupervised learning?',
        options: ['Learning with labeled targets', 'Learning patterns from unlabeled data', 'Reinforcement learning', 'Transfer learning'],
        correctIndex: 1,
        explanation: 'Unsupervised learning discovers structure in unlabeled datasets.'
      },
      {
        id: 9,
        question: 'What is the purpose of feature normalization in ML?',
        options: ['To remove outliers', 'To scale features to a similar range for stable gradient descent', 'To convert text to numbers', 'To split train sets'],
        correctIndex: 1,
        explanation: 'Normalization prevents features with larger numerical ranges from dominating.'
      },
      {
        id: 10,
        question: 'What is RAG (Retrieval-Augmented Generation)?',
        options: ['A data cleaning tool', 'Combining external document retrieval with LLMs for factual grounding', 'A reward model', 'Model quantization'],
        correctIndex: 1,
        explanation: 'RAG grounds LLM generation in retrieved external documents.'
      }
    ],
    'Cybersecurity': [
      {
        id: 1,
        question: 'What is the primary difference between symmetric and asymmetric encryption?',
        options: ['Symmetric uses one shared key; asymmetric uses public/private key pairs', 'Asymmetric is faster', 'Symmetric is only for passwords', 'No difference'],
        correctIndex: 0,
        explanation: 'Symmetric uses a single shared key; asymmetric uses a key pair.'
      },
      {
        id: 2,
        question: 'What does the CIA triad stand for in information security?',
        options: ['Confidentiality, Integrity, Availability', 'Control, Isolation, Access', 'Client, Instance, Application', 'Certificate, Identity, Authentication'],
        correctIndex: 0,
        explanation: 'The CIA triad comprises Confidentiality, Integrity, and Availability.'
      },
      {
        id: 3,
        question: 'What is a SQL injection (SQLi) attack?',
        options: ['Overloading database memory', 'Inserting malicious SQL statements into input fields', 'Stealing hardware', 'Cracking Wi-Fi'],
        correctIndex: 1,
        explanation: 'SQLi manipulates backend database queries via unvalidated user input.'
      },
      {
        id: 4,
        question: 'What is Multi-Factor Authentication (MFA)?',
        options: ['Using two passwords', 'Requiring two or more independent credential factors', 'Logging in from multiple devices', 'Encrypting files twice'],
        correctIndex: 1,
        explanation: 'MFA combines independent categories of authentication (knowledge, possession, inherence).'
      },
      {
        id: 5,
        question: 'What is a DDoS attack?',
        options: ['Decrypting packets', 'Distributed Denial of Service overwhelming systems with traffic from multiple sources', 'Deleting records', 'Stealing keys'],
        correctIndex: 1,
        explanation: 'DDoS floods targets with traffic from botnets to cause service outages.'
      },
      {
        id: 6,
        question: 'What is phishing?',
        options: ['Port scanning', 'Deceiving individuals into revealing sensitive info via fraudulent messages', 'Packet sniffing', 'Installing ransomware'],
        correctIndex: 1,
        explanation: 'Phishing mimics trusted entities to harvest credentials.'
      },
      {
        id: 7,
        question: 'What is HTTPS?',
        options: ['HyperText Transfer Protocol Secure using TLS/SSL encryption', 'High Transfer Protocol', 'HyperText Transmission Standard', 'Host Transfer Protocol'],
        correctIndex: 0,
        explanation: 'HTTPS encrypts web traffic using TLS/SSL.'
      },
      {
        id: 8,
        question: 'What is a zero-day vulnerability?',
        options: ['A bug fixed in zero seconds', 'An unknown vulnerability exploited before a patch is available', 'A password expiring in zero days', 'A firewall with zero rules'],
        correctIndex: 1,
        explanation: 'Zero-day exploits target vulnerabilities unknown to the software vendor.'
      },
      {
        id: 9,
        question: 'What is the purpose of a network firewall?',
        options: ['To extinguish server fires', 'To filter incoming and outgoing traffic based on security rules', 'To speed up internet', 'To store backups'],
        correctIndex: 1,
        explanation: 'Firewalls inspect and control network traffic based on predefined security policies.'
      },
      {
        id: 10,
        question: 'What is social engineering in cybersecurity?',
        options: ['Building secure networks', 'Manipulating people into performing actions or divulging confidential data', 'Marketing', 'Penetration testing'],
        correctIndex: 1,
        explanation: 'Social engineering exploits human psychology rather than technical flaws.'
      }
    ]
  };

  const currentQuestions = questionsBank[activeCategory] || questionsBank['Coding'];

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizRunning && !quizCompleted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && quizRunning && !quizCompleted) {
      handleFinishQuiz(score);
    }
    return () => clearInterval(timer);
  }, [quizRunning, quizCompleted, timeLeft, score]);

  const handleStartQuiz = () => {
    setQuizRunning(true);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
    setTimeLeft(600);
    success(`⚡ Started ${activeCategory} Quiz!`);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQuestions[currentQuestionIndex].correctIndex;
    if (isCorrect) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      handleFinishQuiz(score + (selectedOption === currentQuestions[currentQuestionIndex].correctIndex ? 0 : 0));
    }
  };

  const handleFinishQuiz = async (finalScore: number) => {
    setQuizCompleted(true);
    setQuizRunning(false);
    success(`🎉 Quiz completed! Score: ${finalScore}/10`);

    const studentName = user?.name || user?.email?.split('@')[0] || 'Anonymous Student';
    const newEntry: LeaderboardEntry = {
      id: 'score-' + Date.now(),
      name: studentName,
      score: `${finalScore}/10`,
      category: activeCategory,
      timestamp: 'Just now'
    };

    setLeaderboard(prev => [newEntry, ...prev]);

    // Try inserting into Supabase if quiz_scores table exists
    try {
      await supabase.from('quiz_scores').insert([
        {
          student_name: studentName,
          score: finalScore,
          category: activeCategory,
          created_at: new Date().toISOString()
        }
      ]);
    } catch (err) {}
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Background code watermarks */}
      <div className="absolute top-16 left-12 text-slate-500 font-mono text-xs opacity-10 pointer-events-none select-none animate-float-slow">{"{}"}</div>
      <div className="absolute top-32 right-20 text-slate-500 font-mono text-xs opacity-10 pointer-events-none select-none animate-float-reverse">{"div"}</div>
      <div className="absolute bottom-24 left-20 text-slate-500 font-mono text-xs opacity-10 pointer-events-none select-none animate-drift">{"npm"}</div>
      <div className="absolute bottom-40 right-16 text-slate-500 font-mono text-xs opacity-10 pointer-events-none select-none animate-float-slow">{"fs"}</div>

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 border border-cyan-500/30 text-cyan-400 bg-cyan-950/20 text-xs px-3 py-1 rounded-full">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>[ 🏅 DAILY PRACTICE ]</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-center mt-3 text-white">
            Build. Test. Improve.
          </h1>

          <p className="text-slate-400 text-sm sm:text-base text-center mt-2 max-w-xl mx-auto">
            Take a 10-question technology quiz, track your score, and compete on the leaderboard.
          </p>
        </div>

        {/* Quiz Category Tabs & Main Challenge Card */}
        <div className="max-w-3xl mx-auto mt-8 space-y-4">
          
          {/* A. Category Pill Tabs */}
          <div className="bg-[#0D1526] p-1.5 rounded-2xl border border-white/5 flex flex-wrap gap-2 justify-center">
            {categories.map(cat => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setQuizRunning(false);
                    setQuizCompleted(false);
                  }}
                  className={`px-5 py-2.5 rounded-xl transition-all text-sm ${
                    isActive
                      ? 'border border-cyan-400/50 bg-cyan-500/10 text-cyan-300 font-medium shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* B. Active Quiz Details Box */}
          <div className="bg-[#0F182E]/90 border border-white/10 rounded-2xl p-6 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl backdrop-blur-md">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">
                {activeCategory} Daily Quiz
              </h2>
              <p className="text-xs text-slate-400">
                10 MCQs • 10 minutes • 1 point each
              </p>
            </div>

            <button
              onClick={handleStartQuiz}
              className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-6 py-3 rounded-xl flex items-center space-x-2 shadow-lg shadow-cyan-400/25 active:scale-95 transition-all shrink-0"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Start Quiz</span>
            </button>
          </div>
        </div>

        {/* Real-Time Leaderboard Component */}
        <div className="max-w-3xl mx-auto mt-8 bg-[#0F182E]/90 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Leaderboard</span>
            </h3>

            <div className="flex items-center bg-[#131C33] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setLeaderboardFilter('Today')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  leaderboardFilter === 'Today'
                    ? 'bg-cyan-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setLeaderboardFilter('All time')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  leaderboardFilter === 'All time'
                    ? 'bg-cyan-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All time
              </button>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {leaderboard.map((entry, idx) => {
              const isTopThree = idx < 3;
              return (
                <div key={entry.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold ${
                      idx === 0 
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.2)]' 
                        : idx === 1
                        ? 'bg-slate-300/20 text-slate-200 border border-slate-300/30'
                        : idx === 2
                        ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white flex items-center gap-2">
                        {entry.name}
                        {idx === 0 && <span className="text-[10px] bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/20">👑 Top Rank</span>}
                      </p>
                      <span className="text-[11px] text-slate-400 font-mono">{entry.category} • {entry.timestamp}</span>
                    </div>
                  </div>

                  <span className="font-bold text-cyan-400 font-mono text-sm bg-cyan-950/30 px-3 py-1 rounded-lg border border-cyan-500/20">
                    {entry.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Quiz Runner Modal */}
        {quizRunning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-in fade-in duration-200">
            <div className="max-w-2xl w-full bg-[#0F182E] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
              
              <button
                onClick={() => setQuizRunning(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Progress Header & Timer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-cyan-400">
                    Question {currentQuestionIndex + 1} of {currentQuestions.length}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300 font-mono bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {formatTime(timeLeft)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-400 transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                {currentQuestions[currentQuestionIndex].question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestions[currentQuestionIndex].options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectOption = idx === currentQuestions[currentQuestionIndex].correctIndex;

                  let optionStyle = 'border-white/10 bg-[#131C33] text-slate-200 hover:border-cyan-400/40 hover:bg-cyan-950/20';
                  if (isAnswered) {
                    if (isCorrectOption) {
                      optionStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold';
                    } else if (isSelected && !isCorrectOption) {
                      optionStyle = 'border-rose-500 bg-rose-500/20 text-rose-300';
                    } else {
                      optionStyle = 'border-white/5 opacity-40 text-slate-400';
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-cyan-400 bg-cyan-500/20 text-white';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-sm">{option}</span>
                      </div>

                      {isAnswered && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                      {isAnswered && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {isAnswered && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 text-xs space-y-1 animate-in fade-in">
                  <span className="font-bold text-cyan-400 uppercase tracking-wider">Explanation:</span>
                  <p className="text-slate-300 leading-relaxed">{currentQuestions[currentQuestionIndex].explanation}</p>
                </div>
              )}

              {/* Next Button */}
              {isAnswered && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="px-8 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-400/25 flex items-center gap-2 transition-all"
                  >
                    <span>{currentQuestionIndex < currentQuestions.length - 1 ? 'Next Question' : 'View Final Score'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Results Modal / Completion Screen */}
        {quizCompleted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-in fade-in duration-200">
            <div className="max-w-md w-full bg-[#0F182E] border border-cyan-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6">
              
              <div className="w-16 h-16 rounded-3xl bg-cyan-400/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center mx-auto shadow-xl">
                <Trophy className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  Assessment Completed
                </span>
                <h2 className="text-3xl font-extrabold text-white">
                  You scored {score} / 10
                </h2>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Your score has been successfully recorded to the real-time student leaderboard.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={handleStartQuiz}
                  className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-400/25 flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Quiz</span>
                </button>
                <button
                  onClick={() => setQuizCompleted(false)}
                  className="w-full py-3.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all"
                >
                  Back to Leaderboard
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
