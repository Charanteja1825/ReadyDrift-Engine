require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Verify API key exists
let genAI = null;
let model = null;

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ WARNING: GEMINI_API_KEY not found in .env file!');
  console.warn('⚠️ Server running in OFFLINE MODE. AI features will respond with fallback content.');
} else {
  console.log('✅ API Key loaded successfully');
  // Initialize Gemini AI
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  console.log("🤖 Initialized Gemini Model: gemini-1.5-flash");
}

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "demo-pro-backend",
    time: new Date().toISOString()
  });
});


// Skill Gap Analysis
app.post('/api/ai/skill-gap', async (req, res) => {
  try {
    const { role, skills, time } = req.body;

    if (!role || !skills || !time) {
      return res.status(400).json({ error: 'Missing required fields: role, skills, time' });
    }

    console.log(`🎯 Analyzing skill gap for ${role}...`);

    // Mock data - for testing while quota is exceeded
    const mockResult = {
      analysis: {
        requiredSkills: ['JavaScript/TypeScript', 'React/Vue', 'Node.js', 'Database Design', 'System Design'],
        missingSkills: ['Advanced React patterns', 'Database optimization', 'Microservices']
      },
      roadmap: [
        { phase: 'Phase 1: Basics', topics: ['ES6+ JavaScript', 'React fundamentals', 'Node.js basics'], duration: '2 weeks' },
        { phase: 'Phase 2: Intermediate', topics: ['Advanced React', 'SQL optimization', 'REST API design'], duration: '3 weeks' },
        { phase: 'Phase 3: Advanced', topics: ['System Design', 'Microservices', 'DevOps basics'], duration: '4 weeks' }
      ],
      strategies: [
        { phase: 'Phase 1', strategy: 'Watch tutorials and build small projects', timeAllocation: '20 hours' },
        { phase: 'Phase 2', strategy: 'Solve LeetCode problems and build medium projects', timeAllocation: '25 hours' },
        { phase: 'Phase 3', strategy: 'Understand design patterns and build full-stack project', timeAllocation: '30 hours' }
      ]
    };

    console.log(`✅ Analysis complete for ${role}`);
    res.json(mockResult);
  } catch (error) {
    console.error('❌ Skill gap error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Generate Exam
app.post('/api/ai/generate-exam', async (req, res) => {
  try {
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Missing exam type' });
    }

    console.log(`📝 Generating ${type} exam...`);

    // Mock data - for testing while quota is exceeded
    const mockQuestions = {
      DSA: [
        {
          id: 'dsa-1',
          type: 'mcq',
          question: 'What is the time complexity of binary search?',
          options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
          correctAnswer: 'O(log n)',
          explanation: 'Binary search divides the search space in half each time, resulting in logarithmic time complexity.'
        },
        {
          id: 'dsa-2',
          type: 'mcq',
          question: 'What is the worst-case time complexity of quicksort?',
          options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
          correctAnswer: 'O(n²)',
          explanation: 'Quicksort has O(n²) worst-case when pivot selection is poor.'
        },
        {
          id: 'dsa-3',
          type: 'mcq',
          question: 'Which data structure uses FIFO?',
          options: ['Stack', 'Queue', 'Tree', 'Graph'],
          correctAnswer: 'Queue',
          explanation: 'Queue (First-In-First-Out) processes elements in the order they were added.'
        },
        {
          id: 'dsa-4',
          type: 'mcq',
          question: 'What is the time complexity of inserting into a hash table?',
          options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
          correctAnswer: 'O(1)',
          explanation: 'Hash tables provide average O(1) time complexity for insertions with good hash functions.'
        },
        {
          id: 'dsa-5',
          type: 'mcq',
          question: 'Which sorting algorithm is most stable?',
          options: ['Bubble Sort', 'Quick Sort', 'Merge Sort', 'Heap Sort'],
          correctAnswer: 'Merge Sort',
          explanation: 'Merge Sort maintains the relative order of equal elements, making it a stable sort.'
        },
        {
          id: 'dsa-6',
          type: 'mcq',
          question: 'What is a balanced binary search tree used for?',
          options: ['Fast random access', 'Maintaining sorted data with O(log n) operations', 'Storing graphs', 'Caching'],
          correctAnswer: 'Maintaining sorted data with O(log n) operations',
          explanation: 'BSTs like AVL or Red-Black trees keep data sorted while ensuring logarithmic search, insert, and delete.'
        },
        {
          id: 'dsa-7',
          type: 'mcq',
          question: 'What does dynamic programming rely on?',
          options: ['Recursion only', 'Overlapping subproblems and memoization', 'Sorting', 'Hashing'],
          correctAnswer: 'Overlapping subproblems and memoization',
          explanation: 'DP solves overlapping subproblems by storing intermediate results to avoid recomputation.'
        },
        {
          id: 'dsa-8',
          type: 'mcq',
          question: 'In a graph, what does DFS stand for?',
          options: ['Depth-First Search', 'Dynamic Finite State', 'Distributed File System', 'Data Flow Streaming'],
          correctAnswer: 'Depth-First Search',
          explanation: 'DFS traverses a graph by exploring as far as possible along each branch before backtracking.'
        },
        {
          id: 'dsa-exp-1',
          type: 'explanation',
          question: 'Explain how a linked list differs from an array in terms of memory allocation and access patterns.',
          correctAnswer: 'Arrays allocate contiguous memory for fast O(1) access but require reallocation on resize. Linked lists allocate non-contiguous memory, allowing O(1) insertion/deletion but requiring O(n) access time to reach an element.',
          explanation: 'This tests understanding of fundamental data structure trade-offs.'
        },
        {
          id: 'dsa-exp-2',
          type: 'explanation',
          question: 'Describe the difference between a greedy algorithm and a dynamic programming approach. When would you use each?',
          correctAnswer: 'Greedy algorithms make locally optimal choices at each step (e.g., coin change with standard denominations). DP solves overlapping subproblems optimally (e.g., unbounded knapsack). Use greedy when local optimality guarantees global optimality; use DP when problems have optimal substructure but lack greedy property.',
          explanation: 'This assesses grasp of algorithmic paradigms and problem-solving strategy selection.'
        }
      ],
      SQL: [
        {
          id: 'sql-1',
          type: 'mcq',
          question: 'What does JOIN do in SQL?',
          options: ['Merges rows', 'Combines columns from multiple tables', 'Deletes data', 'Updates records'],
          correctAnswer: 'Combines columns from multiple tables',
          explanation: 'JOIN combines related data from multiple tables based on a condition.'
        },
        {
          id: 'sql-2',
          type: 'mcq',
          question: 'Which is faster: SELECT * or SELECT specific columns?',
          options: ['SELECT *', 'SELECT specific columns', 'They are equal', 'Depends on database'],
          correctAnswer: 'SELECT specific columns',
          explanation: 'Selecting specific columns reduces data transfer and improves query performance.'
        },
        {
          id: 'sql-3',
          type: 'mcq',
          question: 'What is normalization?',
          options: ['Converting to uppercase', 'Organizing data to reduce redundancy', 'Deleting tables', 'Backup process'],
          correctAnswer: 'Organizing data to reduce redundancy',
          explanation: 'Normalization is a process to organize database structure efficiently.'
        },
        {
          id: 'sql-4',
          type: 'mcq',
          question: 'Which constraint prevents NULL values?',
          options: ['UNIQUE', 'NOT NULL', 'PRIMARY KEY', 'FOREIGN KEY'],
          correctAnswer: 'NOT NULL',
          explanation: 'NOT NULL constraint ensures a column always has a value.'
        },
        {
          id: 'sql-5',
          type: 'mcq',
          question: 'What does GROUP BY do?',
          options: ['Sorts rows', 'Groups rows by column values for aggregate functions', 'Deletes duplicates', 'Filters rows'],
          correctAnswer: 'Groups rows by column values for aggregate functions',
          explanation: 'GROUP BY aggregates data across multiple rows sharing the same column values.'
        },
        {
          id: 'sql-6',
          type: 'mcq',
          question: 'What is the difference between INNER JOIN and LEFT JOIN?',
          options: ['No difference', 'INNER includes unmatched left rows', 'LEFT includes unmatched left rows', 'INNER is faster'],
          correctAnswer: 'LEFT includes unmatched left rows',
          explanation: 'INNER JOIN returns only matching rows; LEFT JOIN includes all left table rows even without matches.'
        },
        {
          id: 'sql-7',
          type: 'mcq',
          question: 'What does an INDEX do?',
          options: ['Sorts data', 'Speeds up queries by creating a lookup structure', 'Compresses data', 'Encrypts data'],
          correctAnswer: 'Speeds up queries by creating a lookup structure',
          explanation: 'Indexes create data structures (like B-trees) to quickly locate rows without full table scans.'
        },
        {
          id: 'sql-8',
          type: 'mcq',
          question: 'What is a foreign key?',
          options: ['A key that sorts data', 'A column that references a primary key in another table', 'A temporary key', 'A key that encrypts data'],
          correctAnswer: 'A column that references a primary key in another table',
          explanation: 'Foreign keys enforce referential integrity by linking columns across tables.'
        },
        {
          id: 'sql-exp-1',
          type: 'explanation',
          question: 'Explain the concept of database normalization. Why is it important?',
          correctAnswer: 'Normalization is the process of organizing data into tables to reduce redundancy and improve data integrity. It ensures each piece of data is stored once, reduces storage space, prevents anomalies during insert/update/delete operations, and makes queries efficient.',
          explanation: 'Tests understanding of database design principles and data integrity.'
        },
        {
          id: 'sql-exp-2',
          type: 'explanation',
          question: 'Describe the differences between UNION and UNION ALL in SQL. When would you use each?',
          correctAnswer: 'UNION removes duplicate rows from the combined result set, while UNION ALL includes all rows even if they are duplicates. Use UNION when you need unique rows; use UNION ALL when performance is critical and duplicates are acceptable or desired.',
          explanation: 'Tests knowledge of set operations and query optimization.'
        }
      ],
      'Computer Networks': [
        {
          id: 'net-1',
          type: 'mcq',
          question: 'What is the port number for HTTP?',
          options: ['25', '80', '443', '3306'],
          correctAnswer: '80',
          explanation: 'HTTP uses port 80 by default.'
        },
        {
          id: 'net-2',
          type: 'mcq',
          question: 'Which layer deals with routing?',
          options: ['Physical', 'Data Link', 'Network', 'Transport'],
          correctAnswer: 'Network',
          explanation: 'Network layer (Layer 3) handles routing and logical addressing.'
        },
        {
          id: 'net-3',
          type: 'mcq',
          question: 'What is the function of TCP?',
          options: ['Routing packets', 'Reliable data delivery', 'Physical transmission', 'DNS resolution'],
          correctAnswer: 'Reliable data delivery',
          explanation: 'TCP (Transmission Control Protocol) ensures reliable, ordered delivery.'
        },
        {
          id: 'net-4',
          type: 'mcq',
          question: 'What is HTTPS vs HTTP?',
          options: ['Same thing', 'HTTP is encrypted', 'HTTPS is encrypted', 'Different ports'],
          correctAnswer: 'HTTPS is encrypted',
          explanation: 'HTTPS adds SSL/TLS encryption to HTTP for secure communication.'
        },
        {
          id: 'net-5',
          type: 'mcq',
          question: 'What does DNS do?',
          options: ['Encrypts data', 'Translates domain names to IP addresses', 'Routes packets', 'Manages firewalls'],
          correctAnswer: 'Translates domain names to IP addresses',
          explanation: 'DNS (Domain Name System) converts human-readable domain names into IP addresses.'
        },
        {
          id: 'net-6',
          type: 'mcq',
          question: 'What is the purpose of a subnet mask?',
          options: ['Encrypt data', 'Identify network and host portions of an IP address', 'Route packets', 'Manage bandwidth'],
          correctAnswer: 'Identify network and host portions of an IP address',
          explanation: 'Subnet masks divide IP addresses into network and host parts for proper routing.'
        },
        {
          id: 'net-7',
          type: 'mcq',
          question: 'What is UDP used for?',
          options: ['Reliable delivery', 'Fast, connectionless delivery without reliability guarantees', 'Encryption', 'Routing'],
          correctAnswer: 'Fast, connectionless delivery without reliability guarantees',
          explanation: 'UDP prioritizes speed over reliability, making it suitable for real-time applications.'
        },
        {
          id: 'net-8',
          type: 'mcq',
          question: 'What is the OSI model?',
          options: ['A protocol', 'A framework of 7 layers describing network communication', 'A routing algorithm', 'An encryption method'],
          correctAnswer: 'A framework of 7 layers describing network communication',
          explanation: 'The OSI model standardizes how network communication happens across 7 layers.'
        },
        {
          id: 'net-exp-1',
          type: 'explanation',
          question: 'Explain the difference between TCP and UDP. When would you choose each protocol?',
          correctAnswer: 'TCP provides reliable, ordered delivery with error checking and flow control, suitable for applications needing accuracy (email, file transfer). UDP provides fast, connectionless delivery without guarantees, ideal for real-time applications (video streaming, gaming, VoIP) where speed matters more than occasional packet loss.',
          explanation: 'Tests understanding of transport layer protocols and their trade-offs.'
        },
        {
          id: 'net-exp-2',
          type: 'explanation',
          question: 'Describe how a network packet travels from one computer to another across the internet.',
          correctAnswer: 'A packet is created at the application layer, encapsulated through transport, internet, and link layers. The IP layer determines the route to the destination IP. At each hop, routers use the subnet mask and routing tables to forward the packet. The link layer handles physical transmission. DNS resolves the domain to IP if needed. At the destination, the packet is de-encapsulated and delivered to the correct application port.',
          explanation: 'Tests comprehensive understanding of network layering and packet flow.'
        }
      ]
    };

    const questions = mockQuestions[type] || mockQuestions['DSA'];
    console.log(`✅ Generated ${questions.length} mock questions for ${type}`);
    res.json(questions);
  } catch (error) {
    console.error('❌ Exam generation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Interview Feedback
app.post('/api/ai/interview-feedback', async (req, res) => {
  try {
    console.log('🎤 Generating interview feedback...');

    const mockFeedback = {
      confidenceScore: Math.floor(Math.random() * 40 + 60), // 60-100
      stressLevel: Math.floor(Math.random() * 40 + 20), // 20-60
      clarityScore: Math.floor(Math.random() * 40 + 60), // 60-100
      feedback: {
        strengths: [
          'Clear communication of thought process',
          'Good problem-solving approach',
          'Confident in technical knowledge'
        ],
        weaknesses: [
          'Could improve on time management',
          'Need better edge case handling',
          'More practice needed for complex scenarios'
        ],
        tips: [
          'Practice speaking while coding to improve communication',
          'Always start with edge cases and constraints',
          'Use more descriptive variable names',
          'Test your code with sample inputs before finalizing',
          'Manage interview time better by grouping related tasks'
        ]
      }
    };

    console.log('✅ Feedback generated');
    res.json(mockFeedback);
  } catch (error) {
    console.error('❌ Interview feedback error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Explanation for questions
app.post('/api/ai/explanation', async (req, res) => {
  try {
    const { question, answer, correctAnswer, validate } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Missing question' });
    }

    // If caller requests validation of pseudo-code / open answer
    if (validate) {
      console.log('🔎 Validating coding/pseudo-code answer...');

      // Simple heuristic validator (mock): check presence of key tokens from correctAnswer
      const reference = (correctAnswer || '').toLowerCase();
      const user = (answer || '').toLowerCase();

      if (!reference) {
        return res.json({ valid: false, feedback: 'No reference answer available for validation.' });
      }

      const tokens = reference.split(/[^a-z0-9]+/).filter(t => t.length > 2);
      let matches = 0;
      for (const t of tokens) {
        if (user.includes(t)) matches++;
      }

      const threshold = Math.max(1, Math.ceil(tokens.length / 2));
      const valid = matches >= threshold;
      const feedback = valid
        ? `The pseudo-code contains ${matches}/${tokens.length} key tokens and looks correct. Suggestions: add edge-case handling and comments.`
        : `The pseudo-code is missing key concepts (${matches}/${tokens.length}). Look for: ${tokens.slice(0, 3).join(', ')}.`;

      console.log(`✅ Validation result: ${valid ? 'valid' : 'invalid'} (${matches}/${tokens.length})`);
      return res.json({ valid, feedback, matches, tokens });
    }

    // Otherwise return an explanation (mock)
    if (!correctAnswer) {
      return res.status(400).json({ error: 'Missing correctAnswer for explanation' });
    }

    console.log('💡 Generating explanation...');

    const mockExplanations = {
      'What is the time complexity of binary search?': 'Binary search works by repeatedly dividing the search space in half. Each division reduces the problem size, leading to logarithmic complexity O(log n). This is much faster than linear search O(n) for large datasets.',
      'What does JOIN do in SQL?': 'SQL JOIN combines rows from two or more tables based on a related column. INNER JOIN returns only matching records, LEFT JOIN includes all records from left table, RIGHT JOIN from right table, and FULL JOIN returns all records from both tables.',
      'default': `The correct answer is: ${correctAnswer}. Your answer was: ${answer || 'not provided'}. The correct answer is more accurate/complete because it addresses the core concept more effectively.`
    };

    const explanation = mockExplanations[question] || mockExplanations['default'];

    console.log('✅ Explanation generated');
    res.json({ explanation });
  } catch (error) {
    console.error('❌ Explanation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Study AI Chat - Only answers study-related questions
app.post('/api/study-chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`💬 Study chat query: "${message.substring(0, 50)}..."`);

    try {
      // System prompt - Updated to answer ALL safe questions (removed movie/entertainment restrictions)
      const systemPrompt = `You are a helpful and intelligent AI Assistant.
      
      Your goal is to be helpful, friendly, and knowledgeable.
      
      RULES:
      1. You are allowed to answer questions about ANY topic, including:
         - Education, Science, Coding, History
         - General Knowledge, Pop Culture, Movies, Entertainment
         - Personal advice (general), Daily chatter, Jokes
      2. SAFETY FIRST: strictly REFUSE to answer questions related to:
         - Promoting violence, self-harm, hate speech, or illegal acts.
         - Explicit adult content.
      
      If the user asks about safe topics, provide a clear and engaging answer.
      If the user asks about harmful/unsafe topics, firmly politely decline.
      
      Keep responses concise but helpful. Use emojis to be friendly!`;

      const fullPrompt = `${systemPrompt}\n\nUser question: ${message}`;

      if (!model) {
        throw new Error("Offline Mode: Model not initialized");
      }
      const result = await model.generateContent(fullPrompt);
      const response = result.response.text();

      console.log(`✅ Study chat response generated`);
      res.json({ response });
    } catch (apiError) {
      console.error('⚠️ Gemini API error, using fallback:', apiError.message);

      // Enhanced Fallback Logic for Offline/Quota Limits
      const lowerMessage = message.toLowerCase();
      let response = '';

      // Expanded keyword matching
      if (lowerMessage.match(/(hi|hello|hey|greetings|sup|yo)/)) {
        response = "Hello! 👋 I'm your AI Assistant. I'm currently running in limited mode due to server capacity, but I'm here to help!";
      } else if (lowerMessage.includes('how are you')) {
        response = "I'm doing well, thank you! 🤖 Just a bit busy on the server side, but ready to chat!";
      } else if (lowerMessage.includes('linked') && lowerMessage.includes('list')) {
        response = "A **linked list** is a linear data structure where elements (nodes) are connected via pointers. Each node contains:\n• Data (the value)\n• Pointer to the next node\n\n**Advantages:**\n✅ Dynamic size, Easy insertion/deletion\n**Disadvantages:**\n❌ No random access, Extra memory\n\n**Types:** Singly, Doubly, Circular linked lists. 🔗";
      } else if (lowerMessage.includes('tree')) {
        response = "**Trees** are hierarchical data structures with nodes and edges.\n\n**Key Terms:**\n🌱 **Root:** Topmost node\n🌿 **Leaf:** Node with no children\n🌲 **Binary Tree:** Max 2 children per node\n\nUsed in: File systems, HTML DOM, decision making.";
      } else if (lowerMessage.includes('stack')) {
        response = "**Stack** follows **LIFO** (Last In, First Out).\n\n**Operations:**\n⬆️ Push (Add)\n⬇️ Pop (Remove)\n👀 Peek (View top)\n\nExamples: Undo button, function call stack. 📚";
      } else if (lowerMessage.includes('queue')) {
        response = "**Queue** follows **FIFO** (First In, First Out).\n\n**Operations:**\n➡️ Enqueue (Add)\n⬅️ Dequeue (Remove)\n\nExamples: Printer jobs, ticket lines. 🚶";
      } else if (lowerMessage.includes('graph')) {
        response = "**Graphs** have Vertices (nodes) and Edges (connections).\n\n**Algorithms:**\n• BFS (Breadth-First Search)\n• DFS (Depth-First Search)\n• Dijkstra's (Shortest Path)\n\nUsed in: Maps, Social Networks, Routing. 🕸️";
      } else if (lowerMessage.includes('sort')) {
        response = "**Sorting Algorithms:**\n\n🐢 **Bubble Sort:** O(n²) - Simple swap\n⚡ **Quick Sort:** O(n log n) - Divide & conquer\n🤝 **Merge Sort:** O(n log n) - Stable\n\nChoose based on your data size! 🔢";
      } else if (lowerMessage.includes('sql') || lowerMessage.includes('database')) {
        response = "**Databases** store data.\n\n**SQL:** Structured, relational (tables). Ex: MySQL, PostgreSQL.\n**NoSQL:** Flexible, non-relational (documents). Ex: MongoDB.\n\nSQL is great for complex queries; NoSQL for scalability! 💾";
      } else if (lowerMessage.includes('python')) {
        response = "**Python** is a high-level, interpreted language known for readability.\n\n**Uses:** Web Dev (Django/Flask), Data Science (Pandas/NumPy), AI/ML (PyTorch/TensorFlow), Automation.\n\nIt's very beginner-friendly! 🐍";
      } else if (lowerMessage.includes('javascript') || lowerMessage.includes('js')) {
        response = "**JavaScript** is the language of the web.\n\n**Uses:**\n• Frontend (React, Vue)\n• Backend (Node.js)\n• Mobile (React Native)\n\nIt makes websites interactive! ⚡";
      } else if (lowerMessage.includes('react')) {
        response = "**React** is a JS library for building UIs.\n\n**Key Concepts:**\n• Components (Reusable UI parts)\n• Props (Pass data down)\n• State (Manage data locally)\n• Hooks (useEffect, useState)\n\nDeveloped by Facebook! ⚛️";
      } else if (lowerMessage.includes('movie') || lowerMessage.includes('film') || lowerMessage.includes('actor')) {
        response = "I love movies! 🎬 While I'm in offline mode, I can't look up specific recent films, but I can tell you that cinema is a great art form!";
      } else if (lowerMessage.includes('joke')) {
        const jokes = [
          "Why did the developer go broke? Because he used up all his cache! 💸",
          "Why do programmers prefer dark mode? Because light attracts bugs! 🪲",
          "What do you call a fake noodle? An Impasta! 🍝"
        ];
        response = jokes[Math.floor(Math.random() * jokes.length)];
      } else if (lowerMessage.includes('time')) {
        response = `The time is: ${new Date().toLocaleTimeString()} ⌚`;
      } else if (lowerMessage.includes('help')) {
        response = "I can help with definitions, coding concepts, general knowledge, and more! Just ask. (Note: Some complex AI features are currently limited). 🆘";
      } else {
        // Generic "I don't know" but friendly fallback
        response = "I'm currently in **Limited Offline Mode** (connecting to AI server...). 📡\n\nI couldn't specifically answer that, but I can help with:\n• Coding (JS, Python, React, SQL)\n• CS Concepts (DSA, OOP, Networks)\n• General chat\n\nPlease try asking about one of these topics!";
      }

      res.json({ response });
    }
  } catch (error) {
    console.error('❌ Study chat error:', error.message);
    res.status(500).json({
      error: 'Failed to generate response',
      response: "I'm having trouble connecting right now. Please try again in a moment! 🔄"
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Secure API server running on port ${PORT}`);
  console.log(`✅ API Key is protected on backend`);
  console.log(`📍 Base URL: http://localhost:${PORT}/api`);
});
