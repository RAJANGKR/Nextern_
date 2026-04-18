/**
 * seed_topics.js — Populates the topics collection with placement-prep data.
 * Run once:  node seed_topics.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('./models/Topic');

const TOPICS = [
  // ── DSA: Basic ─────────────────────────────────────────────
  { code:'ds1', subjectCode:'DSA', title:'Arrays — Traversal & Basic Operations', level:'basic', importance:5, companyType:'both', order:0 },
  { code:'ds2', subjectCode:'DSA', title:'Strings — Reverse, Palindrome, Anagram', level:'basic', importance:5, companyType:'both', order:1 },
  { code:'ds3', subjectCode:'DSA', title:'Sorting — Bubble, Selection, Insertion', level:'basic', importance:4, companyType:'both', order:2 },
  { code:'ds4', subjectCode:'DSA', title:'Linear Search & Binary Search Basics', level:'basic', importance:4, companyType:'both', order:3 },
  { code:'ds5', subjectCode:'DSA', title:'Linked List — Insert, Delete, Traverse', level:'basic', importance:4, companyType:'both', order:4 },
  { code:'ds6', subjectCode:'DSA', title:'Stack & Queue — Push, Pop, Enqueue, Dequeue', level:'basic', importance:4, companyType:'both', order:5 },
  { code:'ds7', subjectCode:'DSA', title:'Hashing & HashMap Basics', level:'basic', importance:4, companyType:'both', order:6 },
  { code:'ds8', subjectCode:'DSA', title:'Pattern Programs (Star, Number)', level:'basic', importance:3, companyType:'service', order:7 },
  { code:'ds9', subjectCode:'DSA', title:'Fibonacci, Factorial, Prime Check', level:'basic', importance:3, companyType:'both', order:8 },
  { code:'d6',  subjectCode:'DSA', title:'Binary Search', level:'basic', importance:5, companyType:'product', order:9 },
  { code:'d11', subjectCode:'DSA', title:'Reverse Linked List', level:'basic', importance:5, companyType:'product', order:10 },
  { code:'d13', subjectCode:'DSA', title:'Merge Two Sorted Lists', level:'basic', importance:4, companyType:'product', order:11 },
  { code:'d14', subjectCode:'DSA', title:'Valid Parentheses', level:'basic', importance:4, companyType:'product', order:12 },
  { code:'d17', subjectCode:'DSA', title:'Binary Tree Traversals (Inorder, Preorder, Postorder)', level:'basic', importance:5, companyType:'product', order:13 },

  // ── DSA: Intermediate ──────────────────────────────────────
  { code:'d1',  subjectCode:'DSA', title:"Kadane's Algorithm", level:'intermediate', importance:5, companyType:'product', order:14 },
  { code:'d2',  subjectCode:'DSA', title:'Sliding Window (Fixed Size)', level:'intermediate', importance:5, companyType:'product', order:15 },
  { code:'d4',  subjectCode:'DSA', title:'Two Pointer Technique', level:'intermediate', importance:5, companyType:'product', order:16 },
  { code:'d5',  subjectCode:'DSA', title:'Prefix Sum & Range Queries', level:'intermediate', importance:4, companyType:'product', order:17 },
  { code:'d8',  subjectCode:'DSA', title:'Subsets Generation', level:'intermediate', importance:4, companyType:'product', order:18 },
  { code:'d9',  subjectCode:'DSA', title:'Permutations', level:'intermediate', importance:4, companyType:'product', order:19 },
  { code:'d12', subjectCode:'DSA', title:"Cycle Detection (Floyd's Algorithm)", level:'intermediate', importance:5, companyType:'product', order:20 },
  { code:'d18', subjectCode:'DSA', title:'Lowest Common Ancestor', level:'intermediate', importance:5, companyType:'product', order:21 },
  { code:'d19', subjectCode:'DSA', title:'Diameter of Binary Tree', level:'intermediate', importance:4, companyType:'product', order:22 },
  { code:'d20', subjectCode:'DSA', title:'DFS Traversal', level:'intermediate', importance:5, companyType:'product', order:23 },
  { code:'d21', subjectCode:'DSA', title:'BFS Traversal', level:'intermediate', importance:5, companyType:'product', order:24 },

  // ── DSA: Advanced ──────────────────────────────────────────
  { code:'d3',  subjectCode:'DSA', title:'Sliding Window (Variable Size)', level:'advanced', importance:5, companyType:'product', order:25 },
  { code:'d7',  subjectCode:'DSA', title:'Binary Search on Answer', level:'advanced', importance:5, companyType:'product', order:26 },
  { code:'d10', subjectCode:'DSA', title:'Backtracking (N-Queens)', level:'advanced', importance:4, companyType:'product', order:27 },
  { code:'d15', subjectCode:'DSA', title:'Monotonic Stack (Next Greater Element)', level:'advanced', importance:5, companyType:'product', order:28 },
  { code:'d16', subjectCode:'DSA', title:'LRU Cache (Design)', level:'advanced', importance:5, companyType:'product', order:29 },
  { code:'d22', subjectCode:'DSA', title:'Cycle Detection in Graph', level:'advanced', importance:5, companyType:'product', order:30 },
  { code:'d23', subjectCode:'DSA', title:'Topological Sort', level:'advanced', importance:5, companyType:'product', order:31 },
  { code:'d24', subjectCode:'DSA', title:'Dijkstra Algorithm', level:'advanced', importance:5, companyType:'product', order:32 },
  { code:'d25', subjectCode:'DSA', title:'0/1 Knapsack', level:'advanced', importance:5, companyType:'product', order:33 },
  { code:'d26', subjectCode:'DSA', title:'Longest Increasing Subsequence', level:'advanced', importance:5, companyType:'product', order:34 },
  { code:'d27', subjectCode:'DSA', title:'Longest Common Subsequence', level:'advanced', importance:5, companyType:'product', order:35 },

  // ── DBMS ───────────────────────────────────────────────────
  { code:'db1',  subjectCode:'DBMS', title:'SQL — SELECT, WHERE, GROUP BY', level:'basic', importance:5, companyType:'both', order:0 },
  { code:'db2',  subjectCode:'DBMS', title:'JOINs (INNER, LEFT, RIGHT)', level:'basic', importance:5, companyType:'both', order:1 },
  { code:'db3',  subjectCode:'DBMS', title:'Normalization (1NF–3NF)', level:'basic', importance:4, companyType:'both', order:2 },
  { code:'db4',  subjectCode:'DBMS', title:'ER Diagram Design', level:'basic', importance:3, companyType:'both', order:3 },
  { code:'db5',  subjectCode:'DBMS', title:'ACID Properties', level:'basic', importance:5, companyType:'both', order:4 },
  { code:'db6',  subjectCode:'DBMS', title:'Transactions & Concurrency', level:'intermediate', importance:5, companyType:'product', order:5 },
  { code:'db7',  subjectCode:'DBMS', title:'Indexing & B-Trees', level:'advanced', importance:5, companyType:'product', order:6 },
  { code:'db8',  subjectCode:'DBMS', title:'Query Optimization & Plans', level:'advanced', importance:5, companyType:'product', order:7 },
  { code:'db9',  subjectCode:'DBMS', title:'Sharding & Replication', level:'advanced', importance:4, companyType:'product', order:8 },
  { code:'db10', subjectCode:'DBMS', title:'CAP Theorem & NoSQL', level:'advanced', importance:4, companyType:'product', order:9 },

  // ── OOPS ───────────────────────────────────────────────────
  { code:'o1',  subjectCode:'OOPS', title:'Classes, Objects & Constructors', level:'basic', importance:5, companyType:'both', order:0 },
  { code:'o2',  subjectCode:'OOPS', title:'Encapsulation & Access Modifiers', level:'basic', importance:4, companyType:'both', order:1 },
  { code:'o3',  subjectCode:'OOPS', title:'Inheritance (single & multi)', level:'basic', importance:5, companyType:'both', order:2 },
  { code:'o4',  subjectCode:'OOPS', title:'Polymorphism (compile & runtime)', level:'basic', importance:4, companyType:'both', order:3 },
  { code:'o5',  subjectCode:'OOPS', title:'Abstraction & Interfaces', level:'basic', importance:4, companyType:'both', order:4 },
  { code:'o6',  subjectCode:'OOPS', title:'Design Patterns (Singleton, Factory)', level:'intermediate', importance:5, companyType:'product', order:5 },
  { code:'o7',  subjectCode:'OOPS', title:'SOLID Principles', level:'intermediate', importance:5, companyType:'product', order:6 },
  { code:'o8',  subjectCode:'OOPS', title:'Composition vs Inheritance', level:'advanced', importance:4, companyType:'product', order:7 },
  { code:'o9',  subjectCode:'OOPS', title:'Memory Layout — Stack & Heap', level:'advanced', importance:4, companyType:'product', order:8 },
  { code:'o10', subjectCode:'OOPS', title:'Virtual Functions & VTables', level:'advanced', importance:3, companyType:'product', order:9 },

  // ── OS ─────────────────────────────────────────────────────
  { code:'os1', subjectCode:'OS', title:'Process vs Thread', level:'basic', importance:5, companyType:'both', order:0 },
  { code:'os2', subjectCode:'OS', title:'CPU Scheduling (FCFS, SJF, RR)', level:'basic', importance:4, companyType:'both', order:1 },
  { code:'os3', subjectCode:'OS', title:'Deadlock — Conditions & Detection', level:'basic', importance:4, companyType:'both', order:2 },
  { code:'os4', subjectCode:'OS', title:'Paging & Segmentation', level:'basic', importance:4, companyType:'both', order:3 },
  { code:'os5', subjectCode:'OS', title:'Semaphores & Mutex', level:'intermediate', importance:5, companyType:'product', order:4 },
  { code:'os6', subjectCode:'OS', title:'Producer-Consumer Problem', level:'intermediate', importance:5, companyType:'product', order:5 },
  { code:'os7', subjectCode:'OS', title:'Virtual Memory & Page Replacement', level:'advanced', importance:5, companyType:'product', order:6 },
  { code:'os8', subjectCode:'OS', title:'File Systems (inode, ext4)', level:'advanced', importance:4, companyType:'product', order:7 },
  { code:'os9', subjectCode:'OS', title:'System Calls & Kernel Mode', level:'advanced', importance:4, companyType:'product', order:8 },

  // ── CN ─────────────────────────────────────────────────────
  { code:'cn1',  subjectCode:'CN', title:'OSI vs TCP/IP Model', level:'basic', importance:5, companyType:'both', order:0 },
  { code:'cn2',  subjectCode:'CN', title:'IP Addressing & Subnetting', level:'basic', importance:4, companyType:'both', order:1 },
  { code:'cn3',  subjectCode:'CN', title:'TCP vs UDP', level:'basic', importance:5, companyType:'both', order:2 },
  { code:'cn4',  subjectCode:'CN', title:'HTTP/HTTPS Basics', level:'basic', importance:4, companyType:'both', order:3 },
  { code:'cn5',  subjectCode:'CN', title:'DNS & DHCP', level:'basic', importance:3, companyType:'both', order:4 },
  { code:'cn6',  subjectCode:'CN', title:'TCP Handshake & Flow Control', level:'intermediate', importance:5, companyType:'product', order:5 },
  { code:'cn7',  subjectCode:'CN', title:'Routing Algorithms (Dijkstra)', level:'intermediate', importance:4, companyType:'product', order:6 },
  { code:'cn8',  subjectCode:'CN', title:'SSL/TLS Handshake & Encryption', level:'advanced', importance:5, companyType:'product', order:7 },
  { code:'cn9',  subjectCode:'CN', title:'CDN & Load Balancing', level:'advanced', importance:4, companyType:'product', order:8 },
  { code:'cn10', subjectCode:'CN', title:'WebSockets & Long Polling', level:'advanced', importance:3, companyType:'product', order:9 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Drop existing topics and re-insert
    await Topic.deleteMany({});
    console.log('🗑️  Cleared old topics');

    await Topic.insertMany(TOPICS);
    console.log(`✅ Seeded ${TOPICS.length} topics`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
