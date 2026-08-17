require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("../models/problems");
const User = require("../models/user");

const jsStarter = `const fs = require('fs');
const input = JSON.parse(fs.readFileSync(0, 'utf8'));

function solve(input) {
  // Write your solution here
}

console.log(JSON.stringify(solve(input)));`;

const problem = (title, description, difficulty, tags, companies, constraints, cases, solution, hints) => ({
  title, description, difficulty, tags, companies, constraints, hints,
  visibleTestCases: cases.slice(0, 2),
  hiddenTestCases: cases.slice(2),
  startCode: [{ language: "javascript", initialCode: jsStarter }],
  referenceSolution: [{ language: "javascript", completeCode: solution }],
});

const read = "const fs=require('fs');const input=JSON.parse(fs.readFileSync(0,'utf8'));";
const catalog = [
  problem("Two Sum", "Given an array of integers `nums` and an integer `target`, return the indices of two distinct numbers whose sum equals `target`. Exactly one answer exists.", "easy", ["array", "hashmap"], ["amazon", "google", "meta"], "2 ≤ nums.length ≤ 10^4\n-10^9 ≤ nums[i], target ≤ 10^9", [
    { input: '{"nums":[2,7,11,15],"target":9}', output: '[0,1]', explanation: "nums[0] + nums[1] = 9." },
    { input: '{"nums":[3,2,4],"target":6}', output: '[1,2]', explanation: "nums[1] + nums[2] = 6." },
    { input: '{"nums":[3,3],"target":6}', output: '[0,1]', explanation: "Use two different positions." },
  ], `${read}const seen=new Map();for(let i=0;i<input.nums.length;i++){const need=input.target-input.nums[i];if(seen.has(need)){console.log(JSON.stringify([seen.get(need),i]));process.exit()}seen.set(input.nums[i],i)}`, ["Try remembering values you have already visited.", "For each number, ask whether its complement appeared earlier."]),
  problem("Valid Parentheses", "Given a string containing only brackets `()[]{}`, determine whether every opening bracket is closed in the correct order.", "easy", ["string", "stack"], ["amazon", "microsoft", "adobe"], "1 ≤ s.length ≤ 10^4\ns contains only bracket characters.", [
    { input: '{"s":"()[]{}"}', output: 'true', explanation: "Each opening bracket has a matching close." },
    { input: '{"s":"(]"}', output: 'false', explanation: "The bracket types do not match." },
    { input: '{"s":"([)]"}', output: 'false', explanation: "Closings must follow LIFO order." },
  ], `${read}const pairs={')':'(',']':'[','}':'{'};const st=[];for(const c of input.s){if(!pairs[c])st.push(c);else if(st.pop()!==pairs[c]){console.log(false);process.exit()}}console.log(st.length===0)`, ["Think about the last opening bracket that has not been closed.", "A stack models nested pairs naturally."]),
  problem("Longest Substring Without Repeating Characters", "Return the length of the longest substring of `s` that contains no repeated characters.", "medium", ["string", "sliding-window", "hashmap"], ["amazon", "google", "meta", "uber"], "0 ≤ s.length ≤ 5 × 10^4\ns may contain letters, digits, symbols, and spaces.", [
    { input: '{"s":"abcabcbb"}', output: '3', explanation: "`abc` has length 3." },
    { input: '{"s":"bbbbb"}', output: '1', explanation: "Any single `b` is valid." },
    { input: '{"s":"pwwkew"}', output: '3', explanation: "`wke` is the longest valid substring." },
  ], `${read}const last=new Map();let left=0,best=0;for(let right=0;right<input.s.length;right++){const c=input.s[right];if(last.has(c)&&last.get(c)>=left)left=last.get(c)+1;last.set(c,right);best=Math.max(best,right-left+1)}console.log(best)`, ["A brute-force approach checks every substring. Can you keep just one window?", "Store the most recent position for each character."]),
  problem("Product of Array Except Self", "Return an array where each element at index `i` equals the product of all values in `nums` except `nums[i]`. Do not use division.", "medium", ["array", "prefix-sum"], ["amazon", "meta", "apple"], "2 ≤ nums.length ≤ 10^5\n-30 ≤ nums[i] ≤ 30\nThe answer fits in a 32-bit integer.", [
    { input: '{"nums":[1,2,3,4]}', output: '[24,12,8,6]', explanation: "Each position excludes its own value." },
    { input: '{"nums":[-1,1,0,-3,3]}', output: '[0,0,9,0,0]', explanation: "The zero is handled without division." },
    { input: '{"nums":[2,3]}', output: '[3,2]', explanation: "Use products from both sides." },
  ], `${read}const a=input.nums,out=Array(a.length).fill(1);let p=1;for(let i=0;i<a.length;i++){out[i]=p;p*=a[i]}p=1;for(let i=a.length-1;i>=0;i--){out[i]*=p;p*=a[i]}console.log(JSON.stringify(out))`, ["Calculate products to the left of each index first.", "Make a second pass from right to left and multiply into the same answer array."]),
  problem("Binary Search", "Given a sorted array of distinct integers and a target, return its index. Return `-1` when the target is absent.", "easy", ["array", "binary-search"], ["google", "microsoft", "linkedin"], "1 ≤ nums.length ≤ 10^5\nnums is sorted in ascending order with distinct values.", [
    { input: '{"nums":[-1,0,3,5,9,12],"target":9}', output: '4', explanation: "9 appears at index 4." },
    { input: '{"nums":[-1,0,3,5,9,12],"target":2}', output: '-1', explanation: "2 does not appear." },
    { input: '{"nums":[5],"target":5}', output: '0', explanation: "The only item matches." },
  ], `${read}let l=0,r=input.nums.length-1;while(l<=r){const m=l+Math.floor((r-l)/2);if(input.nums[m]===input.target){console.log(m);process.exit()}if(input.nums[m]<input.target)l=m+1;else r=m-1}console.log(-1)`, ["Use the fact that half the values can be discarded after each comparison.", "Keep inclusive left and right boundaries."]),
  problem("Maximum Subarray", "Find the contiguous subarray with the largest sum and return that sum.", "medium", ["array", "dp", "greedy"], ["amazon", "google", "microsoft"], "1 ≤ nums.length ≤ 10^5\n-10^4 ≤ nums[i] ≤ 10^4", [
    { input: '{"nums":[-2,1,-3,4,-1,2,1,-5,4]}', output: '6', explanation: "The subarray [4,-1,2,1] has sum 6." },
    { input: '{"nums":[1]}', output: '1', explanation: "The only subarray is [1]." },
    { input: '{"nums":[-3,-2,-5]}', output: '-2', explanation: "Choose the least negative single element." },
  ], `${read}let best=input.nums[0],current=input.nums[0];for(let i=1;i<input.nums.length;i++){current=Math.max(input.nums[i],current+input.nums[i]);best=Math.max(best,current)}console.log(best)`, ["At each position, decide whether to extend the previous subarray or start fresh.", "Track the best sum ending at the current index."]),
  problem("Number of Islands", "Given a grid of `'1'` land and `'0'` water, return the number of connected islands. Cells connect only vertically and horizontally.", "medium", ["graph", "matrix", "dfs"], ["amazon", "google", "meta"], "1 ≤ grid.length, grid[0].length ≤ 300\ngrid contains only '0' and '1'.", [
    { input: '{"grid":[["1","1","0"],["1","0","0"],["0","0","1"]]}', output: '2', explanation: "There is one top-left island and one bottom-right island." },
    { input: '{"grid":[["0","0"],["0","0"]]}', output: '0', explanation: "There is no land." },
    { input: '{"grid":[["1"]]}', output: '1', explanation: "One land cell is one island." },
  ], `${read}const g=input.grid.map(r=>[...r]);let count=0;const visit=(r,c)=>{if(r<0||c<0||r===g.length||c===g[0].length||g[r][c]!=='1')return;g[r][c]='0';visit(r+1,c);visit(r-1,c);visit(r,c+1);visit(r,c-1)};for(let r=0;r<g.length;r++)for(let c=0;c<g[0].length;c++)if(g[r][c]==='1'){count++;visit(r,c)}console.log(count)`, ["When you discover land, mark every connected land cell as visited.", "Depth-first search or breadth-first search both work."]),
  problem("Merge Intervals", "Given an array of intervals where `intervals[i] = [start, end]`, merge all overlapping intervals and return the result.", "medium", ["array", "intervals", "greedy"], ["google", "amazon", "facebook".replace("facebook", "meta")], "1 ≤ intervals.length ≤ 10^4\n0 ≤ start ≤ end ≤ 10^4", [
    { input: '{"intervals":[[1,3],[2,6],[8,10],[15,18]]}', output: '[[1,6],[8,10],[15,18]]', explanation: "[1,3] and [2,6] overlap." },
    { input: '{"intervals":[[1,4],[4,5]]}', output: '[[1,5]]', explanation: "Touching intervals merge." },
    { input: '{"intervals":[[1,2],[3,4]]}', output: '[[1,2],[3,4]]', explanation: "No intervals overlap." },
  ], `${read}const a=input.intervals.sort((x,y)=>x[0]-y[0]),out=[];for(const x of a){const last=out[out.length-1];if(last&&x[0]<=last[1])last[1]=Math.max(last[1],x[1]);else out.push([...x])}console.log(JSON.stringify(out))`, ["Sort intervals by their start value first.", "Compare each interval with the most recently merged result."]),
];

async function seed() {
  if (!process.env.DB_CONNECT_STRING) throw new Error("DB_CONNECT_STRING is required to seed problems.");
  await mongoose.connect(process.env.DB_CONNECT_STRING);
  const author = await User.findOneAndUpdate(
    { emailId: "content@algoforge.dev" },
    { $setOnInsert: { firstName: "AlgoForge", lastName: "Content", emailId: "content@algoforge.dev", role: "admin", password: "seeded-content-account" } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  let created = 0;
  for (const entry of catalog) {
    const result = await Problem.updateOne({ title: entry.title }, { $setOnInsert: { ...entry, problemCreator: author._id } }, { upsert: true });
    if (result.upsertedCount) created++;
  }
  console.log(`Seed complete: ${created} new problems added; ${catalog.length - created} already existed.`);
  await mongoose.disconnect();
}

seed().catch((error) => { console.error("Problem seed failed:", error.message); mongoose.disconnect(); process.exitCode = 1; });
