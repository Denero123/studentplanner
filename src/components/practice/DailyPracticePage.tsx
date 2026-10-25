import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  RotateCcw, 
  ArrowRight, 
  CheckSquare, 
  Sparkles,
  BookOpen
} from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface DailyPracticePageProps {
  navigate: (path: string) => void;
}

export const DailyPracticePage: React.FC<DailyPracticePageProps> = ({ navigate }) => {
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'Coding' | 'Web Development' | 'AI & ML' | 'Engineering Math' | 'Cybersecurity'>('Coding');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes timer

  const subjects = ['Coding', 'Web Development', 'AI & ML', 'Engineering Math', 'Cybersecurity'] as const;

  const questionsBank: Record<string, Question[]> = {
    'Coding': [
      {
        id: 1,
        question: 'What is the average time complexity of QuickSort in the worst-case scenario?',
        options: ['O(n log n)', 'O(n^2)', 'O(n)', 'O(log n)'],
        correctIndex: 1,
        explanation: 'QuickSort has a worst-case time complexity of O(n^2) when the pivot selection results in unbalanced partitions (e.g., already sorted array with poor pivot).'
      },
      {
        id: 2,
        question: 'Which data structure operates on a Last-In, First-Out (LIFO) principle?',
        options: ['Queue', 'Stack', 'Array', 'Binary Tree'],
        correctIndex: 1,
        explanation: 'A Stack is a LIFO data structure where elements are added and removed from the same end (top).'
      },
      {
        id: 3,
        question: 'In object-oriented programming, what keyword is used to inherit properties from a parent class?',
        options: ['implements', 'extends', 'inherits', 'super'],
        correctIndex: 1,
        explanation: 'In languages like Java and TypeScript, the "extends" keyword is used for class inheritance.'
      },
      {
        id: 4,
        question: 'What is the primary purpose of a hash function in computer science?',
        options: ['Encryption', 'Sorting data', 'Mapping data to fixed-size values for fast lookup', 'Memory compression'],
        correctIndex: 2,
        explanation: 'Hash functions map keys to hash table indices for O(1) average time complexity lookups.'
      },
      {
        id: 5,
        question: 'Which sorting algorithm is considered stable by default?',
        options: ['QuickSort', 'HeapSort', 'MergeSort', 'SelectionSort'],
        correctIndex: 2,
        explanation: 'MergeSort is a stable sorting algorithm because it preserves the relative order of elements with equal keys.'
      },
      {
        id: 6,
        question: 'What does API stand for in software engineering?',
        options: ['Advanced Programming Interface', 'Application Programming Interface', 'Automated Program Integration', 'Application Protocol Interaction'],
        correctIndex: 1,
        explanation: 'API stands for Application Programming Interface, enabling communication between different software components.'
      },
      {
        id: 7,
        question: 'Which of the following is a non-linear data structure?',
        options: ['Queue', 'Stack', 'Graph', 'Linked List'],
        correctIndex: 2,
        explanation: 'Graphs and Trees are non-linear data structures because elements are not arranged sequentially.'
      },
      {
        id: 8,
        question: 'What is recursion in programming?',
        options: ['A loop that runs infinitely', 'A function calling itself to solve smaller subproblems', 'Passing pointers to functions', 'Allocating dynamic memory'],
        correctIndex: 1,
        explanation: 'Recursion occurs when a function calls itself directly or indirectly to solve a problem.'
      },
      {
        id: 9,
        question: 'What is the space complexity of a standard recursive Fibonacci function without memoization?',
        options: ['O(1)', 'O(n)', 'O(2^n)', 'O(log n)'],
        correctIndex: 1,
        explanation: 'The call stack depth for recursive Fibonacci is proportional to n, resulting in O(n) space complexity.'
      },
      {
        id: 10,
        question: 'Which design pattern ensures a class has only one instance and provides a global point of access?',
        options: ['Observer', 'Factory', 'Singleton', 'Strategy'],
        correctIndex: 2,
        explanation: 'The Singleton pattern restricts instantiation of a class to one "single" instance.'
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
        explanation: 'DOM stands for Document Object Model, representing the page so programs can change document structure, style, and content.'
      },
      {
        id: 3,
        question: 'Which HTTP status code indicates a successful request and resource creation?',
        options: ['200 OK', '201 Created', '204 No Content', '301 Moved Permanently'],
        correctIndex: 1,
        explanation: 'HTTP 201 Created signifies that the request has succeeded and led to the creation of a resource.'
      },
      {
        id: 4,
        question: 'What is JSX in React?',
        options: ['A database query language', 'A JavaScript syntax extension allowing HTML-like markup', 'A CSS preprocessor', 'An HTTP routing protocol'],
        correctIndex: 1,
        explanation: 'JSX is an extension to JavaScript that lets you write HTML-like markup inside a JavaScript file.'
      },
      {
        id: 5,
        question: 'Which hook in React is used for managing component state?',
        options: ['useEffect', 'useMemo', 'useState', 'useRef'],
        correctIndex: 2,
        explanation: 'useState is a React Hook that lets you add state variables to functional components.'
      },
      {
        id: 6,
        question: 'What is the purpose of semantic HTML tags like <article> and <section>?',
        options: ['To add animations', 'To improve accessibility and search engine optimization (SEO)', 'To enforce strict CSS rules', 'To connect to databases'],
        correctIndex: 1,
        explanation: 'Semantic tags clearly describe their meaning to both the browser and the developer (and search engines).'
      },
      {
        id: 7,
        question: 'Which CSS unit is relative to the font-size of the root element?',
        options: ['em', 'rem', 'vw', 'px'],
        correctIndex: 1,
        explanation: 'rem stands for "root em", relative to the font-size of the html root element.'
      },
      {
        id: 8,
        question: 'What is CORS in web security?',
        options: ['Cross-Origin Resource Sharing', 'Cascading Object Rendering System', 'Client-Side Routing Service', 'Common Output Request Schema'],
        correctIndex: 0,
        explanation: 'CORS is an HTTP-header based mechanism that allows a server to indicate any origins other than its own from which a browser should permit loading resources.'
      },
      {
        id: 9,
        question: 'Which method is used in JavaScript to parse a JSON string into an object?',
        options: ['JSON.stringify()', 'JSON.parse()', 'JSON.object()', 'JSON.convert()'],
        correctIndex: 1,
        explanation: 'JSON.parse() parses a JSON string, constructing the JavaScript value or object described by the string.'
      },
      {
        id: 10,
        question: 'What is Tailwind CSS primarily known for?',
        options: ['Runtime CSS-in-JS injection', 'Utility-first CSS framework', 'An object-oriented styling compiler', 'A Sass framework'],
        correctIndex: 1,
        explanation: 'Tailwind CSS is a utility-first CSS framework packed with classes like flex, pt-4, and text-center that can be composed to build any design.'
      }
    ],
    'AI & ML': [
      {
        id: 1,
        question: 'What is the primary purpose of an activation function in neural networks?',
        options: ['To initialize weights', 'To introduce non-linearity into the network', 'To reduce training dataset size', 'To normalize input features'],
        correctIndex: 1,
        explanation: 'Activation functions allow neural networks to learn complex non-linear decision boundaries.'
      },
      {
        id: 2,
        question: 'Which loss function is commonly used for binary classification tasks?',
        options: ['Mean Squared Error (MSE)', 'Binary Cross-Entropy', 'Categorical Cross-Entropy', 'Huber Loss'],
        correctIndex: 1,
        explanation: 'Binary Cross-Entropy measures the performance of a classification model whose output is a probability value between 0 and 1.'
      },
      {
        id: 3,
        question: 'What is overfitting in machine learning?',
        options: ['Model performs well on training data but poorly on unseen test data', 'Model is too simple to capture patterns', 'Training takes too long', 'Dataset has missing values'],
        correctIndex: 0,
        explanation: 'Overfitting happens when a model learns the training data too well, including noise and outliers, hurting generalization.'
      },
      {
        id: 4,
        question: 'What does LLM stand for in modern AI?',
        options: ['Large Language Model', 'Linear Logic Machine', 'Labeled Learning Matrix', 'Latent Language Module'],
        correctIndex: 0,
        explanation: 'LLM stands for Large Language Model, trained on massive text corpora using transformer architectures.'
      },
      {
        id: 5,
        question: 'Which algorithm is an ensemble method that builds multiple decision trees?',
        options: ['Linear Regression', 'K-Means Clustering', 'Random Forest', 'Perceptron'],
        correctIndex: 2,
        explanation: 'Random Forest constructs a multitude of decision trees during training and outputs the mode of classes or mean prediction.'
      },
      {
        id: 6,
        question: 'What is gradient descent used for?',
        options: ['Data visualization', 'Optimizing model weights to minimize loss', 'Tokenizing text', 'Calculating precision and recall'],
        correctIndex: 1,
        explanation: 'Gradient descent is an iterative optimization algorithm used to find the minimum of a loss function.'
      },
      {
        id: 7,
        question: 'What is the key mechanism introduced by the Transformer architecture in 2017?',
        options: ['Convolution', 'Recurrent gating', 'Self-Attention', 'Max Pooling'],
        correctIndex: 2,
        explanation: 'Self-attention allows models to weigh the significance of different words in a sequence regardless of their positional distance.'
      },
      {
        id: 8,
        question: 'What is unsupervised learning?',
        options: ['Learning with labeled target outputs', 'Learning patterns from unlabeled data', 'Reinforcement learning via reward signals', 'Transfer learning from pretrained checkpoints'],
        correctIndex: 1,
        explanation: 'Unsupervised learning algorithms find hidden patterns or intrinsic structures in unlabeled data (e.g., clustering).'
      },
      {
        id: 9,
        question: 'What is the purpose of data normalization in machine learning?',
        options: ['To remove outliers permanently', 'To scale features to a similar range for stable gradient updates', 'To convert text to numbers', 'To split train and test sets'],
        correctIndex: 1,
        explanation: 'Normalization ensures features contribute equally to the loss function and prevents features with larger scales from dominating.'
      },
      {
        id: 10,
        question: 'What is RAG (Retrieval-Augmented Generation)?',
        options: ['A data cleaning pipeline', 'Combining an information retrieval system with an LLM for factual grounding', 'A reinforcement learning reward model', 'A model quantization technique'],
        correctIndex: 1,
        explanation: 'RAG retrieves relevant external documents and feeds them to the LLM context window to generate grounded, accurate responses.'
      }
    ],
    'Engineering Math': [
      {
        id: 1,
        question: 'What is the derivative of sin(x) with respect to x?',
        options: ['-cos(x)', 'cos(x)', '-sin(x)', 'tan(x)'],
        correctIndex: 1,
        explanation: 'The derivative of sin(x) is cos(x).'
      },
      {
        id: 2,
        question: 'What does an eigenvalue represent in linear algebra?',
        options: ['The determinant of a matrix', 'A scalar by which a vector is scaled when a linear transformation is applied', 'The trace of a matrix', 'The inverse of a matrix'],
        correctIndex: 1,
        explanation: 'Eigenvalues represent the factor by which the corresponding eigenvector is scaled during a linear transformation.'
      },
      {
        id: 3,
        question: 'What is the integral of 1/x with respect to x?',
        options: ['ln|x| + C', '-1/x^2 + C', 'e^x + C', 'x^2 / 2 + C'],
        correctIndex: 0,
        explanation: 'The antiderivative of 1/x is the natural logarithm ln|x| plus the constant of integration C.'
      },
      {
        id: 4,
        question: 'What is Euler’s identity relating e, i, pi, 1, and 0?',
        options: ['e^(i*pi) + 1 = 0', 'e^pi - i = 0', 'e^(i*pi) - i = 1', 'e^(2*pi*i) = 1'],
        correctIndex: 0,
        explanation: 'Euler’s identity states e^(i*pi) + 1 = 0, often cited as a benchmark of mathematical beauty.'
      },
      {
        id: 5,
        question: 'What is the dot product of two orthogonal vectors?',
        options: ['1', '-1', '0', 'Infinity'],
        correctIndex: 2,
        explanation: 'The dot product of two orthogonal (perpendicular) vectors is always zero.'
      },
      {
        id: 6,
        question: 'What is Bayes theorem used for?',
        options: ['Calculating matrix ranks', 'Calculating conditional probability based on prior knowledge', 'Solving differential equations', 'Finding polygon areas'],
        correctIndex: 1,
        explanation: 'Bayes theorem describes the probability of an event, based on prior knowledge of conditions that might be related to the event.'
      },
      {
        id: 7,
        question: 'What is the rank of a matrix?',
        options: ['Number of rows', 'Maximum number of linearly independent column vectors', 'Sum of diagonal elements', 'Determinant value'],
        correctIndex: 1,
        explanation: 'Matrix rank is the dimension of the vector space generated by its columns (or rows).'
      },
      {
        id: 8,
        question: 'What is the Laplace transform used for in engineering?',
        options: ['Converting differential equations into algebraic equations', 'Compressing image files', 'Sorting numerical arrays', 'Encrypting communication channels'],
        correctIndex: 0,
        explanation: 'The Laplace transform turns time-domain differential equations into simpler s-domain algebraic equations.'
      },
      {
        id: 9,
        question: 'What is the sum of angles in a triangle in Euclidean geometry?',
        options: ['90 degrees', '180 degrees', '360 degrees', '270 degrees'],
        correctIndex: 1,
        explanation: 'The sum of interior angles in a Euclidean triangle is always 180 degrees (pi radians).'
      },
      {
        id: 10,
        question: 'What does the gradient vector of a scalar function point towards?',
        options: ['Direction of steepest descent', 'Direction of maximum rate of increase', 'Zero slope', 'Perpendicular level curve'],
        correctIndex: 1,
        explanation: 'The gradient points in the direction of the greatest rate of increase of the function.'
      }
    ],
    'Cybersecurity': [
      {
        id: 1,
        question: 'What is the primary difference between symmetric and asymmetric encryption?',
        options: ['Symmetric uses one key for encryption/decryption; asymmetric uses a public/private key pair', 'Asymmetric is faster', 'Symmetric is only used for passwords', 'There is no difference'],
        correctIndex: 0,
        explanation: 'Symmetric encryption uses the same shared key, whereas asymmetric encryption uses a public key for encryption and a private key for decryption.'
      },
      {
        id: 2,
        question: 'What does CIA triad stand for in information security?',
        options: ['Confidentiality, Integrity, Availability', 'Control, Isolation, Access', 'Client, Instance, Application', 'Certificate, Identity, Authentication'],
        correctIndex: 0,
        explanation: 'The CIA triad is a foundational security model consisting of Confidentiality, Integrity, and Availability.'
      },
      {
        id: 3,
        question: 'What is a SQL injection (SQLi) attack?',
        options: ['Overloading database memory', 'Inserting malicious SQL statements into input fields to manipulate database queries', 'Stealing hardware servers', 'Cracking Wi-Fi passwords'],
        correctIndex: 1,
        explanation: 'SQLi allows attackers to interfere with database queries, potentially viewing data they should not have access to.'
      },
      {
        id: 4,
        question: 'What is multi-factor authentication (MFA)?',
        options: ['Using two passwords', 'Requiring two or more verification factors from independent categories of credentials', 'Logging in from multiple devices', 'Encrypting files twice'],
        correctIndex: 1,
        explanation: 'MFA combines something you know (password), something you have (phone/token), or something you are (biometrics).'
      },
      {
        id: 5,
        question: 'What is a DDoS attack?',
        options: ['Decrypting data packets', 'Distributed Denial of Service attack overwhelming systems with traffic from multiple sources', 'Deleting database records', 'Stealing cryptographic keys'],
        correctIndex: 1,
        explanation: 'DDoS floods target servers with traffic from multiple compromised systems to disrupt normal service.'
      },
      {
        id: 6,
        question: 'What is a phishing attack?',
        options: ['Scanning network ports', 'Deceiving individuals into revealing sensitive information via fraudulent communications', 'Intercepting Wi-Fi packets', 'Installing ransomware'],
        correctIndex: 1,
        explanation: 'Phishing mimics trusted entities (like banks or universities) via emails or messages to harvest credentials.'
      },
      {
        id: 7,
        question: 'What is HTTPS?',
        options: ['HyperText Transfer Protocol Secure, using SSL/TLS encryption', 'High Transfer Protocol for System Security', 'HyperText Transmission Processing Standard', 'Host Transfer Protocol Secure'],
        correctIndex: 0,
        explanation: 'HTTPS encrypts HTTP traffic using TLS/SSL to ensure secure communication over computer networks.'
      },
      {
        id: 8,
        question: 'What is a zero-day vulnerability?',
        options: ['A bug that takes zero seconds to fix', 'An unknown vulnerability that has been exploited before developers patch it', 'A password that expires in zero days', 'A firewall with zero rules'],
        correctIndex: 1,
        explanation: 'A zero-day exploit targets a vulnerability unknown to the vendor, leaving zero days for defense before attack.'
      },
      {
        id: 9,
        question: 'What is the purpose of a firewall?',
        options: ['To extinguish server fires', 'To monitor and filter incoming and outgoing network traffic based on security rules', 'To speed up internet connection', 'To store encrypted backups'],
        correctIndex: 1,
        explanation: 'Firewalls establish a barrier between trusted internal networks and untrusted external networks like the internet.'
      },
      {
        id: 10,
        question: 'What is social engineering in cybersecurity?',
        options: ['Building secure networks', 'Manipulating people into performing actions or divulging confidential information', 'Social media marketing', 'Automated penetration testing'],
        correctIndex: 1,
        explanation: 'Social engineering exploits human psychology rather than technical software flaws to gain access.'
      }
    ]
  };

  const currentQuestions = questionsBank[activeTab] || questionsBank['Coding'];

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && quizStarted && !quizCompleted) {
      setQuizCompleted(true);
      toastError('⏱️ Time is up!');
    }
    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted, timeLeft]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
    setTimeLeft(600);
    success(`⚡ Started ${activeTab} Daily Practice Quiz!`);
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
      setQuizCompleted(true);
      success('🎉 Quiz completed successfully!');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-slate-950">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header & Subject Trackers */}
        <div className="border-b border-white/[0.08] pb-6 space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>[ ⚡ DAILY PRACTICE ]</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Build. Test. Improve.
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Take a 10-question course or tech quiz, track your accuracy, and rank on the student leaderboard.
          </p>
        </div>

        {/* Subject Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-[#0F1626]/80 p-2 rounded-2xl border border-white/10">
          {subjects.map(subj => (
            <button
              key={subj}
              onClick={() => {
                setActiveTab(subj);
                setQuizStarted(false);
                setQuizCompleted(false);
              }}
              className={`flex-1 min-w-[130px] py-3 px-4 rounded-xl text-xs font-bold transition-all relative ${
                activeTab === subj
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg'
                  : 'text-slate-400 hover:text-white bg-[#131C31] border border-white/5'
              }`}
            >
              {subj}
              {activeTab === subj && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Interactive Quiz Card / Player State */}
        {!quizStarted && !quizCompleted && (
          <div className="bg-[#0F1626]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {activeTab} Assessment
              </span>
              <h2 className="text-2xl font-extrabold text-white">
                {activeTab} Daily Quiz
              </h2>
              <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-4 pt-1">
                <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> 10 MCQs</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 10 mins</span>
                <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> 1 point each</span>
              </p>
            </div>

            <button
              onClick={handleStartQuiz}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-2xl flex items-center space-x-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all shrink-0"
            >
              <span>Start Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quiz Player Active State */}
        {quizStarted && !quizCompleted && (
          <div className="bg-[#0F1626]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Top Bar: Question Counter & Timer */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs font-semibold">
              <span className="text-emerald-400">
                Question {currentQuestionIndex + 1} of {currentQuestions.length}
              </span>
              <span className="flex items-center gap-1.5 text-slate-300 font-mono bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Question Text */}
            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                {currentQuestions[currentQuestionIndex].question}
              </h3>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestions[currentQuestionIndex].options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectOption = idx === currentQuestions[currentQuestionIndex].correctIndex;

                let optionStyle = 'bg-[#131C31] border-white/10 text-slate-200 hover:border-emerald-500/40';
                if (isAnswered) {
                  if (isCorrectOption) {
                    optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                  } else {
                    optionStyle = 'bg-[#131C31] border-white/5 opacity-50 text-slate-400';
                  }
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

                    {isAnswered && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrectOption && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Banner (When Answered) */}
            {isAnswered && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 text-xs space-y-1 animate-in fade-in">
                <span className="font-bold text-emerald-400 uppercase tracking-wider">Explanation:</span>
                <p className="text-slate-300 leading-relaxed">{currentQuestions[currentQuestionIndex].explanation}</p>
              </div>
            )}

            {/* Next Button */}
            {isAnswered && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNextQuestion}
                  className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
                >
                  <span>{currentQuestionIndex < currentQuestions.length - 1 ? 'Next Question' : 'View Final Score'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Final Score Summary Screen */}
        {quizCompleted && (
          <div className="bg-[#0F1626]/90 border border-white/10 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Assessment Finished
              </span>
              <h2 className="text-3xl font-extrabold text-white">
                You scored {score} out of {currentQuestions.length}
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {score >= 8 ? '🌟 Outstanding performance! You have mastered this module.' : score >= 5 ? '👍 Solid effort! Review the explanations to close knowledge gaps.' : '📚 Keep practicing! Consistent daily review builds mastery.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={handleStartQuiz}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={() => setQuizStarted(false)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all"
              >
                Choose Another Subject
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
