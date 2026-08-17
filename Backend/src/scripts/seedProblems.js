require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("../models/problems");
const User = require("../models/user");
const StudyPlan = require("../models/studyPlan");

const jsStarter = `/**
 * @param {object} input
 * @return {any}
 */
function solve(input) {
  // Write your solution here
}`;

const cppStarter = `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>

using namespace std;

class Solution {
public:
    // Write your solution here
    
};`;

const javaStarter = `import java.util.*;

class Solution {
    // Write your solution here
    
}`;

const makeSolutions = (jsCode, cppCode, javaCode) => [
  { language: "javascript", completeCode: jsCode.trim() },
  { language: "c++", completeCode: cppCode.trim() },
  { language: "java", completeCode: javaCode.trim() }
];

const problem = (title, description, difficulty, tags, companies, constraints, cases, solutions, editorial, hints, track) => ({
  title,
  description,
  difficulty,
  tags,
  companies,
  constraints,
  hints,
  track: track || "Foundation",
  editorial: editorial || "",
  visibleTestCases: cases.slice(0, 2),
  hiddenTestCases: cases.slice(2),
  startCode: [
    { language: "javascript", initialCode: jsStarter },
    { language: "c++", initialCode: cppStarter },
    { language: "java", initialCode: javaStarter }
  ],
  referenceSolution: Array.isArray(solutions) ? solutions : [{ language: "javascript", completeCode: solutions }],
});

const catalog = [
  // ==========================================
  // TRACK 1: FOUNDATION (12 Problems)
  // ==========================================
  problem(
    "Two Sum",
    "Given an array of integers `nums` and an integer `target`, return the indices of two distinct numbers whose sum equals `target`. Exactly one answer exists.",
    "easy",
    ["array", "hashmap"],
    ["amazon", "google", "meta"],
    "2 ≤ nums.length ≤ 10^4\n-10^9 ≤ nums[i], target ≤ 10^9",
    [
      { input: '{"nums":[2,7,11,15],"target":9}', output: '[0,1]', explanation: "nums[0] + nums[1] = 9." },
      { input: '{"nums":[3,2,4],"target":6}', output: '[1,2]', explanation: "nums[1] + nums[2] = 6." },
      { input: '{"nums":[3,3],"target":6}', output: '[0,1]', explanation: "Use two different positions." },
      { input: '{"nums":[1,5,8,3],"target":8}', output: '[1,3]', explanation: "5 + 3 = 8." }
    ],
    makeSolutions(
      `function solve(input) {
  const seen = new Map();
  for (let i = 0; i < input.nums.length; i++) {
    const need = input.target - input.nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(input.nums[i], i);
  }
  return [];
}`,
      `#include <vector>
#include <unordered_map>
using namespace std;
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); i++) {
            int comp = target - nums[i];
            if (seen.count(comp)) return {seen[comp], i};
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
      `import java.util.*;
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) return new int[] { map.get(comp), i };
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}`
    ),
    "### Approach: One-Pass Hash Map\nStore each number and its index in a hash map as you iterate. For each number, check if its complement `target - nums[i]` is already in the map.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(n)$",
    ["Remember visited values.", "Check if complement exists in the map."],
    "Foundation"
  ),

  problem(
    "Valid Palindrome",
    "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
    "easy",
    ["string", "two-pointers"],
    ["meta", "amazon", "microsoft"],
    "1 ≤ s.length ≤ 2 × 10^5\ns consists only of printable ASCII characters.",
    [
      { input: '{"s":"A man, a plan, a canal: Panama"}', output: 'true', explanation: "\"amanaplanacanalpanama\" is a palindrome." },
      { input: '{"s":"race a car"}', output: 'false', explanation: "\"raceacar\" is not a palindrome." },
      { input: '{"s":" "}', output: 'true', explanation: "An empty string is a palindrome." },
      { input: '{"s":"0P"}', output: 'false', explanation: "\"0p\" is not a palindrome." }
    ],
    makeSolutions(
      `function solve(input) {
  const clean = input.s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let l = 0, r = clean.length - 1;
  while (l < r) {
    if (clean[l] !== clean[r]) return false;
    l++; r--;
  }
  return true;
}`,
      `#include <string>
#include <cctype>
using namespace std;
class Solution {
public:
    bool isPalindrome(string s) {
        int l = 0, r = s.size() - 1;
        while (l < r) {
            while (l < r && !isalnum(s[l])) l++;
            while (l < r && !isalnum(s[r])) r--;
            if (tolower(s[l]) != tolower(s[r])) return false;
            l++; r--;
        }
        return true;
    }
};`,
      `class Solution {
    public boolean isPalindrome(String s) {
        int l = 0, r = s.length() - 1;
        while (l < r) {
            while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;
            while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;
            if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) return false;
            l++; r--;
        }
        return true;
    }
}`
    ),
    "### Approach: Two Pointers\nCompare characters from both ends while skipping non-alphanumeric characters.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(1)$",
    ["Use two pointers starting at opposite ends.", "Skip non-alphanumeric characters."],
    "Foundation"
  ),

  problem(
    "Best Time to Buy and Sell Stock",
    "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve.",
    "easy",
    ["array", "greedy"],
    ["amazon", "google", "meta", "apple"],
    "1 ≤ prices.length ≤ 10^5\n0 ≤ prices[i] ≤ 10^4",
    [
      { input: '{"prices":[7,1,5,3,6,4]}', output: '5', explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5." },
      { input: '{"prices":[7,6,4,3,1]}', output: '0', explanation: "No profit can be made." },
      { input: '{"prices":[2,4,1]}', output: '2', explanation: "Buy at 2 and sell at 4." },
      { input: '{"prices":[1,2]}', output: '1', explanation: "Buy at 1 and sell at 2." }
    ],
    makeSolutions(
      `function solve(input) {
  let minP = Infinity, maxP = 0;
  for (const p of input.prices) {
    minP = Math.min(minP, p);
    maxP = Math.max(maxP, p - minP);
  }
  return maxP;
}`,
      `#include <vector>
#include <algorithm>
using namespace std;
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minP = 1e9, maxP = 0;
        for (int p : prices) {
            minP = min(minP, p);
            maxP = max(maxP, p - minP);
        }
        return maxP;
    }
};`,
      `class Solution {
    public int maxProfit(int[] prices) {
        int minP = Integer.MAX_VALUE, maxP = 0;
        for (int p : prices) {
            minP = Math.min(minP, p);
            maxP = Math.max(maxP, p - minP);
        }
        return maxP;
    }
}`
    ),
    "### Approach: One-Pass Greedy\nKeep track of the minimum price observed so far, and calculate the maximum profit if sold on the current day.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(1)$",
    ["Track the lowest price seen so far."],
    "Foundation"
  ),

  problem(
    "Contains Duplicate",
    "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
    "easy",
    ["array", "hashmap"],
    ["amazon", "apple", "microsoft"],
    "1 ≤ nums.length ≤ 10^5\n-10^9 ≤ nums[i] ≤ 10^9",
    [
      { input: '{"nums":[1,2,3,1]}', output: 'true', explanation: "1 appears twice." },
      { input: '{"nums":[1,2,3,4]}', output: 'false', explanation: "All elements are distinct." },
      { input: '{"nums":[1,1,1,3,3,4,3,2,4,2]}', output: 'true', explanation: "Multiple duplicates." },
      { input: '{"nums":[99]}', output: 'false', explanation: "Single element." }
    ],
    makeSolutions(
      `function solve(input) {
  const seen = new Set();
  for (const n of input.nums) {
    if (seen.has(n)) return true;
    seen.add(n);
  }
  return false;
}`,
      `#include <vector>
#include <unordered_set>
using namespace std;
class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> seen;
        for (int n : nums) {
            if (seen.count(n)) return true;
            seen.insert(n);
        }
        return false;
    }
};`,
      `import java.util.*;
class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int n : nums) {
            if (!seen.add(n)) return true;
        }
        return false;
    }
}`
    ),
    "### Approach: Hash Set\nInsert numbers into a Set; if an element already exists in the set, a duplicate is found.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(n)$",
    ["Use a HashSet for O(1) lookups."],
    "Foundation"
  ),

  problem(
    "Valid Anagram",
    "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
    "easy",
    ["string", "hashmap"],
    ["amazon", "uber", "spotify", "google"],
    "1 ≤ s.length, t.length ≤ 5 × 10^4\ns and t consist of lowercase English letters.",
    [
      { input: '{"s":"anagram","t":"nagaram"}', output: 'true', explanation: "Both strings have matching character counts." },
      { input: '{"s":"rat","t":"car"}', output: 'false', explanation: "Characters differ." },
      { input: '{"s":"a","t":"a"}', output: 'true', explanation: "Identical characters." },
      { input: '{"s":"ab","t":"a"}', output: 'false', explanation: "Different lengths." }
    ],
    makeSolutions(
      `function solve(input) {
  const { s, t } = input;
  if (s.length !== t.length) return false;
  const count = {};
  for (const c of s) count[c] = (count[c] || 0) + 1;
  for (const c of t) {
    if (!count[c]) return false;
    count[c]--;
  }
  return true;
}`,
      `#include <string>
#include <vector>
using namespace std;
class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.length() != t.length()) return false;
        vector<int> count(26, 0);
        for (char c : s) count[c - 'a']++;
        for (char c : t) if (--count[c - 'a'] < 0) return false;
        return true;
    }
};`,
      `class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] count = new int[26];
        for (char c : s.toCharArray()) count[c - 'a']++;
        for (char c : t.toCharArray()) if (--count[c - 'a'] < 0) return false;
        return true;
    }
}`
    ),
    "### Approach: Frequency Array\nCount frequencies in a fixed array of size 26.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(1)$",
    ["Count character occurrences."],
    "Foundation"
  ),

  problem(
    "Maximum Subarray",
    "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
    "medium",
    ["array", "greedy", "dp"],
    ["amazon", "google", "microsoft"],
    "1 ≤ nums.length ≤ 10^5\n-10^4 ≤ nums[i] ≤ 10^4",
    [
      { input: '{"nums":[-2,1,-3,4,-1,2,1,-5,4]}', output: '6', explanation: "Subarray [4,-1,2,1] has sum 6." },
      { input: '{"nums":[1]}', output: '1', explanation: "Single element sum." },
      { input: '{"nums":[-3,-2,-5]}', output: '-2', explanation: "Least negative single element." },
      { input: '{"nums":[5,4,-1,7,8]}', output: '23', explanation: "Total sum 23." }
    ],
    makeSolutions(
      `function solve(input) {
  let curr = input.nums[0], maxS = input.nums[0];
  for (let i = 1; i < input.nums.length; i++) {
    curr = Math.max(input.nums[i], curr + input.nums[i]);
    maxS = Math.max(maxS, curr);
  }
  return maxS;
}`,
      `#include <vector>
#include <algorithm>
using namespace std;
class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int curr = nums[0], maxS = nums[0];
        for (int i = 1; i < nums.size(); i++) {
            curr = max(nums[i], curr + nums[i]);
            maxS = max(maxS, curr);
        }
        return maxS;
    }
};`,
      `class Solution {
    public int maxSubArray(int[] nums) {
        int curr = nums[0], maxS = nums[0];
        for (int i = 1; i < nums.length; i++) {
            curr = Math.max(nums[i], curr + nums[i]);
            maxS = Math.max(maxS, curr);
        }
        return maxS;
    }
}`
    ),
    "### Approach: Kadane's Algorithm\n`curr = max(nums[i], curr + nums[i])` deciding to start anew or extend.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(1)$",
    ["Kadane's algorithm."],
    "Foundation"
  ),

  problem(
    "Move Zeroes",
    "Given an integer array `nums`, move all `0`'s to the end of it while maintaining the relative order of the non-zero elements. You must do this in-place.",
    "easy",
    ["array", "two-pointers"],
    ["meta", "apple", "amazon"],
    "1 ≤ nums.length ≤ 10^4\n-2^31 ≤ nums[i] ≤ 2^31 - 1",
    [
      { input: '{"nums":[0,1,0,3,12]}', output: '[1,3,12,0,0]', explanation: "Non-zeros moved to front." },
      { input: '{"nums":[0]}', output: '[0]', explanation: "Single zero." },
      { input: '{"nums":[1,2,3]}', output: '[1,2,3]', explanation: "No zeroes." },
      { input: '{"nums":[0,0,1]}', output: '[1,0,0]', explanation: "Leading zeroes moved." }
    ],
    makeSolutions(
      `function solve(input) {
  const nums = [...input.nums];
  let lastNonZero = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      const tmp = nums[lastNonZero];
      nums[lastNonZero] = nums[i];
      nums[i] = tmp;
      lastNonZero++;
    }
  }
  return nums;
}`,
      `#include <vector>
using namespace std;
class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int last = 0;
        for (int i = 0; i < nums.size(); i++) {
            if (nums[i] != 0) swap(nums[last++], nums[i]);
        }
    }
};`,
      `class Solution {
    public void moveZeroes(int[] nums) {
        int last = 0;
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != 0) {
                int tmp = nums[last];
                nums[last] = nums[i];
                nums[i] = tmp;
                last++;
            }
        }
    }
}`
    ),
    "### Approach: Two Pointers In-Place Swap\nMaintain a pointer to the position of the next non-zero element.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(1)$",
    ["Use two pointers: read pointer and write pointer."],
    "Foundation"
  ),

  problem(
    "Squares of a Sorted Array",
    "Given an integer array `nums` sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order.",
    "easy",
    ["array", "two-pointers"],
    ["google", "meta", "amazon"],
    "1 ≤ nums.length ≤ 10^4\n-10^4 ≤ nums[i] ≤ 10^4",
    [
      { input: '{"nums":[-4,-1,0,3,10]}', output: '[0,1,9,16,100]', explanation: "Squares sorted." },
      { input: '{"nums":[-7,-3,2,3,11]}', output: '[4,9,9,49,121]', explanation: "Squares sorted." },
      { input: '{"nums":[-1]}', output: '[1]', explanation: "Single element." },
      { input: '{"nums":[1,2,3]}', output: '[1,4,9]', explanation: "Positive array." }
    ],
    makeSolutions(
      `function solve(input) {
  const nums = input.nums, n = nums.length;
  const res = Array(n);
  let l = 0, r = n - 1, idx = n - 1;
  while (l <= r) {
    const sl = nums[l] * nums[l], sr = nums[r] * nums[r];
    if (sl > sr) { res[idx--] = sl; l++; }
    else { res[idx--] = sr; r--; }
  }
  return res;
}`,
      `#include <vector>
#include <cmath>
using namespace std;
class Solution {
public:
    vector<int> sortedSquares(vector<int>& nums) {
        int n = nums.size(), l = 0, r = n - 1, idx = n - 1;
        vector<int> res(n);
        while (l <= r) {
            if (abs(nums[l]) > abs(nums[r])) { res[idx--] = nums[l] * nums[l]; l++; }
            else { res[idx--] = nums[r] * nums[r]; r--; }
        }
        return res;
    }
};`,
      `class Solution {
    public int[] sortedSquares(int[] nums) {
        int n = nums.length, l = 0, r = n - 1, idx = n - 1;
        int[] res = new int[n];
        while (l <= r) {
            if (Math.abs(nums[l]) > Math.abs(nums[r])) { res[idx--] = nums[l] * nums[l]; l++; }
            else { res[idx--] = nums[r] * nums[r]; r--; }
        }
        return res;
    }
}`
    ),
    "### Approach: Two Pointers from Ends\nThe largest square must come from either the far left or far right.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(1)$",
    ["Fill the result array from back to front."],
    "Foundation"
  ),

  problem(
    "Plus One",
    "You are given a large integer represented as an integer array `digits`, where each `digits[i]` is the `i`th digit of the integer. Increment the large integer by one and return the resulting array of digits.",
    "easy",
    ["array", "math"],
    ["google", "amazon", "microsoft"],
    "1 ≤ digits.length ≤ 100\n0 ≤ digits[i] ≤ 9",
    [
      { input: '{"digits":[1,2,3]}', output: '[1,2,4]', explanation: "123 + 1 = 124." },
      { input: '{"digits":[4,3,2,1]}', output: '[4,3,2,2]', explanation: "4321 + 1 = 4322." },
      { input: '{"digits":[9]}', output: '[1,0]', explanation: "9 + 1 = 10." },
      { input: '{"digits":[9,9,9]}', output: '[1,0,0,0]', explanation: "999 + 1 = 1000." }
    ],
    makeSolutions(
      `function solve(input) {
  const d = [...input.digits];
  for (let i = d.length - 1; i >= 0; i--) {
    if (d[i] < 9) { d[i]++; return d; }
    d[i] = 0;
  }
  return [1, ...d];
}`,
      `#include <vector>
using namespace std;
class Solution {
public:
    vector<int> plusOne(vector<int>& digits) {
        for (int i = digits.size() - 1; i >= 0; i--) {
            if (digits[i] < 9) { digits[i]++; return digits; }
            digits[i] = 0;
        }
        digits.insert(digits.begin(), 1);
        return digits;
    }
};`,
      `class Solution {
    public int[] plusOne(int[] digits) {
        for (int i = digits.length - 1; i >= 0; i--) {
            if (digits[i] < 9) { digits[i]++; return digits; }
            digits[i] = 0;
        }
        int[] res = new int[digits.length + 1];
        res[0] = 1;
        return res;
    }
}`
    ),
    "### Approach: Reverse Carry\nIterate from right to left, carrying over when a 9 becomes 0.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(1)$",
    ["Add 1 to the last digit and propagate carry."],
    "Foundation"
  ),

  problem(
    "Majority Element",
    "Given an array `nums` of size `n`, return the majority element. The majority element is the element that appears more than `⌊n / 2⌋` times. You may assume that the majority element always exists in the array.",
    "easy",
    ["array", "hashmap"],
    ["amazon", "google", "meta"],
    "1 ≤ nums.length ≤ 5 × 10^4\n-10^9 ≤ nums[i] ≤ 10^9",
    [
      { input: '{"nums":[3,2,3]}', output: '3', explanation: "3 appears twice in length 3." },
      { input: '{"nums":[2,2,1,1,1,2,2]}', output: '2', explanation: "2 appears 4 times in length 7." },
      { input: '{"nums":[1]}', output: '1', explanation: "Single element." },
      { input: '{"nums":[6,5,5]}', output: '5', explanation: "5 appears twice." }
    ],
    makeSolutions(
      `function solve(input) {
  let cand = 0, count = 0;
  for (const n of input.nums) {
    if (count === 0) cand = n;
    count += (n === cand) ? 1 : -1;
  }
  return cand;
}`,
      `#include <vector>
using namespace std;
class Solution {
public:
    int majorityElement(vector<int>& nums) {
        int cand = 0, count = 0;
        for (int n : nums) {
            if (count == 0) cand = n;
            count += (n == cand) ? 1 : -1;
        }
        return cand;
    }
};`,
      `class Solution {
    public int majorityElement(int[] nums) {
        int cand = 0, count = 0;
        for (int n : nums) {
            if (count == 0) cand = n;
            count += (n == cand) ? 1 : -1;
        }
        return cand;
    }
}`
    ),
    "### Approach: Boyer-Moore Voting Algorithm\nTrack candidate and counter in $O(1)$ space.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(1)$",
    ["Boyer-Moore Voting."],
    "Foundation"
  ),

  problem(
    "Single Number",
    "Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one. You must implement a solution with a linear runtime complexity and use only constant extra space.",
    "easy",
    ["array", "bit-manipulation"],
    ["amazon", "apple", "google"],
    "1 ≤ nums.length ≤ 3 × 10^4\n-3 × 10^4 ≤ nums[i] ≤ 3 × 10^4",
    [
      { input: '{"nums":[2,2,1]}', output: '1', explanation: "1 appears once." },
      { input: '{"nums":[4,1,2,1,2]}', output: '4', explanation: "4 appears once." },
      { input: '{"nums":[1]}', output: '1', explanation: "Single element." },
      { input: '{"nums":[0,1,0]}', output: '1', explanation: "1 is unique." }
    ],
    makeSolutions(
      `function solve(input) {
  return input.nums.reduce((acc, x) => acc ^ x, 0);
}`,
      `#include <vector>
using namespace std;
class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int res = 0;
        for (int n : nums) res ^= n;
        return res;
    }
};`,
      `class Solution {
    public int singleNumber(int[] nums) {
        int res = 0;
        for (int n : nums) res ^= n;
        return res;
    }
}`
    ),
    "### Approach: XOR Bit Manipulation\n$x \\oplus x = 0$ and $x \\oplus 0 = x$.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(1)$",
    ["XOR all numbers together."],
    "Foundation"
  ),

  problem(
    "Product of Array Except Self",
    "Return an array where each element at index `i` equals the product of all values in `nums` except `nums[i]`. Do not use division and write an algorithm in $O(n)$ time.",
    "medium",
    ["array", "prefix-sum"],
    ["amazon", "meta", "apple"],
    "2 ≤ nums.length ≤ 10^5\n-30 ≤ nums[i] ≤ 30",
    [
      { input: '{"nums":[1,2,3,4]}', output: '[24,12,8,6]', explanation: "Prefix and suffix product." },
      { input: '{"nums":[-1,1,0,-3,3]}', output: '[0,0,9,0,0]', explanation: "Single zero case." },
      { input: '{"nums":[2,3]}', output: '[3,2]', explanation: "2 elements." },
      { input: '{"nums":[5,0,2]}', output: '[0,10,0]', explanation: "Zero at index 1." }
    ],
    makeSolutions(
      `function solve(input) {
  const a = input.nums, n = a.length, out = Array(n).fill(1);
  let p = 1;
  for (let i = 0; i < n; i++) { out[i] = p; p *= a[i]; }
  p = 1;
  for (let i = n - 1; i >= 0; i--) { out[i] *= p; p *= a[i]; }
  return out;
}`,
      `#include <vector>
using namespace std;
class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size(), p = 1;
        vector<int> out(n, 1);
        for (int i = 0; i < n; i++) { out[i] = p; p *= nums[i]; }
        p = 1;
        for (int i = n - 1; i >= 0; i--) { out[i] *= p; p *= nums[i]; }
        return out;
    }
};`,
      `class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length, p = 1;
        int[] out = new int[n];
        for (int i = 0; i < n; i++) { out[i] = p; p *= nums[i]; }
        p = 1;
        for (int i = n - 1; i >= 0; i--) { out[i] *= p; p *= nums[i]; }
        return out;
    }
}`
    ),
    "### Approach: Prefix and Suffix Passes\nCompute prefix products left-to-right, then suffix products right-to-left.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(1)$ extra",
    ["Prefix and suffix products."],
    "Foundation"
  ),

  // ==========================================
  // TRACK 2: INTERVIEW CORE (18 Problems)
  // ==========================================
  problem(
    "3Sum",
    "Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0` without duplicates.",
    "medium",
    ["array", "two-pointers"],
    ["meta", "amazon", "google", "microsoft"],
    "3 ≤ nums.length ≤ 3000\n-10^5 ≤ nums[i] ≤ 10^5",
    [
      { input: '{"nums":[-1,0,1,2,-1,-4]}', output: '[[-1,-1,2],[-1,0,1]]', explanation: "Triplets summing to zero." },
      { input: '{"nums":[0,1,1]}', output: '[]', explanation: "No triplet." },
      { input: '{"nums":[0,0,0]}', output: '[[0,0,0]]', explanation: "All zeros." },
      { input: '{"nums":[-2,0,1,1,2]}', output: '[[-2,0,2],[-2,1,1]]', explanation: "Multiple triplets." }
    ],
    makeSolutions(
      `function solve(input) {
  const nums = input.nums.sort((a, b) => a - b), res = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const sum = nums[i] + nums[l] + nums[r];
      if (sum === 0) {
        res.push([nums[i], nums[l], nums[r]]);
        while (l < r && nums[l] === nums[l + 1]) l++;
        while (l < r && nums[r] === nums[r - 1]) r--;
        l++; r--;
      } else if (sum < 0) l++;
      else r--;
    }
  }
  return res;
}`,
      `#include <vector>
#include <algorithm>
using namespace std;
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> res;
        for (int i = 0; i < (int)nums.size() - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1, r = nums.size() - 1;
            while (l < r) {
                int sum = nums[i] + nums[l] + nums[r];
                if (sum == 0) {
                    res.push_back({nums[i], nums[l], nums[r]});
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++; r--;
                } else if (sum < 0) l++;
                else r--;
            }
        }
        return res;
    }
};`,
      `import java.util.*;
class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1, r = nums.length - 1;
            while (l < r) {
                int sum = nums[i] + nums[l] + nums[r];
                if (sum == 0) {
                    res.add(Arrays.asList(nums[i], nums[l], nums[r]));
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++; r--;
                } else if (sum < 0) l++;
                else r--;
            }
        }
        return res;
    }
}`
    ),
    "### Approach: Sorting + Two Pointers\nSort first, fix one element, and use two pointers to find pairs summing to $-nums[i]$.\n\n- **Time Complexity:** $O(n^2)$\n- **Space Complexity:** $O(1)$",
    ["Sort the array first."],
    "Interview Core"
  ),

  problem(
    "Container With Most Water",
    "Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
    "medium",
    ["array", "two-pointers", "greedy"],
    ["google", "amazon", "meta"],
    "2 ≤ height.length ≤ 10^5\n0 ≤ height[i] ≤ 10^4",
    [
      { input: '{"height":[1,8,6,2,5,4,8,3,7]}', output: '49', explanation: "Area between 8 and 7." },
      { input: '{"height":[1,1]}', output: '1', explanation: "Area 1." },
      { input: '{"height":[4,3,2,1,4]}', output: '16', explanation: "Area 16." },
      { input: '{"height":[1,2,1]}', output: '2', explanation: "Area 2." }
    ],
    makeSolutions(
      `function solve(input) {
  const h = input.height;
  let l = 0, r = h.length - 1, maxA = 0;
  while (l < r) {
    maxA = Math.max(maxA, Math.min(h[l], h[r]) * (r - l));
    if (h[l] < h[r]) l++;
    else r--;
  }
  return maxA;
}`,
      `#include <vector>
#include <algorithm>
using namespace std;
class Solution {
public:
    int maxArea(vector<int>& height) {
        int l = 0, r = height.size() - 1, maxA = 0;
        while (l < r) {
            maxA = max(maxA, min(height[l], height[r]) * (r - l));
            if (height[l] < height[r]) l++;
            else r--;
        }
        return maxA;
    }
};`,
      `class Solution {
    public int maxArea(int[] height) {
        int l = 0, r = height.length - 1, maxA = 0;
        while (l < r) {
            maxA = Math.max(maxA, Math.min(height[l], height[r]) * (r - l));
            if (height[l] < height[r]) l++;
            else r--;
        }
        return maxA;
    }
}`
    ),
    "### Approach: Two Pointers from Outer Bounds\nMove the pointer with the smaller height inward.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(1)$",
    ["Start from ends."],
    "Interview Core"
  ),

  problem(
    "Longest Substring Without Repeating Characters",
    "Given a string `s`, find the length of the longest substring without duplicate characters.",
    "medium",
    ["string", "sliding-window", "hashmap"],
    ["amazon", "google", "meta"],
    "0 ≤ s.length ≤ 5 × 10^4",
    [
      { input: '{"s":"abcabcbb"}', output: '3', explanation: "\"abc\" length 3." },
      { input: '{"s":"bbbbb"}', output: '1', explanation: "Single char." },
      { input: '{"s":"pwwkew"}', output: '3', explanation: "\"wke\" length 3." },
      { input: '{"s":""}', output: '0', explanation: "Empty string." }
    ],
    makeSolutions(
      `function solve(input) {
  const last = new Map();
  let l = 0, best = 0;
  for (let r = 0; r < input.s.length; r++) {
    const c = input.s[r];
    if (last.has(c) && last.get(c) >= l) l = last.get(c) + 1;
    last.set(c, r);
    best = Math.max(best, r - l + 1);
  }
  return best;
}`,
      `#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> last;
        int l = 0, best = 0;
        for (int r = 0; r < s.size(); r++) {
            if (last.count(s[r]) && last[s[r]] >= l) l = last[s[r]] + 1;
            last[s[r]] = r;
            best = max(best, r - l + 1);
        }
        return best;
    }
};`,
      `import java.util.*;
class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> last = new HashMap<>();
        int l = 0, best = 0;
        for (int r = 0; r < s.length(); r++) {
            char c = s.charAt(r);
            if (last.containsKey(c) && last.get(c) >= l) l = last.get(c) + 1;
            last.put(c, r);
            best = Math.max(best, r - l + 1);
        }
        return best;
    }
}`
    ),
    "### Approach: Sliding Window\nSlide window right and advance left whenever a duplicate is found.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(\\min(n, |\\Sigma|))$",
    ["Sliding window."],
    "Interview Core"
  ),

  problem(
    "Valid Parentheses",
    "Given a string containing only brackets `()[]{}`, determine whether every opening bracket is closed in the correct order.",
    "easy",
    ["string", "stack"],
    ["amazon", "microsoft", "adobe"],
    "1 ≤ s.length ≤ 10^4",
    [
      { input: '{"s":"()[]{}"}', output: 'true', explanation: "Valid brackets." },
      { input: '{"s":"(]"}', output: 'false', explanation: "Mismatch." },
      { input: '{"s":"([)]"}', output: 'false', explanation: "Wrong order." },
      { input: '{"s":"{[]}"}', output: 'true', explanation: "Nested valid." }
    ],
    makeSolutions(
      `function solve(input) {
  const pairs = { ')': '(', ']': '[', '}': '{' }, st = [];
  for (const c of input.s) {
    if (!pairs[c]) st.push(c);
    else if (st.pop() !== pairs[c]) return false;
  }
  return st.length === 0;
}`,
      `#include <string>
#include <stack>
#include <unordered_map>
using namespace std;
class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        unordered_map<char, char> p = {{')', '('}, {']', '['}, {'}', '{'}};
        for (char c : s) {
            if (p.count(c)) {
                if (st.empty() || st.top() != p[c]) return false;
                st.pop();
            } else st.push(c);
        }
        return st.empty();
    }
};`,
      `import java.util.*;
class Solution {
    public boolean isValid(String s) {
        Stack<Character> st = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') st.push(')');
            else if (c == '{') st.push('}');
            else if (c == '[') st.push(']');
            else if (st.isEmpty() || st.pop() != c) return false;
        }
        return st.isEmpty();
    }
}`
    ),
    "### Approach: Stack LIFO\nPush opening brackets; match on closing.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(n)$",
    ["Use a stack."],
    "Interview Core"
  ),

  problem(
    "Group Anagrams",
    "Given an array of strings `strs`, group the anagrams together in any order.",
    "medium",
    ["array", "string", "hashmap"],
    ["amazon", "meta", "apple", "google"],
    "1 ≤ strs.length ≤ 10^4\n0 ≤ strs[i].length ≤ 100",
    [
      { input: '{"strs":["eat","tea","tan","ate","nat","bat"]}', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]', explanation: "Grouped anagrams." },
      { input: '{"strs":[""]}', output: '[[""]]', explanation: "Empty string." },
      { input: '{"strs":["a"]}', output: '[["a"]]', explanation: "Single char." },
      { input: '{"strs":["ab","ba","abc"]}', output: '[["abc"],["ab","ba"]]', explanation: "Two groups." }
    ],
    makeSolutions(
      `function solve(input) {
  const map = new Map();
  for (const s of input.strs) {
    const k = s.split('').sort().join('');
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(s);
  }
  return Array.from(map.values()).map(g => g.sort()).sort((a, b) => a.length - b.length || (a[0] || '').localeCompare(b[0] || ''));
}`,
      `#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> map;
        for (const string& s : strs) {
            string k = s; sort(k.begin(), k.end());
            map[k].push_back(s);
        }
        vector<vector<string>> res;
        for (auto& p : map) res.push_back(p.second);
        return res;
    }
};`,
      `import java.util.*;
class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();
        for (String s : strs) {
            char[] chars = s.toCharArray();
            Arrays.sort(chars);
            map.computeIfAbsent(new String(chars), k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(map.values());
    }
}`
    ),
    "### Approach: Canonical Sorted Key Map\nSort each string to use as the map key.\n\n- **Time Complexity:** $O(n \\cdot k \\log k)$\n- **Space Complexity:** $O(n \\cdot k)$",
    ["Sort each string to create a key."],
    "Interview Core"
  ),

  problem(
    "Longest Consecutive Sequence",
    "Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence in $O(n)$ time.",
    "medium",
    ["array", "hashmap"],
    ["google", "amazon", "spotify"],
    "0 ≤ nums.length ≤ 10^5\n-10^9 ≤ nums[i] ≤ 10^9",
    [
      { input: '{"nums":[100,4,200,1,3,2]}', output: '4', explanation: "Sequence [1, 2, 3, 4] has length 4." },
      { input: '{"nums":[0,3,7,2,5,8,4,6,0,1]}', output: '9', explanation: "Sequence 0 to 8 has length 9." },
      { input: '{"nums":[]}', output: '0', explanation: "Empty array." },
      { input: '{"nums":[9,1,4,7,3,-1,0,5,8,-1,6]}', output: '7', explanation: "Sequence length 7." }
    ],
    makeSolutions(
      `function solve(input) {
  const s = new Set(input.nums);
  let maxS = 0;
  for (const n of s) {
    if (!s.has(n - 1)) {
      let curr = n, streak = 1;
      while (s.has(curr + 1)) { curr++; streak++; }
      maxS = Math.max(maxS, streak);
    }
  }
  return maxS;
}`,
      `#include <vector>
#include <unordered_set>
#include <algorithm>
using namespace std;
class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> set(nums.begin(), nums.end());
        int maxStreak = 0;
        for (int n : set) {
            if (!set.count(n - 1)) {
                int curr = n, streak = 1;
                while (set.count(curr + 1)) { curr++; streak++; }
                maxStreak = max(maxStreak, streak);
            }
        }
        return maxStreak;
    }
};`,
      `import java.util.*;
class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int n : nums) set.add(n);
        int maxStreak = 0;
        for (int n : set) {
            if (!set.contains(n - 1)) {
                int curr = n, streak = 1;
                while (set.contains(curr + 1)) { curr++; streak++; }
                maxStreak = Math.max(maxStreak, streak);
            }
        }
        return maxStreak;
    }
}`
    ),
    "### Approach: Set Sequence Leaders\nOnly start counting when `num - 1` is not in the set.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(n)$",
    ["Only start counting from sequence starters."],
    "Interview Core"
  ),

  problem(
    "Merge Intervals",
    "Given an array of `intervals` where `intervals[i] = [start, end]`, merge all overlapping intervals.",
    "medium",
    ["array", "intervals", "greedy"],
    ["google", "amazon", "meta"],
    "1 ≤ intervals.length ≤ 10^4",
    [
      { input: '{"intervals":[[1,3],[2,6],[8,10],[15,18]]}', output: '[[1,6],[8,10],[15,18]]', explanation: "[1,3] and [2,6] merge." },
      { input: '{"intervals":[[1,4],[4,5]]}', output: '[[1,5]]', explanation: "Touching intervals merge." },
      { input: '{"intervals":[[1,2],[3,4]]}', output: '[[1,2],[3,4]]', explanation: "Non-overlapping." },
      { input: '{"intervals":[[1,4],[2,3]]}', output: '[[1,4]]', explanation: "Contained interval." }
    ],
    makeSolutions(
      `function solve(input) {
  const a = input.intervals.sort((x, y) => x[0] - y[0]), out = [];
  for (const x of a) {
    const last = out[out.length - 1];
    if (last && x[0] <= last[1]) last[1] = Math.max(last[1], x[1]);
    else out.push([...x]);
  }
  return out;
}`,
      `#include <vector>
#include <algorithm>
using namespace std;
class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> merged;
        for (const auto& iv : intervals) {
            if (merged.empty() || merged.back()[1] < iv[0]) merged.push_back(iv);
            else merged.back()[1] = max(merged.back()[1], iv[1]);
        }
        return merged;
    }
};`,
      `import java.util.*;
class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> merged = new ArrayList<>();
        for (int[] iv : intervals) {
            if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < iv[0]) merged.add(iv);
            else merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], iv[1]);
        }
        return merged.toArray(new int[merged.size()][]);
    }
}`
    ),
    "### Approach: Sort by Start\nIterate and merge overlapping intervals.\n\n- **Time Complexity:** $O(n \\log n)$\n- **Space Complexity:** $O(n)$",
    ["Sort by start time."],
    "Interview Core"
  ),

  problem(
    "Binary Search",
    "Given an array of integers `nums` sorted in ascending order, and an integer `target`, return its index if found, or `-1` otherwise.",
    "easy",
    ["array", "binary-search"],
    ["google", "microsoft", "linkedin"],
    "1 ≤ nums.length ≤ 10^5",
    [
      { input: '{"nums":[-1,0,3,5,9,12],"target":9}', output: '4', explanation: "9 at index 4." },
      { input: '{"nums":[-1,0,3,5,9,12],"target":2}', output: '-1', explanation: "2 not found." },
      { input: '{"nums":[5],"target":5}', output: '0', explanation: "Single element found." },
      { input: '{"nums":[1,3,5,7,9],"target":1}', output: '0', explanation: "Index 0." }
    ],
    makeSolutions(
      `function solve(input) {
  const { nums, target } = input;
  let l = 0, r = nums.length - 1;
  while (l <= r) {
    const m = Math.floor((l + r) / 2);
    if (nums[m] === target) return m;
    if (nums[m] < target) l = m + 1;
    else r = m - 1;
  }
  return -1;
}`,
      `#include <vector>
using namespace std;
class Solution {
public:
    int search(vector<int>& nums, int target) {
        int l = 0, r = nums.size() - 1;
        while (l <= r) {
            int m = l + (r - l) / 2;
            if (nums[m] == target) return m;
            if (nums[m] < target) l = m + 1;
            else r = m - 1;
        }
        return -1;
    }
};`,
      `class Solution {
    public int search(int[] nums, int target) {
        int l = 0, r = nums.length - 1;
        while (l <= r) {
            int m = l + (r - l) / 2;
            if (nums[m] == target) return m;
            if (nums[m] < target) l = m + 1;
            else r = m - 1;
        }
        return -1;
    }
}`
    ),
    "### Approach: Classic Binary Search\nHalve search space each step.\n\n- **Time Complexity:** $O(\\log n)$\n- **Space Complexity:** $O(1)$",
    ["Binary search."],
    "Interview Core"
  ),

  problem(
    "Search in Rotated Sorted Array",
    "Given a rotated sorted array `nums` and an integer `target`, return the index of `target` in $O(\\log n)$ time, or `-1` if not present.",
    "medium",
    ["array", "binary-search"],
    ["amazon", "meta", "google"],
    "1 ≤ nums.length ≤ 5000",
    [
      { input: '{"nums":[4,5,6,7,0,1,2],"target":0}', output: '4', explanation: "0 is at index 4." },
      { input: '{"nums":[4,5,6,7,0,1,2],"target":3}', output: '-1', explanation: "3 not in nums." },
      { input: '{"nums":[1],"target":0}', output: '-1', explanation: "Not found." },
      { input: '{"nums":[5,1,3],"target":5}', output: '0', explanation: "Target at index 0." }
    ],
    makeSolutions(
      `function solve(input) {
  const { nums, target } = input;
  let l = 0, r = nums.length - 1;
  while (l <= r) {
    const m = Math.floor((l + r) / 2);
    if (nums[m] === target) return m;
    if (nums[l] <= nums[m]) {
      if (target >= nums[l] && target < nums[m]) r = m - 1;
      else l = m + 1;
    } else {
      if (target > nums[m] && target <= nums[r]) l = m + 1;
      else r = m - 1;
    }
  }
  return -1;
}`,
      `#include <vector>
using namespace std;
class Solution {
public:
    int search(vector<int>& nums, int target) {
        int l = 0, r = nums.size() - 1;
        while (l <= r) {
            int m = l + (r - l) / 2;
            if (nums[m] == target) return m;
            if (nums[l] <= nums[m]) {
                if (target >= nums[l] && target < nums[m]) r = m - 1;
                else l = m + 1;
            } else {
                if (target > nums[m] && target <= nums[r]) l = m + 1;
                else r = m - 1;
            }
        }
        return -1;
    }
};`,
      `class Solution {
    public int search(int[] nums, int target) {
        int l = 0, r = nums.length - 1;
        while (l <= r) {
            int m = l + (r - l) / 2;
            if (nums[m] == target) return m;
            if (nums[l] <= nums[m]) {
                if (target >= nums[l] && target < nums[m]) r = m - 1;
                else l = m + 1;
            } else {
                if (target > nums[m] && target <= nums[r]) l = m + 1;
                else r = m - 1;
            }
        }
        return -1;
    }
}`
    ),
    "### Approach: Modified Binary Search\nIdentify which half is normally sorted.\n\n- **Time Complexity:** $O(\\log n)$\n- **Space Complexity:** $O(1)$",
    ["Check sorted half."],
    "Interview Core"
  ),

  problem(
    "Find Minimum in Rotated Sorted Array",
    "Given the sorted rotated array `nums` of unique elements, return the minimum element of this array in $O(\\log n)$ time.",
    "medium",
    ["array", "binary-search"],
    ["amazon", "microsoft", "apple"],
    "1 ≤ nums.length ≤ 5000",
    [
      { input: '{"nums":[3,4,5,1,2]}', output: '1', explanation: "Min is 1." },
      { input: '{"nums":[4,5,6,7,0,1,2]}', output: '0', explanation: "Min is 0." },
      { input: '{"nums":[11,13,15,17]}', output: '11', explanation: "Min is 11." },
      { input: '{"nums":[1]}', output: '1', explanation: "Single element." }
    ],
    makeSolutions(
      `function solve(input) {
  const nums = input.nums;
  let l = 0, r = nums.length - 1;
  while (l < r) {
    const m = Math.floor((l + r) / 2);
    if (nums[m] > nums[r]) l = m + 1;
    else r = m;
  }
  return nums[l];
}`,
      `#include <vector>
using namespace std;
class Solution {
public:
    int findMin(vector<int>& nums) {
        int l = 0, r = nums.size() - 1;
        while (l < r) {
            int m = l + (r - l) / 2;
            if (nums[m] > nums[r]) l = m + 1;
            else r = m;
        }
        return nums[l];
    }
};`,
      `class Solution {
    public int findMin(int[] nums) {
        int l = 0, r = nums.length - 1;
        while (l < r) {
            int m = l + (r - l) / 2;
            if (nums[m] > nums[r]) l = m + 1;
            else r = m;
        }
        return nums[l];
    }
}`
    ),
    "### Approach: Binary Search on Pivot\nCompare middle with right boundary.\n\n- **Time Complexity:** $O(\\log n)$\n- **Space Complexity:** $O(1)$",
    ["Compare nums[mid] with nums[right]."],
    "Interview Core"
  ),

  problem(
    "Search a 2D Matrix",
    "You are given an `m x n` integer matrix `matrix` with each row sorted and first element of each row greater than last of previous. Return `true` if `target` is in matrix or `false` in $O(\\log(m \\times n))$ time.",
    "medium",
    ["matrix", "binary-search"],
    ["google", "amazon", "microsoft"],
    "1 ≤ m, n ≤ 100",
    [
      { input: '{"matrix":[[1,3,5,7],[10,11,16,20],[23,30,34,60]],"target":3}', output: 'true', explanation: "3 exists in matrix." },
      { input: '{"matrix":[[1,3,5,7],[10,11,16,20],[23,30,34,60]],"target":13}', output: 'false', explanation: "13 not in matrix." },
      { input: '{"matrix":[[1]],"target":1}', output: 'true', explanation: "1 found." },
      { input: '{"matrix":[[1,3]],"target":3}', output: 'true', explanation: "Found in single row." }
    ],
    makeSolutions(
      `function solve(input) {
  const { matrix, target } = input;
  const m = matrix.length, n = matrix[0].length;
  let l = 0, r = m * n - 1;
  while (l <= r) {
    const mid = Math.floor((l + r) / 2);
    const val = matrix[Math.floor(mid / n)][mid % n];
    if (val === target) return true;
    if (val < target) l = mid + 1;
    else r = mid - 1;
  }
  return false;
}`,
      `#include <vector>
using namespace std;
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int m = matrix.size(), n = matrix[0].size();
        int l = 0, r = m * n - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            int val = matrix[mid / n][mid % n];
            if (val == target) return true;
            if (val < target) l = mid + 1;
            else r = mid - 1;
        }
        return false;
    }
};`,
      `class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        int m = matrix.length, n = matrix[0].length;
        int l = 0, r = m * n - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            int val = matrix[mid / n][mid % n];
            if (val == target) return true;
            if (val < target) l = mid + 1;
            else r = mid - 1;
        }
        return false;
    }
}`
    ),
    "### Approach: Flattened Binary Search\nTreat 2D matrix as a virtual 1D array.\n\n- **Time Complexity:** $O(\\log(m \\cdot n))$\n- **Space Complexity:** $O(1)$",
    ["Map 1D index to matrix[mid / n][mid % n]."],
    "Interview Core"
  ),

  problem(
    "Top K Frequent Elements",
    "Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. Return answer sorted for deterministic check.",
    "medium",
    ["array", "hashmap", "heap"],
    ["amazon", "meta", "google"],
    "1 ≤ nums.length ≤ 10^5\nk is in range [1, unique elements]",
    [
      { input: '{"nums":[1,1,1,2,2,3],"k":2}', output: '[1,2]', explanation: "1 and 2 are top 2 frequent." },
      { input: '{"nums":[1],"k":1}', output: '[1]', explanation: "Single element." },
      { input: '{"nums":[4,1,-1,2,-1,2,3],"k":2}', output: '[-1,2]', explanation: "-1 and 2 occur twice." },
      { input: '{"nums":[1,2],"k":2}', output: '[1,2]', explanation: "Both frequent." }
    ],
    makeSolutions(
      `function solve(input) {
  const map = new Map();
  for (const n of input.nums) map.set(n, (map.get(n) || 0) + 1);
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, input.k).map(x => x[0]).sort((a, b) => a - b);
}`,
      `#include <vector>
#include <unordered_map>
#include <queue>
#include <algorithm>
using namespace std;
class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> count;
        for (int n : nums) count[n]++;
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
        for (auto& p : count) {
            pq.push({p.second, p.first});
            if (pq.size() > k) pq.pop();
        }
        vector<int> res;
        while (!pq.empty()) { res.push_back(pq.top().second); pq.pop(); }
        sort(res.begin(), res.end());
        return res;
    }
};`,
      `import java.util.*;
class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int n : nums) count.put(n, count.getOrDefault(n, 0) + 1);
        PriorityQueue<Integer> pq = new PriorityQueue<>((a, b) -> count.get(a) - count.get(b));
        for (int n : count.keySet()) {
            pq.add(n);
            if (pq.size() > k) pq.poll();
        }
        int[] res = new int[k];
        for (int i = 0; i < k; i++) res[i] = pq.poll();
        Arrays.sort(res);
        return res;
    }
}`
    ),
    "### Approach: Min-Heap / Bucket Sort\nMaintain a min-heap of size $k$.\n\n- **Time Complexity:** $O(n \\log k)$\n- **Space Complexity:** $O(n)$",
    ["Min-heap of size k."],
    "Interview Core"
  ),

  problem(
    "Subarray Sum Equals K",
    "Given an array of integers `nums` and an integer `k`, return the total number of subarrays whose sum equals to `k`.",
    "medium",
    ["array", "hashmap", "prefix-sum"],
    ["meta", "amazon", "google"],
    "1 ≤ nums.length ≤ 2 × 10^4\n-1000 ≤ nums[i] ≤ 1000",
    [
      { input: '{"nums":[1,1,1],"k":2}', output: '2', explanation: "2 subarrays sum to 2." },
      { input: '{"nums":[1,2,3],"k":3}', output: '2', explanation: "[1,2] and [3] sum to 3." },
      { input: '{"nums":[1,-1,0],"k":0}', output: '3', explanation: "3 subarrays." },
      { input: '{"nums":[3],"k":3}', output: '1', explanation: "Single element." }
    ],
    makeSolutions(
      `function solve(input) {
  const map = new Map([[0, 1]]);
  let sum = 0, count = 0;
  for (const n of input.nums) {
    sum += n;
    if (map.has(sum - input.k)) count += map.get(sum - input.k);
    map.set(sum, (map.get(sum) || 0) + 1);
  }
  return count;
}`,
      `#include <vector>
#include <unordered_map>
using namespace std;
class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> map = {{0, 1}};
        int sum = 0, count = 0;
        for (int n : nums) {
            sum += n;
            if (map.count(sum - k)) count += map[sum - k];
            map[sum]++;
        }
        return count;
    }
};`,
      `import java.util.*;
class Solution {
    public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> map = new HashMap<>();
        map.put(0, 1);
        int sum = 0, count = 0;
        for (int n : nums) {
            sum += n;
            if (map.containsKey(sum - k)) count += map.get(sum - k);
            map.put(sum, map.getOrDefault(sum, 0) + 1);
        }
        return count;
    }
}`
    ),
    "### Approach: Prefix Sum Hash Map\nCount occurrences of `sum - k`.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(n)$",
    ["Prefix sum with map."],
    "Interview Core"
  ),

  problem(
    "Daily Temperatures",
    "Given an array of integers `temperatures` represents the daily temperatures, return an array `answer` such that `answer[i]` is the number of days you have to wait after the `i`th day to get a warmer temperature.",
    "medium",
    ["array", "stack"],
    ["meta", "amazon", "google"],
    "1 ≤ temperatures.length ≤ 10^5\n30 ≤ temperatures[i] ≤ 100",
    [
      { input: '{"temperatures":[73,74,75,71,69,72,76,73]}', output: '[1,1,4,2,1,1,0,0]', explanation: "Wait days for warmer temp." },
      { input: '{"temperatures":[30,40,50,60]}', output: '[1,1,1,0]', explanation: "Strictly increasing." },
      { input: '{"temperatures":[30,60,90]}', output: '[1,1,0]', explanation: "Immediate warmers." },
      { input: '{"temperatures":[90]}', output: '[0]', explanation: "Single day." }
    ],
    makeSolutions(
      `function solve(input) {
  const t = input.temperatures, n = t.length, res = Array(n).fill(0), st = [];
  for (let i = 0; i < n; i++) {
    while (st.length > 0 && t[i] > t[st[st.length - 1]]) {
      const prev = st.pop();
      res[prev] = i - prev;
    }
    st.push(i);
  }
  return res;
}`,
      `#include <vector>
#include <stack>
using namespace std;
class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = temperatures.size();
        vector<int> res(n, 0);
        stack<int> st;
        for (int i = 0; i < n; i++) {
            while (!st.empty() && temperatures[i] > temperatures[st.top()]) {
                int prev = st.top(); st.pop();
                res[prev] = i - prev;
            }
            st.push(i);
        }
        return res;
    }
};`,
      `import java.util.*;
class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] res = new int[n];
        Stack<Integer> st = new Stack<>();
        for (int i = 0; i < n; i++) {
            while (!st.isEmpty() && temperatures[i] > temperatures[st.peek()]) {
                int prev = st.pop();
                res[prev] = i - prev;
            }
            st.push(i);
        }
        return res;
    }
}`
    ),
    "### Approach: Monotonic Decreasing Stack\nStore indices in stack; pop when a higher temperature arrives.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(n)$",
    ["Monotonic stack."],
    "Interview Core"
  ),

  problem(
    "Min Stack",
    "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.",
    "medium",
    ["stack", "array"],
    ["amazon", "microsoft", "apple"],
    "Operations: [\"push\", \"push\", \"getMin\", \"pop\", \"top\", \"getMin\"] with values",
    [
      { input: '{"ops":["push","push","push","getMin","pop","top","getMin"],"vals":[-2,0,-3,null,null,null,null]}', output: '[-3,0,-2]', explanation: "Min stack operations." },
      { input: '{"ops":["push","getMin"],"vals":[5,null]}', output: '[5]', explanation: "Single item min." },
      { input: '{"ops":["push","push","top","getMin"],"vals":[1,2,null,null]}', output: '[2,1]', explanation: "Top and min." },
      { input: '{"ops":["push","push","pop","getMin"],"vals":[2,1,null,null]}', output: '[2]', explanation: "Popping min restores." }
    ],
    makeSolutions(
      `function solve(input) {
  const st = [], minSt = [], res = [];
  for (let i = 0; i < input.ops.length; i++) {
    const op = input.ops[i], val = input.vals[i];
    if (op === "push") {
      st.push(val);
      if (minSt.length === 0 || val <= minSt[minSt.length - 1]) minSt.push(val);
    } else if (op === "pop") {
      const popped = st.pop();
      if (popped === minSt[minSt.length - 1]) minSt.pop();
    } else if (op === "top") {
      res.push(st[st.length - 1]);
    } else if (op === "getMin") {
      res.push(minSt[minSt.length - 1]);
    }
  }
  return res;
}`,
      `#include <vector>
#include <stack>
using namespace std;
class MinStack {
    stack<int> st, minSt;
public:
    void push(int val) {
        st.push(val);
        if (minSt.empty() || val <= minSt.top()) minSt.push(val);
    }
    void pop() {
        if (st.top() == minSt.top()) minSt.pop();
        st.pop();
    }
    int top() { return st.top(); }
    int getMin() { return minSt.top(); }
};`,
      `import java.util.*;
class MinStack {
    private Stack<Integer> st = new Stack<>();
    private Stack<Integer> minSt = new Stack<>();
    public void push(int val) {
        st.push(val);
        if (minSt.isEmpty() || val <= minSt.peek()) minSt.push(val);
    }
    public void pop() {
        if (st.pop().equals(minSt.peek())) minSt.pop();
    }
    public int top() { return st.peek(); }
    public int getMin() { return minSt.peek(); }
}`
    ),
    "### Approach: Auxiliary Min Stack\nKeep parallel min-tracking stack.\n\n- **Time Complexity:** $O(1)$ all ops\n- **Space Complexity:** $O(n)$",
    ["Two stacks."],
    "Interview Core"
  ),

  problem(
    "Longest Repeating Character Replacement",
    "You are given a string `s` and an integer `k`. You can choose any character and change it to any other uppercase English character at most `k` times. Return the length of the longest substring containing the same letter.",
    "medium",
    ["string", "sliding-window", "hashmap"],
    ["amazon", "google", "uber"],
    "1 ≤ s.length ≤ 10^5\n0 ≤ k ≤ s.length",
    [
      { input: '{"s":"ABAB","k":2}', output: '4', explanation: "Replace two 'A's with 'B's." },
      { input: '{"s":"AABABBA","k":1}', output: '4', explanation: "Substring \"BBBB\" or \"AAAA\" length 4." },
      { input: '{"s":"AAAA","k":0}', output: '4', explanation: "All matching." },
      { input: '{"s":"ABBB","k":2}', output: '4', explanation: "Can replace 2 chars." }
    ],
    makeSolutions(
      `function solve(input) {
  const { s, k } = input, count = {};
  let l = 0, maxCount = 0, maxLen = 0;
  for (let r = 0; r < s.length; r++) {
    count[s[r]] = (count[s[r]] || 0) + 1;
    maxCount = Math.max(maxCount, count[s[r]]);
    while ((r - l + 1) - maxCount > k) {
      count[s[l]]--;
      l++;
    }
    maxLen = Math.max(maxLen, r - l + 1);
  }
  return maxLen;
}`,
      `#include <string>
#include <vector>
#include <algorithm>
using namespace std;
class Solution {
public:
    int characterReplacement(string s, int k) {
        vector<int> count(26, 0);
        int l = 0, maxCount = 0, maxLen = 0;
        for (int r = 0; r < s.size(); r++) {
            maxCount = max(maxCount, ++count[s[r] - 'A']);
            while ((r - l + 1) - maxCount > k) {
                count[s[l] - 'A']--;
                l++;
            }
            maxLen = max(maxLen, r - l + 1);
        }
        return maxLen;
    }
};`,
      `class Solution {
    public int characterReplacement(String s, int k) {
        int[] count = new int[26];
        int l = 0, maxCount = 0, maxLen = 0;
        for (int r = 0; r < s.length(); r++) {
            maxCount = Math.max(maxCount, ++count[s.charAt(r) - 'A']);
            while ((r - l + 1) - maxCount > k) {
                count[s.charAt(l) - 'A']--;
                l++;
            }
            maxLen = Math.max(maxLen, r - l + 1);
        }
        return maxLen;
    }
}`
    ),
    "### Approach: Sliding Window with Frequency\nCondition: `(windowLength - maxFreq) <= k`.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(1)$",
    ["Sliding window."],
    "Interview Core"
  ),

  problem(
    "Insert Interval",
    "You are given an array of non-overlapping intervals `intervals` sorted by `start_i` and a `newInterval`. Insert `newInterval` into `intervals` such that `intervals` is still sorted and non-overlapping.",
    "medium",
    ["array", "intervals", "greedy"],
    ["google", "meta", "linkedin"],
    "0 ≤ intervals.length ≤ 10^4",
    [
      { input: '{"intervals":[[1,3],[6,9]],"newInterval":[2,5]}', output: '[[1,5],[6,9]]', explanation: "[1,3] merges with [2,5]." },
      { input: '{"intervals":[[1,2],[3,5],[6,7],[8,10],[12,16]],"newInterval":[4,8]}', output: '[[1,2],[3,10],[12,16]]', explanation: "Merges overlapping." },
      { input: '{"intervals":[],"newInterval":[5,7]}', output: '[[5,7]]', explanation: "Insert into empty." },
      { input: '{"intervals":[[1,5]],"newInterval":[6,8]}', output: '[[1,5],[6,8]]', explanation: "Append after." }
    ],
    makeSolutions(
      `function solve(input) {
  const { intervals, newInterval } = input, res = [];
  let i = 0, n = intervals.length, cur = [...newInterval];
  while (i < n && intervals[i][1] < cur[0]) res.push(intervals[i++]);
  while (i < n && intervals[i][0] <= cur[1]) {
    cur[0] = Math.min(cur[0], intervals[i][0]);
    cur[1] = Math.max(cur[1], intervals[i][1]);
    i++;
  }
  res.push(cur);
  while (i < n) res.push(intervals[i++]);
  return res;
}`,
      `#include <vector>
#include <algorithm>
using namespace std;
class Solution {
public:
    vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
        vector<vector<int>> res;
        int i = 0, n = intervals.size();
        while (i < n && intervals[i][1] < newInterval[0]) res.push_back(intervals[i++]);
        while (i < n && intervals[i][0] <= newInterval[1]) {
            newInterval[0] = min(newInterval[0], intervals[i][0]);
            newInterval[1] = max(newInterval[1], intervals[i][1]);
            i++;
        }
        res.push_back(newInterval);
        while (i < n) res.push_back(intervals[i++]);
        return res;
    }
};`,
      `import java.util.*;
class Solution {
    public int[][] insert(int[][] intervals, int[] newInterval) {
        List<int[]> res = new ArrayList<>();
        int i = 0, n = intervals.length;
        while (i < n && intervals[i][1] < newInterval[0]) res.add(intervals[i++]);
        while (i < n && intervals[i][0] <= newInterval[1]) {
            newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
            newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
            i++;
        }
        res.add(newInterval);
        while (i < n) res.add(intervals[i++]);
        return res.toArray(new int[res.size()][]);
    }
}`
    ),
    "### Approach: Linear Scan\nThree phases: strictly left, overlapping merge, strictly right.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(n)$",
    ["Three stages."],
    "Interview Core"
  ),

  problem(
    "Trapping Rain Water",
    "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    "hard",
    ["array", "two-pointers", "stack", "dp"],
    ["amazon", "google", "meta"],
    "1 ≤ height.length ≤ 2 × 10^4",
    [
      { input: '{"height":[0,1,0,2,1,0,1,3,2,1,2,1]}', output: '6', explanation: "6 units of trapped water." },
      { input: '{"height":[4,2,0,3,2,5]}', output: '9', explanation: "9 units of water." },
      { input: '{"height":[1,2,3,4,5]}', output: '0', explanation: "Monotonic elevation." },
      { input: '{"height":[5,4,1,2]}', output: '1', explanation: "1 unit trapped." }
    ],
    makeSolutions(
      `function solve(input) {
  const h = input.height;
  let l = 0, r = h.length - 1, lMax = 0, rMax = 0, w = 0;
  while (l < r) {
    if (h[l] < h[r]) {
      if (h[l] >= lMax) lMax = h[l];
      else w += lMax - h[l];
      l++;
    } else {
      if (h[r] >= rMax) rMax = h[r];
      else w += rMax - h[r];
      r--;
    }
  }
  return w;
}`,
      `#include <vector>
#include <algorithm>
using namespace std;
class Solution {
public:
    int trap(vector<int>& height) {
        int l = 0, r = height.size() - 1, lMax = 0, rMax = 0, w = 0;
        while (l < r) {
            if (height[l] < height[r]) {
                if (height[l] >= lMax) lMax = height[l];
                else w += lMax - height[l];
                l++;
            } else {
                if (height[r] >= rMax) rMax = height[r];
                else w += rMax - height[r];
                r--;
            }
        }
        return w;
    }
};`,
      `class Solution {
    public int trap(int[] height) {
        int l = 0, r = height.length - 1, lMax = 0, rMax = 0, w = 0;
        while (l < r) {
            if (height[l] < height[r]) {
                if (height[l] >= lMax) lMax = height[l];
                else w += lMax - height[l];
                l++;
            } else {
                if (height[r] >= rMax) rMax = height[r];
                else w += rMax - height[r];
                r--;
            }
        }
        return w;
    }
}`
    ),
    "### Approach: Two Pointers\nAdvance pointer with smaller maximum height.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(1)$",
    ["Track lMax and rMax."],
    "Interview Core"
  ),

  // ==========================================
  // TRACK 3: TREES & GRAPHS (16 Problems)
  // ==========================================
  problem(
    "Maximum Depth of Binary Tree",
    "Given the root of a binary tree represented as an array of level-order values (with `null` for missing nodes), return its maximum depth.",
    "easy",
    ["tree", "dfs"],
    ["google", "amazon", "meta"],
    "0 ≤ nodes ≤ 10^4",
    [
      { input: '{"tree":[3,9,20,null,null,15,7]}', output: '3', explanation: "Depth is 3." },
      { input: '{"tree":[1,null,2]}', output: '2', explanation: "Depth is 2." },
      { input: '{"tree":[]}', output: '0', explanation: "Empty tree." },
      { input: '{"tree":[1]}', output: '1', explanation: "Single root node." }
    ],
    makeSolutions(
      `function solve(input) {
  const t = input.tree;
  if (!t || t.length === 0 || t[0] === null) return 0;
  const getDepth = (idx) => {
    if (idx >= t.length || t[idx] === null) return 0;
    return 1 + Math.max(getDepth(2 * idx + 1), getDepth(2 * idx + 2));
  };
  return getDepth(0);
}`,
      `struct TreeNode { int val; TreeNode *left, *right; };
#include <algorithm>
using namespace std;
class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};`,
      `class TreeNode { int val; TreeNode left, right; }
class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }
}`
    ),
    "### Approach: Recursive DFS Depth\nDepth is `1 + max(depth(left), depth(right))`.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(h)$",
    ["Recursive DFS."],
    "Trees & Graphs"
  ),

  problem(
    "Invert Binary Tree",
    "Given the root of a binary tree, invert the tree, and return its root.",
    "easy",
    ["tree", "dfs"],
    ["google", "amazon", "meta"],
    "0 ≤ nodes ≤ 100",
    [
      { input: '{"tree":[4,2,7,1,3,6,9]}', output: '[4,7,2,9,6,3,1]', explanation: "Tree inverted." },
      { input: '{"tree":[2,1,3]}', output: '[2,3,1]', explanation: "Swapped left and right." },
      { input: '{"tree":[]}', output: '[]', explanation: "Empty tree." },
      { input: '{"tree":[1]}', output: '[1]', explanation: "Single node." }
    ],
    makeSolutions(
      `function solve(input) {
  const t = input.tree;
  if (!t || t.length === 0) return [];
  const res = [...t];
  const invert = (idx) => {
    if (idx >= res.length || res[idx] === null) return;
    const l = 2 * idx + 1, r = 2 * idx + 2;
    if (l < res.length && r < res.length) {
      const tmp = res[l]; res[l] = res[r]; res[r] = tmp;
    }
    invert(l); invert(r);
  };
  invert(0);
  return res;
}`,
      `struct TreeNode { int val; TreeNode *left, *right; };
class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) return nullptr;
        TreeNode* tmp = root->left;
        root->left = invertTree(root->right);
        root->right = invertTree(tmp);
        return root;
    }
};`,
      `class TreeNode { int val; TreeNode left, right; }
class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode tmp = root.left;
        root.left = invertTree(root.right);
        root.right = invertTree(tmp);
        return root;
    }
}`
    ),
    "### Approach: Swap Subtrees DFS\nSwap left and right children recursively.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(h)$",
    ["Swap left and right child."],
    "Trees & Graphs"
  ),

  problem(
    "Same Tree",
    "Given the roots of two binary trees `p` and `q`, write a function to check if they are the same or not.",
    "easy",
    ["tree", "dfs"],
    ["amazon", "google", "microsoft"],
    "0 ≤ nodes ≤ 100",
    [
      { input: '{"p":[1,2,3],"q":[1,2,3]}', output: 'true', explanation: "Structurally and value-wise identical." },
      { input: '{"p":[1,2],"q":[1,null,2]}', output: 'false', explanation: "Structural difference." },
      { input: '{"p":[1,2,1],"q":[1,1,2]}', output: 'false', explanation: "Value difference." },
      { input: '{"p":[],"q":[]}', output: 'true', explanation: "Both empty." }
    ],
    makeSolutions(
      `function solve(input) {
  const { p, q } = input;
  return JSON.stringify(p) === JSON.stringify(q);
}`,
      `struct TreeNode { int val; TreeNode *left, *right; };
class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if (!p && !q) return true;
        if (!p || !q || p->val != q->val) return false;
        return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
    }
};`,
      `class TreeNode { int val; TreeNode left, right; }
class Solution {
    public boolean isSameTree(TreeNode p, TreeNode q) {
        if (p == null && q == null) return true;
        if (p == null || q == null || p.val != q.val) return false;
        return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
    }
}`
    ),
    "### Approach: Simultaneous Recursion\nCheck values match and both left and right subtrees are identical.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(h)$",
    ["Compare roots then recurse."],
    "Trees & Graphs"
  ),

  problem(
    "Symmetric Tree",
    "Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).",
    "easy",
    ["tree", "dfs"],
    ["amazon", "microsoft", "apple"],
    "1 ≤ nodes ≤ 1000",
    [
      { input: '{"tree":[1,2,2,3,4,4,3]}', output: 'true', explanation: "Symmetric." },
      { input: '{"tree":[1,2,2,null,3,null,3]}', output: 'false', explanation: "Asymmetric." },
      { input: '{"tree":[1]}', output: 'true', explanation: "Single node." },
      { input: '{"tree":[1,2,2]}', output: 'true', explanation: "Symmetric leaves." }
    ],
    makeSolutions(
      `function solve(input) {
  const t = input.tree;
  const isMirror = (i1, i2) => {
    if (i1 >= t.length && i2 >= t.length) return true;
    if (i1 >= t.length || i2 >= t.length) return false;
    if (t[i1] !== t[i2]) return false;
    return isMirror(2 * i1 + 1, 2 * i2 + 2) && isMirror(2 * i1 + 2, 2 * i2 + 1);
  };
  return isMirror(1, 2);
}`,
      `struct TreeNode { int val; TreeNode *left, *right; };
class Solution {
public:
    bool isMirror(TreeNode* t1, TreeNode* t2) {
        if (!t1 && !t2) return true;
        if (!t1 || !t2 || t1->val != t2->val) return false;
        return isMirror(t1->left, t2->right) && isMirror(t1->right, t2->left);
    }
    bool isSymmetric(TreeNode* root) {
        return !root || isMirror(root->left, root->right);
    }
};`,
      `class TreeNode { int val; TreeNode left, right; }
class Solution {
    private boolean isMirror(TreeNode t1, TreeNode t2) {
        if (t1 == null && t2 == null) return true;
        if (t1 == null || t2 == null || t1.val != t2.val) return false;
        return isMirror(t1.left, t2.right) && isMirror(t1.right, t2.left);
    }
    public boolean isSymmetric(TreeNode root) {
        return root == null || isMirror(root.left, root.right);
    }
}`
    ),
    "### Approach: Mirror Recursion\nCompare `t1.left` with `t2.right` and `t1.right` with `t2.left`.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(h)$",
    ["Mirror DFS."],
    "Trees & Graphs"
  ),

  problem(
    "Binary Tree Level Order Traversal",
    "Given the root of a binary tree, return the level order traversal of its nodes' values.",
    "medium",
    ["tree", "queue"],
    ["amazon", "meta", "google"],
    "0 ≤ nodes ≤ 2000",
    [
      { input: '{"tree":[3,9,20,null,null,15,7]}', output: '[[3],[9,20],[15,7]]', explanation: "Level by level." },
      { input: '{"tree":[1]}', output: '[[1]]', explanation: "Single node level." },
      { input: '{"tree":[]}', output: '[]', explanation: "Empty tree." },
      { input: '{"tree":[1,2,3]}', output: '[[1],[2,3]]', explanation: "Two levels." }
    ],
    makeSolutions(
      `function solve(input) {
  const t = input.tree;
  if (!t || t.length === 0) return [];
  const res = [];
  const dfs = (idx, level) => {
    if (idx >= t.length || t[idx] === null) return;
    if (!res[level]) res[level] = [];
    res[level].push(t[idx]);
    dfs(2 * idx + 1, level + 1);
    dfs(2 * idx + 2, level + 1);
  };
  dfs(0, 0);
  return res;
}`,
      `struct TreeNode { int val; TreeNode *left, *right; };
#include <vector>
#include <queue>
using namespace std;
class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        if (!root) return {};
        vector<vector<int>> res;
        queue<TreeNode*> q; q.push(root);
        while (!q.empty()) {
            int sz = q.size();
            vector<int> lvl;
            for (int i = 0; i < sz; i++) {
                TreeNode* node = q.front(); q.pop();
                lvl.push_back(node->val);
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            res.push_back(lvl);
        }
        return res;
    }
};`,
      `import java.util.*;
class TreeNode { int val; TreeNode left, right; }
class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        if (root == null) return res;
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        while (!q.isEmpty()) {
            int sz = q.size();
            List<Integer> lvl = new ArrayList<>();
            for (int i = 0; i < sz; i++) {
                TreeNode node = q.poll();
                lvl.add(node.val);
                if (node.left != null) q.add(node.left);
                if (node.right != null) q.add(node.right);
            }
            res.add(lvl);
        }
        return res;
    }
}`
    ),
    "### Approach: BFS Queue\nProcess nodes level by level using a queue.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(n)$",
    ["Queue BFS."],
    "Trees & Graphs"
  ),

  problem(
    "Validate Binary Search Tree",
    "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
    "medium",
    ["tree", "dfs", "binary-search"],
    ["amazon", "meta", "microsoft"],
    "1 ≤ nodes ≤ 10^4",
    [
      { input: '{"tree":[2,1,3]}', output: 'true', explanation: "Valid BST." },
      { input: '{"tree":[5,1,4,null,null,3,6]}', output: 'false', explanation: "Root value 5 is greater than right child 4." },
      { input: '{"tree":[1]}', output: 'true', explanation: "Single node." },
      { input: '{"tree":[5,4,6]}', output: 'true', explanation: "Valid BST." }
    ],
    makeSolutions(
      `function solve(input) {
  const t = input.tree;
  const validate = (idx, minVal, maxVal) => {
    if (idx >= t.length || t[idx] === null) return true;
    const val = t[idx];
    if (val <= minVal || val >= maxVal) return false;
    return validate(2 * idx + 1, minVal, val) && validate(2 * idx + 2, val, maxVal);
  };
  return validate(0, -Infinity, Infinity);
}`,
      `struct TreeNode { int val; TreeNode *left, *right; };
class Solution {
public:
    bool validate(TreeNode* root, long minV, long maxV) {
        if (!root) return true;
        if (root->val <= minV || root->val >= maxV) return false;
        return validate(root->left, minV, root->val) && validate(root->right, root->val, maxV);
    }
    bool isValidBST(TreeNode* root) {
        return validate(root, -1e18, 1e18);
    }
};`,
      `class TreeNode { int val; TreeNode left, right; }
class Solution {
    private boolean validate(TreeNode root, long minV, long maxV) {
        if (root == null) return true;
        if (root.val <= minV || root.val >= maxV) return false;
        return validate(root.left, minV, root.val) && validate(root.right, root.val, maxV);
    }
    public boolean isValidBST(TreeNode root) {
        return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }
}`
    ),
    "### Approach: Valid Bounds Range DFS\nEnforce `min < node.val < max`.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(h)$",
    ["Validate ranges."],
    "Trees & Graphs"
  ),

  problem(
    "Lowest Common Ancestor of BST",
    "Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes `p` and `q`.",
    "medium",
    ["tree", "dfs"],
    ["amazon", "meta", "google"],
    "2 ≤ nodes ≤ 10^5",
    [
      { input: '{"tree":[6,2,8,0,4,7,9,null,null,3,5],"p":2,"q":8}', output: '6', explanation: "LCA of 2 and 8 is 6." },
      { input: '{"tree":[6,2,8,0,4,7,9,null,null,3,5],"p":2,"q":4}', output: '2', explanation: "LCA of 2 and 4 is 2." },
      { input: '{"tree":[2,1],"p":2,"q":1}', output: '2', explanation: "LCA is 2." },
      { input: '{"tree":[5,3,6],"p":3,"q":6}', output: '5', explanation: "LCA is root 5." }
    ],
    makeSolutions(
      `function solve(input) {
  const { tree, p, q } = input;
  let idx = 0;
  while (idx < tree.length && tree[idx] !== null) {
    const val = tree[idx];
    if (p < val && q < val) idx = 2 * idx + 1;
    else if (p > val && q > val) idx = 2 * idx + 2;
    else return val;
  }
  return tree[0];
}`,
      `struct TreeNode { int val; TreeNode *left, *right; };
class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        while (root) {
            if (p->val < root->val && q->val < root->val) root = root->left;
            else if (p->val > root->val && q->val > root->val) root = root->right;
            else return root;
        }
        return nullptr;
    }
};`,
      `class TreeNode { int val; TreeNode left, right; }
class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        while (root != null) {
            if (p.val < root.val && q.val < root.val) root = root.left;
            else if (p.val > root.val && q.val > root.val) root = root.right;
            else return root;
        }
        return null;
    }
}`
    ),
    "### Approach: BST Split Property\nSplit point is the LCA.\n\n- **Time Complexity:** $O(h)$\n- **Space Complexity:** $O(1)$",
    ["BST split point."],
    "Trees & Graphs"
  ),

  problem(
    "Subtree of Another Tree",
    "Given the roots of two binary trees `root` and `subRoot`, return `true` if there is a subtree of `root` with the same structure and node values of `subRoot`.",
    "easy",
    ["tree", "dfs"],
    ["amazon", "meta", "microsoft"],
    "1 ≤ nodes ≤ 2000",
    [
      { input: '{"root":[3,4,5,1,2],"subRoot":[4,1,2]}', output: 'true', explanation: "subRoot matches subtree." },
      { input: '{"root":[3,4,5,1,2,null,null,null,null,0],"subRoot":[4,1,2]}', output: 'false', explanation: "Extra child." },
      { input: '{"root":[1,1],"subRoot":[1]}', output: 'true', explanation: "Single node subtree." },
      { input: '{"root":[1],"subRoot":[1]}', output: 'true', explanation: "Identical single node." }
    ],
    makeSolutions(
      `function solve(input) {
  const { root, subRoot } = input;
  const isSame = (i1, i2) => {
    if (i1 >= root.length && i2 >= subRoot.length) return true;
    if (i1 >= root.length || i2 >= subRoot.length) return false;
    if (root[i1] !== subRoot[i2]) return false;
    return isSame(2 * i1 + 1, 2 * i2 + 1) && isSame(2 * i1 + 2, 2 * i2 + 2);
  };
  for (let i = 0; i < root.length; i++) {
    if (root[i] === subRoot[0] && isSame(i, 0)) return true;
  }
  return false;
}`,
      `struct TreeNode { int val; TreeNode *left, *right; };
class Solution {
public:
    bool isSame(TreeNode* a, TreeNode* b) {
        if (!a && !b) return true;
        if (!a || !b || a->val != b->val) return false;
        return isSame(a->left, b->left) && isSame(a->right, b->right);
    }
    bool isSubtree(TreeNode* root, TreeNode* subRoot) {
        if (!root) return false;
        if (isSame(root, subRoot)) return true;
        return isSubtree(root->left, subRoot) || isSubtree(root->right, subRoot);
    }
};`,
      `class TreeNode { int val; TreeNode left, right; }
class Solution {
    private boolean isSame(TreeNode a, TreeNode b) {
        if (a == null && b == null) return true;
        if (a == null || b == null || a.val != b.val) return false;
        return isSame(a.left, b.left) && isSame(a.right, b.right);
    }
    public boolean isSubtree(TreeNode root, TreeNode subRoot) {
        if (root == null) return false;
        if (isSame(root, subRoot)) return true;
        return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
    }
}`
    ),
    "### Approach: Subtree DFS Matching\nCheck every matching root.\n\n- **Time Complexity:** $O(m \\times n)$\n- **Space Complexity:** $O(h)$",
    ["Check sameTree."],
    "Trees & Graphs"
  ),

  problem(
    "Number of Islands",
    "Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return the number of islands.",
    "medium",
    ["graph", "matrix", "dfs"],
    ["amazon", "google", "meta"],
    "1 ≤ m, n ≤ 300",
    [
      { input: '{"grid":[["1","1","0"],["1","0","0"],["0","0","1"]]}', output: '2', explanation: "2 islands." },
      { input: '{"grid":[["0","0"],["0","0"]]}', output: '0', explanation: "No land." },
      { input: '{"grid":[["1"]]}', output: '1', explanation: "Single island." },
      { input: '{"grid":[["1","1","1"],["0","1","0"],["1","1","1"]]}', output: '1', explanation: "Single connected island." }
    ],
    makeSolutions(
      `function solve(input) {
  const g = input.grid.map(r => [...r]);
  let count = 0;
  const dfs = (r, c) => {
    if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] !== '1') return;
    g[r][c] = '0';
    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
  };
  for (let r = 0; r < g.length; r++) {
    for (let c = 0; c < g[0].length; c++) {
      if (g[r][c] === '1') { count++; dfs(r, c); }
    }
  }
  return count;
}`,
      `#include <vector>
using namespace std;
class Solution {
public:
    void dfs(vector<vector<char>>& g, int r, int c) {
        if (r < 0 || c < 0 || r >= g.size() || c >= g[0].size() || g[r][c] != '1') return;
        g[r][c] = '0';
        dfs(g, r + 1, c); dfs(g, r - 1, c); dfs(g, r, c + 1); dfs(g, r, c - 1);
    }
    int numIslands(vector<vector<char>>& grid) {
        int count = 0;
        for (int r = 0; r < grid.size(); r++)
            for (int c = 0; c < grid[0].size(); c++)
                if (grid[r][c] == '1') { count++; dfs(grid, r, c); }
        return count;
    }
};`,
      `class Solution {
    private void dfs(char[][] g, int r, int c) {
        if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] != '1') return;
        g[r][c] = '0';
        dfs(g, r + 1, c); dfs(g, r - 1, c); dfs(g, r, c + 1); dfs(g, r, c - 1);
    }
    public int numIslands(char[][] grid) {
        int count = 0;
        for (int r = 0; r < grid.length; r++)
            for (int c = 0; c < grid[0].length; c++)
                if (grid[r][c] == '1') { count++; dfs(grid, r, c); }
        return count;
    }
}`
    ),
    "### Approach: DFS Flood Fill\nSink visited land to '0'.\n\n- **Time Complexity:** $O(m \\times n)$\n- **Space Complexity:** $O(m \\times n)$",
    ["DFS flood fill."],
    "Trees & Graphs"
  ),

  problem(
    "Max Area of Island",
    "You are given an `m x n` binary matrix `grid`. An island is a group of `1`'s connected 4-directionally. Return the maximum area of an island in `grid`. If there is no island, return `0`.",
    "medium",
    ["graph", "matrix", "dfs"],
    ["amazon", "google", "meta"],
    "1 ≤ m, n ≤ 50",
    [
      { input: '{"grid":[[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,1,1,0,1,0,0,0,0,0,0,0,0],[0,1,0,0,1,1,0,0,1,0,1,0,0],[0,1,0,0,1,1,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0]]}', output: '6', explanation: "Max area island is 6." },
      { input: '{"grid":[[0,0,0,0,0,0,0,0]]}', output: '0', explanation: "No islands." },
      { input: '{"grid":[[1]]}', output: '1', explanation: "Single area." },
      { input: '{"grid":[[1,1],[1,0]]}', output: '3', explanation: "Area 3." }
    ],
    makeSolutions(
      `function solve(input) {
  const g = input.grid.map(r => [...r]);
  let maxA = 0;
  const dfs = (r, c) => {
    if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] !== 1) return 0;
    g[r][c] = 0;
    return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1);
  };
  for (let r = 0; r < g.length; r++) {
    for (let c = 0; c < g[0].length; c++) {
      if (g[r][c] === 1) maxA = Math.max(maxA, dfs(r, c));
    }
  }
  return maxA;
}`,
      `#include <vector>
#include <algorithm>
using namespace std;
class Solution {
public:
    int dfs(vector<vector<int>>& g, int r, int c) {
        if (r < 0 || c < 0 || r >= g.size() || c >= g[0].size() || g[r][c] != 1) return 0;
        g[r][c] = 0;
        return 1 + dfs(g, r + 1, c) + dfs(g, r - 1, c) + dfs(g, r, c + 1) + dfs(g, r, c - 1);
    }
    int maxAreaOfIsland(vector<vector<int>>& grid) {
        int maxA = 0;
        for (int r = 0; r < grid.size(); r++)
            for (int c = 0; c < grid[0].size(); c++)
                if (grid[r][c] == 1) maxA = max(maxA, dfs(grid, r, c));
        return maxA;
    }
};`,
      `class Solution {
    private int dfs(int[][] g, int r, int c) {
        if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] != 1) return 0;
        g[r][c] = 0;
        return 1 + dfs(g, r + 1, c) + dfs(g, r - 1, c) + dfs(g, r, c + 1) + dfs(g, r, c - 1);
    }
    public int maxAreaOfIsland(int[][] grid) {
        int maxA = 0;
        for (int r = 0; r < grid.length; r++)
            for (int c = 0; c < grid[0].length; c++)
                if (grid[r][c] == 1) maxA = Math.max(maxA, dfs(grid, r, c));
        return maxA;
    }
}`
    ),
    "### Approach: Recursive Area DFS\nSum 1 for each connected land cell.\n\n- **Time Complexity:** $O(m \\times n)$\n- **Space Complexity:** $O(m \\times n)$",
    ["DFS area accumulation."],
    "Trees & Graphs"
  ),

  problem(
    "Rotting Oranges",
    "You are given an `m x n` grid where `0` is empty, `1` is fresh orange, and `2` is rotten orange. Every minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten. Return the minimum number of minutes until no fresh orange remains, or `-1`.",
    "medium",
    ["graph", "matrix", "queue"],
    ["amazon", "google", "meta"],
    "1 ≤ m, n ≤ 10",
    [
      { input: '{"grid":[[2,1,1],[1,1,0],[0,1,1]]}', output: '4', explanation: "4 minutes to rot all." },
      { input: '{"grid":[[2,1,1],[0,1,1],[1,0,1]]}', output: '-1', explanation: "Bottom left never rots." },
      { input: '{"grid":[[0,2]]}', output: '0', explanation: "0 fresh oranges." },
      { input: '{"grid":[[1]]}', output: '-1', explanation: "Never rots." }
    ],
    makeSolutions(
      `function solve(input) {
  const g = input.grid.map(r => [...r]), m = g.length, n = g[0].length;
  const q = [];
  let fresh = 0, mins = 0;
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (g[r][c] === 2) q.push([r, c]);
      else if (g[r][c] === 1) fresh++;
    }
  }
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  while (q.length > 0 && fresh > 0) {
    const sz = q.length;
    for (let i = 0; i < sz; i++) {
      const [r, c] = q.shift();
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nc >= 0 && nr < m && nc < n && g[nr][nc] === 1) {
          g[nr][nc] = 2; fresh--; q.push([nr, nc]);
        }
      }
    }
    mins++;
  }
  return fresh === 0 ? mins : -1;
}`,
      `#include <vector>
#include <queue>
using namespace std;
class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size(), fresh = 0, mins = 0;
        queue<pair<int, int>> q;
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (grid[r][c] == 2) q.push({r, c});
                else if (grid[r][c] == 1) fresh++;
            }
        int dirs[4][2] = {{1,0},{-1,0},{0,1},{0,-1}};
        while (!q.empty() && fresh > 0) {
            int sz = q.size();
            while (sz--) {
                auto [r, c] = q.front(); q.pop();
                for (auto& d : dirs) {
                    int nr = r + d[0], nc = c + d[1];
                    if (nr >= 0 && nc >= 0 && nr < m && nc < n && grid[nr][nc] == 1) {
                        grid[nr][nc] = 2; fresh--; q.push({nr, nc});
                    }
                }
            }
            mins++;
        }
        return fresh == 0 ? mins : -1;
    }
};`,
      `import java.util.*;
class Solution {
    public int orangesRotting(int[][] grid) {
        int m = grid.length, n = grid[0].length, fresh = 0, mins = 0;
        Queue<int[]> q = new LinkedList<>();
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (grid[r][c] == 2) q.add(new int[]{r, c});
                else if (grid[r][c] == 1) fresh++;
            }
        int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};
        while (!q.isEmpty() && fresh > 0) {
            int sz = q.size();
            for (int i = 0; i < sz; i++) {
                int[] curr = q.poll();
                for (int[] d : dirs) {
                    int nr = curr[0] + d[0], nc = curr[1] + d[1];
                    if (nr >= 0 && nc >= 0 && nr < h.length && nc < h[0].length && !vis[nr][nc] && h[nr][nc] >= h[r][c]) {
                        grid[nr][nc] = 2; fresh--; q.add(new int[]{nr, nc});
                    }
                }
            }
            mins++;
        }
        return fresh == 0 ? mins : -1;
    }
}`
    ),
    "### Approach: Multi-source BFS\nStart BFS simultaneously from all rotten oranges.\n\n- **Time Complexity:** $O(m \\times n)$\n- **Space Complexity:** $O(m \\times n)$",
    ["Multi-source BFS."],
    "Trees & Graphs"
  ),

  problem(
    "Clone Graph",
    "Given a reference of a node in a connected undirected graph represented by adjacency list, return a deep copy (clone) of the graph.",
    "medium",
    ["graph", "dfs", "hashmap"],
    ["meta", "amazon", "google"],
    "0 ≤ nodes ≤ 100",
    [
      { input: '{"adj":[[2,4],[1,3],[2,4],[1,3]]}', output: '[[2,4],[1,3],[2,4],[1,3]]', explanation: "Cloned graph structure." },
      { input: '{"adj":[[]]}', output: '[[]]', explanation: "Single node with no neighbors." },
      { input: '{"adj":[]}', output: '[]', explanation: "Empty graph." },
      { input: '{"adj":[[2],[1]]}', output: '[[2],[1]]', explanation: "2 node graph." }
    ],
    makeSolutions(
      `function solve(input) {
  const adj = input.adj;
  if (!adj || adj.length === 0) return [];
  return adj.map(neighbors => [...neighbors]);
}`,
      `#include <vector>
#include <unordered_map>
using namespace std;
class Node { public: int val; vector<Node*> neighbors; };
class Solution {
    unordered_map<Node*, Node*> visited;
public:
    Node* cloneGraph(Node* node) {
        if (!node) return nullptr;
        if (visited.count(node)) return visited[node];
        Node* clone = new Node{node->val};
        visited[node] = clone;
        for (Node* nb : node->neighbors) clone->neighbors.push_back(cloneGraph(nb));
        return clone;
    }
};`,
      `import java.util.*;
class Node { public int val; public List<Node> neighbors = new ArrayList<>(); }
class Solution {
    private Map<Node, Node> visited = new HashMap<>();
    public Node cloneGraph(Node node) {
        if (node == null) return null;
        if (visited.containsKey(node)) return visited.get(node);
        Node clone = new Node(); clone.val = node.val;
        visited.put(node, clone);
        for (Node nb : node.neighbors) clone.neighbors.add(cloneGraph(nb));
        return clone;
    }
}`
    ),
    "### Approach: HashMap DFS Graph Clone\nMap original node to cloned node.\n\n- **Time Complexity:** $O(V + E)$\n- **Space Complexity:** $O(V)$",
    ["Map original to clone."],
    "Trees & Graphs"
  ),

  problem(
    "Course Schedule",
    "There are a total of `numCourses` you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [a, b]` indicates that you must take course `b` first if you want to take course `a`. Return `true` if you can finish all courses.",
    "medium",
    ["graph", "dfs", "matrix"],
    ["amazon", "google", "meta"],
    "1 ≤ numCourses ≤ 2000\n0 ≤ prerequisites.length ≤ 5000",
    [
      { input: '{"numCourses":2,"prerequisites":[[1,0]]}', output: 'true', explanation: "Take course 0 then 1." },
      { input: '{"numCourses":2,"prerequisites":[[1,0],[0,1]]}', output: 'false', explanation: "Cycle exists." },
      { input: '{"numCourses":1,"prerequisites":[]}', output: 'true', explanation: "No prerequisites." },
      { input: '{"numCourses":3,"prerequisites":[[0,1],[1,2]]}', output: 'true', explanation: "Linear chain." }
    ],
    makeSolutions(
      `function solve(input) {
  const { numCourses, prerequisites } = input;
  const adj = Array.from({ length: numCourses }, () => []);
  for (const [a, b] of prerequisites) adj[b].push(a);
  const state = Array(numCourses).fill(0);
  const hasCycle = (u) => {
    if (state[u] === 1) return true;
    if (state[u] === 2) return false;
    state[u] = 1;
    for (const v of adj[u]) if (hasCycle(v)) return true;
    state[u] = 2;
    return false;
  };
  for (let i = 0; i < numCourses; i++) if (hasCycle(i)) return false;
  return true;
}`,
      `#include <vector>
using namespace std;
class Solution {
public:
    bool hasCycle(int u, vector<vector<int>>& adj, vector<int>& state) {
        if (state[u] == 1) return true;
        if (state[u] == 2) return false;
        state[u] = 1;
        for (int v : adj[u]) if (hasCycle(v, adj, state)) return true;
        state[u] = 2;
        return false;
    }
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> adj(numCourses);
        for (auto& p : prerequisites) adj[p[1]].push_back(p[0]);
        vector<int> state(numCourses, 0);
        for (int i = 0; i < numCourses; i++) if (hasCycle(i, adj, state)) return false;
        return true;
    }
};`,
      `import java.util.*;
class Solution {
    private boolean hasCycle(int u, List<List<Integer>> adj, int[] state) {
        if (state[u] == 1) return true;
        if (state[u] == 2) return false;
        state[u] = 1;
        for (int v : adj.get(u)) if (hasCycle(v, adj, state)) return true;
        state[u] = 2;
        return false;
    }
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        for (int[] p : prerequisites) adj.get(p[1]).add(p[0]);
        int[] state = new int[numCourses];
        for (int i = 0; i < numCourses; i++) if (hasCycle(i, adj, state)) return false;
        return true;
    }
}`
    ),
    "### Approach: Topological Sort / Cycle Detection\nDetect directed cycle using 3-color DFS states (0=white, 1=gray, 2=black).\n\n- **Time Complexity:** $O(V + E)$\n- **Space Complexity:** $O(V + E)$",
    ["Cycle detection via DFS."],
    "Trees & Graphs"
  ),

  problem(
    "Pacific Atlantic Water Flow",
    "Given an `m x n` matrix of non-negative integers representing the height of each unit cell in a continent, return a list of grid coordinates where water can flow to both the Pacific and Atlantic oceans.",
    "medium",
    ["graph", "matrix", "dfs"],
    ["google", "amazon", "meta"],
    "1 ≤ m, n ≤ 200",
    [
      { input: '{"heights":[[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]}', output: '[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]', explanation: "Cells reaching both oceans." },
      { input: '{"heights":[[1]]}', output: '[[0,0]]', explanation: "Single cell reaches both." },
      { input: '{"heights":[[2,1],[1,2]]}', output: '[[0,0],[0,1],[1,0],[1,1]]', explanation: "All cells reach." },
      { input: '{"heights":[[1,2],[2,1]]}', output: '[[0,0],[0,1],[1,0],[1,1]]', explanation: "All 4 reach." }
    ],
    makeSolutions(
      `function solve(input) {
  const h = input.heights, m = h.length, n = h[0].length;
  const pac = Array.from({ length: m }, () => Array(n).fill(false));
  const atl = Array.from({ length: m }, () => Array(n).fill(false));
  const dfs = (r, c, visited) => {
    visited[r][c] = true;
    for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < m && nc < n && !visited[nr][nc] && h[nr][nc] >= h[r][c]) {
        dfs(nr, nc, visited);
      }
    }
  };
  for (let i = 0; i < m; i++) { dfs(i, 0, pac); dfs(i, n - 1, atl); }
  for (let j = 0; j < n; j++) { dfs(0, j, pac); dfs(m - 1, j, atl); }
  const res = [];
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++)
      if (pac[r][c] && atl[r][c]) res.push([r, c]);
  return res;
}`,
      `#include <vector>
using namespace std;
class Solution {
public:
    void dfs(int r, int c, vector<vector<bool>>& vis, vector<vector<int>>& h) {
        vis[r][c] = true;
        int dirs[4][2] = {{1,0},{-1,0},{0,1},{0,-1}};
        for (auto& d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if (nr >= 0 && nc >= 0 && nr < h.size() && nc < h[0].size() && !vis[nr][nc] && h[nr][nc] >= h[r][c]) {
                dfs(nr, nc, vis, h);
            }
        }
    }
    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
        int m = heights.size(), n = heights[0].size();
        vector<vector<bool>> pac(m, vector<bool>(n, false)), atl(m, vector<bool>(n, false));
        for (int i = 0; i < m; i++) { dfs(i, 0, pac, heights); dfs(i, n - 1, atl, heights); }
        for (int j = 0; j < n; j++) { dfs(0, j, pac, heights); dfs(m - 1, j, atl, heights); }
        vector<vector<int>> res;
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++)
                if (pac[r][c] && atl[r][c]) res.push_back({r, c});
        return res;
    }
};`,
      `import java.util.*;
class Solution {
    private void dfs(int r, int c, boolean[][] vis, int[][] h) {
        vis[r][c] = true;
        int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};
        for (int[] d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if (nr >= 0 && nc >= 0 && nr < h.length && nc < h[0].length && !vis[nr][nc] && h[nr][nc] >= h[r][c]) {
                dfs(nr, nc, vis, h);
            }
        }
    }
    public List<List<Integer>> pacificAtlantic(int[][] heights) {
        int m = heights.length, n = heights[0].length;
        boolean[][] pac = new boolean[m][n], atl = new boolean[m][n];
        for (int i = 0; i < m; i++) { dfs(i, 0, pac, heights); dfs(i, n - 1, atl, heights); }
        for (int j = 0; j < n; j++) { dfs(0, j, pac, heights); dfs(m - 1, j, atl, heights); }
        List<List<Integer>> res = new ArrayList<>();
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++)
                if (pac[r][c] && atl[r][c]) res.add(Arrays.asList(r, c));
        return res;
    }
}`
    ),
    "### Approach: Reverse Water Flow DFS\nFlow uphill from the oceans inland.\n\n- **Time Complexity:** $O(m \\times n)$\n- **Space Complexity:** $O(m \\times n)$",
    ["Flow backwards from ocean edges."],
    "Trees & Graphs"
  ),

  problem(
    "Word Search",
    "Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid constructed from sequentially adjacent cells.",
    "medium",
    ["matrix", "backtracking", "dfs"],
    ["amazon", "microsoft", "meta"],
    "1 ≤ m, n ≤ 6\n1 ≤ word.length ≤ 15",
    [
      { input: '{"board":[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]],"word":"ABCCED"}', output: 'true', explanation: "Word found." },
      { input: '{"board":[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]],"word":"SEE"}', output: 'true', explanation: "Word found." },
      { input: '{"board":[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]],"word":"ABCB"}', output: 'false', explanation: "Cannot reuse cell." },
      { input: '{"board":[["a"]],"word":"a"}', output: 'true', explanation: "Single char." }
    ],
    makeSolutions(
      `function solve(input) {
  const { board, word } = input, m = board.length, n = board[0].length;
  const dfs = (r, c, k) => {
    if (k === word.length) return true;
    if (r < 0 || c < 0 || r >= m || c >= n || board[r][c] !== word[k]) return false;
    const tmp = board[r][c]; board[r][c] = '#';
    const found = dfs(r + 1, c, k + 1) || dfs(r - 1, c, k + 1) || dfs(r, c + 1, k + 1) || dfs(r, c - 1, k + 1);
    board[r][c] = tmp;
    return found;
  };
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++)
      if (dfs(r, c, 0)) return true;
  return false;
}`,
      `#include <vector>
#include <string>
using namespace std;
class Solution {
public:
    bool dfs(vector<vector<char>>& board, string& word, int r, int c, int k) {
        if (k == word.size()) return true;
        if (r < 0 || c < 0 || r >= board.size() || c >= board[0].size() || board[r][c] != word[k]) return false;
        char tmp = board[r][c]; board[r][c] = '#';
        bool found = dfs(board, word, r + 1, c, k + 1) || dfs(board, word, r - 1, c, k + 1) ||
                     dfs(board, word, r, c + 1, k + 1) || dfs(board, word, r, c - 1, k + 1);
        board[r][c] = tmp;
        return found;
    }
    bool exist(vector<vector<char>>& board, string word) {
        for (int r = 0; r < board.size(); r++)
            for (int c = 0; c < board[0].size(); c++)
                if (dfs(board, word, r, c, 0)) return true;
        return false;
    }
};`,
      `class Solution {
    private boolean dfs(char[][] board, String word, int r, int c, int k) {
        if (k == word.length()) return true;
        if (r < 0 || c < 0 || r >= board.length || c >= board[0].length || board[r][c] != word.charAt(k)) return false;
        char tmp = board[r][c]; board[r][c] = '#';
        boolean found = dfs(board, word, r + 1, c, k + 1) || dfs(board, word, r - 1, c, k + 1) ||
                        dfs(board, word, r, c + 1, k + 1) || dfs(board, word, r, c - 1, k + 1);
        board[r][c] = tmp;
        return found;
    }
    public boolean exist(char[][] board, String word) {
        for (int r = 0; r < board.length; r++)
            for (int c = 0; c < board[0].length; c++)
                if (dfs(board, word, r, c, 0)) return true;
        return false;
    }
}`
    ),
    "### Approach: Backtracking DFS\nMark cell visited temporarily with `#` and restore after exploring.\n\n- **Time Complexity:** $O(m \\cdot n \\cdot 4^L)$\n- **Space Complexity:** $O(L)$ recursion stack",
    ["Backtracking search."],
    "Trees & Graphs"
  ),

  problem(
    "Surrounded Regions",
    "Given an `m x n` matrix `board` containing `'X'` and `'O'`, capture all regions that are 4-directionally surrounded by `'X'`. A connected region of `'O'` is captured by flipping all `'O'`s into `'X'`s unless it touches the boundary.",
    "medium",
    ["graph", "matrix", "dfs"],
    ["google", "amazon", "microsoft"],
    "1 ≤ m, n ≤ 200",
    [
      { input: '{"board":[["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]}', output: '[["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]', explanation: "Surrounded Os flipped to X." },
      { input: '{"board":[["X"]]}', output: '[["X"]]', explanation: "Single X." },
      { input: '{"board":[["O","O"],["O","O"]]}', output: '[["O","O"],["O","O"]]', explanation: "Boundary connected." },
      { input: '{"board":[["X","O"],["X","X"]]}', output: '[["X","O"],["X","X"]]', explanation: "Touches border." }
    ],
    makeSolutions(
      `function solve(input) {
  const b = input.board.map(r => [...r]), m = b.length, n = b[0].length;
  const dfs = (r, c) => {
    if (r < 0 || c < 0 || r >= m || c >= n || b[r][c] !== 'O') return;
    b[r][c] = 'E';
    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
  };
  for (let i = 0; i < m; i++) { dfs(i, 0); dfs(i, n - 1); }
  for (let j = 0; j < n; j++) { dfs(0, j); dfs(m - 1, j); }
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (b[r][c] === 'E') b[r][c] = 'O';
      else if (b[r][c] === 'O') b[r][c] = 'X';
    }
  }
  return b;
}`,
      `#include <vector>
using namespace std;
class Solution {
public:
    void dfs(vector<vector<char>>& b, int r, int c) {
        if (r < 0 || c < 0 || r >= b.size() || c >= b[0].size() || b[r][c] != 'O') return;
        b[r][c] = 'E';
        dfs(b, r + 1, c); dfs(b, r - 1, c); dfs(b, r, c + 1); dfs(b, r, c - 1);
    }
    void solve(vector<vector<char>>& board) {
        int m = board.size(), n = board[0].size();
        for (int i = 0; i < m; i++) { dfs(board, i, 0); dfs(board, i, n - 1); }
        for (int j = 0; j < n; j++) { dfs(board, 0, j); dfs(board, m - 1, j); }
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (board[r][c] == 'E') board[r][c] = 'O';
                else if (board[r][c] == 'O') board[r][c] = 'X';
            }
    }
};`,
      `class Solution {
    private void dfs(char[][] b, int r, int c) {
        if (r < 0 || c < 0 || r >= b.length || c >= b[0].length || b[r][c] != 'O') return;
        b[r][c] = 'E';
        dfs(b, r + 1, c); dfs(b, r - 1, c); dfs(b, r, c + 1); dfs(b, r, c - 1);
    }
    public void solve(char[][] board) {
        int m = board.length, n = board[0].length;
        for (int i = 0; i < m; i++) { dfs(board, i, 0); dfs(board, i, n - 1); }
        for (int j = 0; j < n; j++) { dfs(board, 0, j); dfs(board, m - 1, j); }
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (board[r][c] == 'E') board[r][c] = 'O';
                else if (board[r][c] == 'O') board[r][c] = 'X';
            }
    }
}`
    ),
    "### Approach: Boundary DFS Preservation\nProtect border-connected Os by marking 'E', then flip the rest.\n\n- **Time Complexity:** $O(m \\times n)$\n- **Space Complexity:** $O(m \\times n)$",
    ["Protect border-connected 'O's."],
    "Trees & Graphs"
  ),

  // ==========================================
  // TRACK 4: ADVANCED PATTERNS (14 Problems)
  // ==========================================
  problem(
    "Climbing Stairs",
    "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    "easy",
    ["dp", "math"],
    ["amazon", "apple", "google"],
    "1 ≤ n ≤ 45",
    [
      { input: '{"n":2}', output: '2', explanation: "1+1 or 2." },
      { input: '{"n":3}', output: '3', explanation: "1+1+1, 1+2, or 2+1." },
      { input: '{"n":4}', output: '5', explanation: "Fibonacci sequence." },
      { input: '{"n":5}', output: '8', explanation: "8 ways." }
    ],
    makeSolutions(
      `function solve(input) {
  const n = input.n;
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) { const c = a + b; a = b; b = c; }
  return b;
}`,
      `class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) { int c = a + b; a = b; b = c; }
        return b;
    }
};`,
      `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) { int c = a + b; a = b; b = c; }
        return b;
    }
}`
    ),
    "### Approach: Dynamic Programming\n`dp[i] = dp[i-1] + dp[i-2]`.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(1)$",
    ["Fibonacci."],
    "Advanced Patterns"
  ),

  problem(
    "House Robber",
    "Given an integer array `nums` representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police by robbing adjacent houses.",
    "medium",
    ["array", "dp"],
    ["amazon", "google", "microsoft"],
    "1 ≤ nums.length ≤ 100",
    [
      { input: '{"nums":[1,2,3,1]}', output: '4', explanation: "Rob house 1 and 3." },
      { input: '{"nums":[2,7,9,3,1]}', output: '12', explanation: "Rob house 1, 3, 5." },
      { input: '{"nums":[2,1,1,2]}', output: '4', explanation: "Rob houses 0 and 3." },
      { input: '{"nums":[0]}', output: '0', explanation: "0 amount." }
    ],
    makeSolutions(
      `function solve(input) {
  let prev2 = 0, prev1 = 0;
  for (const n of input.nums) {
    const tmp = Math.max(prev1, prev2 + n);
    prev2 = prev1; prev1 = tmp;
  }
  return prev1;
}`,
      `#include <vector>
#include <algorithm>
using namespace std;
class Solution {
public:
    int rob(vector<int>& nums) {
        int prev2 = 0, prev1 = 0;
        for (int n : nums) {
            int tmp = max(prev1, prev2 + n);
            prev2 = prev1; prev1 = tmp;
        }
        return prev1;
    }
};`,
      `class Solution {
    public int rob(int[] nums) {
        int prev2 = 0, prev1 = 0;
        for (int n : nums) {
            int tmp = Math.max(prev1, prev2 + n);
            prev2 = prev1; prev1 = tmp;
        }
        return prev1;
    }
}`
    ),
    "### Approach: Space-Optimized DP\n`dp[i] = max(dp[i-1], dp[i-2] + nums[i])`.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(1)$",
    ["Pick or skip."],
    "Advanced Patterns"
  ),

  problem(
    "House Robber II",
    "All houses are arranged in a circle. Given an integer array `nums` representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
    "medium",
    ["array", "dp"],
    ["amazon", "google", "meta"],
    "1 ≤ nums.length ≤ 100",
    [
      { input: '{"nums":[2,3,2]}', output: '3', explanation: "Cannot rob first and last together." },
      { input: '{"nums":[1,2,3,1]}', output: '4', explanation: "Rob 1 and 3." },
      { input: '{"nums":[1,2,3]}', output: '3', explanation: "Rob house 3." },
      { input: '{"nums":[0]}', output: '0', explanation: "0 amount." }
    ],
    makeSolutions(
      `function solve(input) {
  const nums = input.nums;
  if (nums.length === 1) return nums[0];
  const robLinear = (arr) => {
    let p2 = 0, p1 = 0;
    for (const n of arr) { const tmp = Math.max(p1, p2 + n); p2 = p1; p1 = tmp; }
    return p1;
  };
  return Math.max(robLinear(nums.slice(0, -1)), robLinear(nums.slice(1)));
}`,
      `#include <vector>
#include <algorithm>
using namespace std;
class Solution {
public:
    int robLinear(vector<int>& nums, int l, int r) {
        int p2 = 0, p1 = 0;
        for (int i = l; i <= r; i++) { int tmp = max(p1, p2 + nums[i]); p2 = p1; p1 = tmp; }
        return p1;
    }
    int rob(vector<int>& nums) {
        if (nums.size() == 1) return nums[0];
        return max(robLinear(nums, 0, nums.size() - 2), robLinear(nums, 1, nums.size() - 1));
    }
};`,
      `class Solution {
    private int robLinear(int[] nums, int l, int r) {
        int p2 = 0, p1 = 0;
        for (int i = l; i <= r; i++) { int tmp = Math.max(p1, p2 + nums[i]); p2 = p1; p1 = tmp; }
        return p1;
    }
    public int rob(int[] nums) {
        if (nums.length == 1) return nums[0];
        return Math.max(robLinear(nums, 0, nums.length - 2), robLinear(nums, 1, nums.length - 1));
    }
}`
    ),
    "### Approach: Circular DP Breakdown\nRun linear robber twice: `nums[0..n-2]` vs `nums[1..n-1]`.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(1)$",
    ["Break the circle into 2 linear cases."],
    "Advanced Patterns"
  ),

  problem(
    "Coin Change",
    "Given an integer array `coins` and an integer `amount`, return the fewest number of coins that you need to make up that amount, or `-1`.",
    "medium",
    ["dp"],
    ["amazon", "google", "microsoft"],
    "1 ≤ coins.length ≤ 12\n0 ≤ amount ≤ 10^4",
    [
      { input: '{"coins":[1,2,5],"amount":11}', output: '3', explanation: "5 + 5 + 1 = 3 coins." },
      { input: '{"coins":[2],"amount":3}', output: '-1', explanation: "Cannot make 3." },
      { input: '{"coins":[1],"amount":0}', output: '0', explanation: "0 coins for 0 amount." },
      { input: '{"coins":[1,3,4],"amount":6}', output: '2', explanation: "3 + 3 = 2 coins." }
    ],
    makeSolutions(
      `function solve(input) {
  const { coins, amount } = input, dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const c of coins) if (i - c >= 0) dp[i] = Math.min(dp[i], dp[i - c] + 1);
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
      `#include <vector>
#include <algorithm>
using namespace std;
class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> dp(amount + 1, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++)
            for (int c : coins) if (i - c >= 0) dp[i] = min(dp[i], dp[i - c] + 1);
        return dp[amount] > amount ? -1 : dp[amount];
    }
};`,
      `import java.util.*;
class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++)
            for (int c : coins) if (i - c >= 0) dp[i] = Math.min(dp[i], dp[i - c] + 1);
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`
    ),
    "### Approach: Bottom-up DP Knapsack\n`dp[i] = min(dp[i], dp[i - c] + 1)`.\n\n- **Time Complexity:** $O(amount \\times coins)$\n- **Space Complexity:** $O(amount)$",
    ["Bottom up DP."],
    "Advanced Patterns"
  ),

  problem(
    "Longest Increasing Subsequence",
    "Given an integer array `nums`, return the length of the longest strictly increasing subsequence in $O(n \\log n)$ time.",
    "medium",
    ["array", "dp", "binary-search"],
    ["google", "amazon", "microsoft"],
    "1 ≤ nums.length ≤ 2500",
    [
      { input: '{"nums":[10,9,2,5,3,7,101,18]}', output: '4', explanation: "[2, 3, 7, 101] has length 4." },
      { input: '{"nums":[0,1,0,3,2,3]}', output: '4', explanation: "[0, 1, 2, 3] length 4." },
      { input: '{"nums":[7,7,7,7,7]}', output: '1', explanation: "Strictly increasing length 1." },
      { input: '{"nums":[1,3,6,7,9,4,10,5,6]}', output: '6', explanation: "Length 6." }
    ],
    makeSolutions(
      `function solve(input) {
  const tails = [];
  for (const x of input.nums) {
    let l = 0, r = tails.length;
    while (l < r) {
      const m = Math.floor((l + r) / 2);
      if (tails[m] < x) l = m + 1;
      else r = m;
    }
    tails[l] = x;
  }
  return tails.length;
}`,
      `#include <vector>
#include <algorithm>
using namespace std;
class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        vector<int> tails;
        for (int x : nums) {
            auto it = lower_bound(tails.begin(), tails.end(), x);
            if (it == tails.end()) tails.push_back(x);
            else *it = x;
        }
        return tails.size();
    }
};`,
      `import java.util.*;
class Solution {
    public int lengthOfLIS(int[] nums) {
        List<Integer> tails = new ArrayList<>();
        for (int x : nums) {
            int idx = Collections.binarySearch(tails, x);
            if (idx < 0) idx = -(idx + 1);
            if (idx == tails.size()) tails.add(x);
            else tails.set(idx, x);
        }
        return tails.size();
    }
}`
    ),
    "### Approach: Patience Sorting / Binary Search\nMaintain tails array with binary search insertion.\n\n- **Time Complexity:** $O(n \\log n)$\n- **Space Complexity:** $O(n)$",
    ["Patience sorting."],
    "Advanced Patterns"
  ),

  problem(
    "Unique Paths",
    "A robot is located at the top-left corner of an `m x n` grid. The robot can only move either down or right at any point in time. Return the number of possible unique paths to reach the bottom-right corner.",
    "medium",
    ["matrix", "dp", "math"],
    ["amazon", "google", "meta"],
    "1 ≤ m, n ≤ 100",
    [
      { input: '{"m":3,"n":7}', output: '28', explanation: "28 unique paths." },
      { input: '{"m":3,"n":2}', output: '3', explanation: "3 unique paths." },
      { input: '{"m":1,"n":1}', output: '1', explanation: "Single cell." },
      { input: '{"m":2,"n":2}', output: '2', explanation: "2 paths." }
    ],
    makeSolutions(
      `function solve(input) {
  const { m, n } = input, row = Array(n).fill(1);
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) row[j] += row[j - 1];
  }
  return row[n - 1];
}`,
      `#include <vector>
using namespace std;
class Solution {
public:
    int uniquePaths(int m, int n) {
        vector<int> row(n, 1);
        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++) row[j] += row[j - 1];
        return row[n - 1];
    }
};`,
      `import java.util.*;
class Solution {
    public int uniquePaths(int m, int n) {
        int[] row = new int[n];
        Arrays.fill(row, 1);
        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++) row[j] += row[j - 1];
        return row[n - 1];
    }
}`
    ),
    "### Approach: 1D Dynamic Programming\n`dp[j] = dp[j] + dp[j-1]`.\n\n- **Time Complexity:** $O(m \\times n)$\n- **Space Complexity:** $O(n)$",
    ["DP grid."],
    "Advanced Patterns"
  ),

  problem(
    "Jump Game",
    "You are given an integer array `nums`. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position. Return `true` if you can reach the last index.",
    "medium",
    ["array", "greedy", "dp"],
    ["amazon", "meta", "microsoft"],
    "1 ≤ nums.length ≤ 10^4",
    [
      { input: '{"nums":[2,3,1,1,4]}', output: 'true', explanation: "Jump 1 step to 1 then 3 to last." },
      { input: '{"nums":[3,2,1,0,4]}', output: 'false', explanation: "Always arrives at 0." },
      { input: '{"nums":[0]}', output: 'true', explanation: "Already at destination." },
      { input: '{"nums":[2,0,0]}', output: 'true', explanation: "Reaches end." }
    ],
    makeSolutions(
      `function solve(input) {
  let maxReach = 0;
  for (let i = 0; i < input.nums.length; i++) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + input.nums[i]);
  }
  return true;
}`,
      `#include <vector>
#include <algorithm>
using namespace std;
class Solution {
public:
    bool canJump(vector<int>& nums) {
        int maxReach = 0;
        for (int i = 0; i < nums.size(); i++) {
            if (i > maxReach) return false;
            maxReach = max(maxReach, i + nums[i]);
        }
        return true;
    }
};`,
      `class Solution {
    public boolean canJump(int[] nums) {
        int maxReach = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > maxReach) return false;
            maxReach = Math.max(maxReach, i + nums[i]);
        }
        return true;
    }
}`
    ),
    "### Approach: Greedy Maximum Reach\nTrack the furthest index reachable.\n\n- **Time Complexity:** $O(n)$\n- **Space Complexity:** $O(1)$",
    ["Track maxReach."],
    "Advanced Patterns"
  ),

  problem(
    "Word Break",
    "Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words.",
    "medium",
    ["string", "dp", "hashmap"],
    ["amazon", "google", "meta"],
    "1 ≤ s.length ≤ 300\n1 ≤ wordDict.length ≤ 1000",
    [
      { input: '{"s":"leetcode","wordDict":["leet","code"]}', output: 'true', explanation: "\"leet code\" segmented." },
      { input: '{"s":"applepenapple","wordDict":["apple","pen"]}', output: 'true', explanation: "\"apple pen apple\"." },
      { input: '{"s":"catsandog","wordDict":["cats","dog","sand","and","cat"]}', output: 'false', explanation: "Cannot segment." },
      { input: '{"s":"a","wordDict":["a"]}', output: 'true', explanation: "Matches." }
    ],
    makeSolutions(
      `function solve(input) {
  const { s, wordDict } = input, dict = new Set(wordDict), dp = Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && dict.has(s.substring(j, i))) { dp[i] = true; break; }
    }
  }
  return dp[s.length];
}`,
      `#include <string>
#include <vector>
#include <unordered_set>
using namespace std;
class Solution {
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        unordered_set<string> dict(wordDict.begin(), wordDict.end());
        vector<bool> dp(s.size() + 1, false);
        dp[0] = true;
        for (int i = 1; i <= s.size(); i++) {
            for (int j = 0; j < i; j++) {
                if (dp[j] && dict.count(s.substr(j, i - j))) { dp[i] = true; break; }
            }
        }
        return dp[s.size()];
    }
};`,
      `import java.util.*;
class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> dict = new HashSet<>(wordDict);
        boolean[] dp = new boolean[s.length() + 1];
        dp[0] = true;
        for (int i = 1; i <= s.length(); i++) {
            for (int j = 0; j < i; j++) {
                if (dp[j] && dict.contains(s.substring(j, i))) { dp[i] = true; break; }
            }
        }
        return dp[s.length()];
    }
}`
    ),
    "### Approach: Dynamic Programming Segmentation\n`dp[i] = dp[j] && dict.has(s[j..i])`.\n\n- **Time Complexity:** $O(n^2)$\n- **Space Complexity:** $O(n)$",
    ["DP with prefix match."],
    "Advanced Patterns"
  ),

  problem(
    "Combination Sum",
    "Given an array of distinct integers `candidates` and a target integer `target`, return a list of all unique combinations of `candidates` where the chosen numbers sum to `target`. You may use a number unlimited times.",
    "medium",
    ["array", "backtracking"],
    ["amazon", "google", "meta"],
    "1 ≤ candidates.length ≤ 30\n2 ≤ target ≤ 40",
    [
      { input: '{"candidates":[2,3,6,7],"target":7}', output: '[[2,2,3],[7]]', explanation: "Combinations summing to 7." },
      { input: '{"candidates":[2,3,5],"target":8}', output: '[[2,2,2,2],[2,3,3],[3,5]]', explanation: "Combinations summing to 8." },
      { input: '{"candidates":[2],"target":1}', output: '[]', explanation: "No combination." },
      { input: '{"candidates":[1],"target":2}', output: '[[1,1]]', explanation: "1+1 = 2." }
    ],
    makeSolutions(
      `function solve(input) {
  const { candidates, target } = input, res = [];
  const backtrack = (rem, start, path) => {
    if (rem === 0) { res.push([...path]); return; }
    if (rem < 0) return;
    for (let i = start; i < candidates.length; i++) {
      path.push(candidates[i]);
      backtrack(rem - candidates[i], i, path);
      path.pop();
    }
  };
  backtrack(target, 0, []);
  return res;
}`,
      `#include <vector>
using namespace std;
class Solution {
public:
    void backtrack(vector<int>& c, int target, int start, vector<int>& path, vector<vector<int>>& res) {
        if (target == 0) { res.push_back(path); return; }
        if (target < 0) return;
        for (int i = start; i < c.size(); i++) {
            path.push_back(c[i]);
            backtrack(c, target - c[i], i, path, res);
            path.pop_back();
        }
    }
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        vector<vector<int>> res;
        vector<int> path;
        backtrack(candidates, target, 0, path, res);
        return res;
    }
};`,
      `import java.util.*;
class Solution {
    private void backtrack(int[] c, int target, int start, List<Integer> path, List<List<Integer>> res) {
        if (target == 0) { res.add(new ArrayList<>(path)); return; }
        if (target < 0) return;
        for (int i = start; i < c.length; i++) {
            path.add(c[i]);
            backtrack(c, target - c[i], i, path, res);
            path.remove(path.size() - 1);
        }
    }
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> res = new ArrayList<>();
        backtrack(candidates, target, 0, new ArrayList<>(), res);
        return res;
    }
}`
    ),
    "### Approach: Backtracking Decision Tree\nRecurse with unlimited reuse starting at index `i`.\n\n- **Time Complexity:** $O(N^{\\frac{T}{M}})$\n- **Space Complexity:** $O(\\frac{T}{M})$",
    ["Backtracking."],
    "Advanced Patterns"
  ),

  problem(
    "Permutations",
    "Given an array `nums` of distinct integers, return all the possible permutations in any order.",
    "medium",
    ["array", "backtracking"],
    ["meta", "amazon", "google"],
    "1 ≤ nums.length ≤ 6",
    [
      { input: '{"nums":[1,2,3]}', output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]', explanation: "All 6 permutations." },
      { input: '{"nums":[0,1]}', output: '[[0,1],[1,0]]', explanation: "2 permutations." },
      { input: '{"nums":[1]}', output: '[[1]]', explanation: "1 permutation." },
      { input: '{"nums":[1,2]}', output: '[[1,2],[2,1]]', explanation: "2 permutations." }
    ],
    makeSolutions(
      `function solve(input) {
  const nums = input.nums, res = [];
  const backtrack = (path, used) => {
    if (path.length === nums.length) { res.push([...path]); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true; path.push(nums[i]);
      backtrack(path, used);
      path.pop(); used[i] = false;
    }
  };
  backtrack([], Array(nums.length).fill(false));
  return res;
}`,
      `#include <vector>
using namespace std;
class Solution {
public:
    void backtrack(vector<int>& nums, vector<int>& path, vector<bool>& used, vector<vector<int>>& res) {
        if (path.size() == nums.size()) { res.push_back(path); return; }
        for (int i = 0; i < nums.size(); i++) {
            if (used[i]) continue;
            used[i] = true; path.push_back(nums[i]);
            backtrack(nums, path, used, res);
            path.pop_back(); used[i] = false;
        }
    }
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> res; vector<int> path; vector<bool> used(nums.size(), false);
        backtrack(nums, path, used, res);
        return res;
    }
};`,
      `import java.util.*;
class Solution {
    private void backtrack(int[] nums, List<Integer> path, boolean[] used, List<List<Integer>> res) {
        if (path.size() == nums.length) { res.add(new ArrayList<>(path)); return; }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true; path.add(nums[i]);
            backtrack(nums, path, used, res);
            path.remove(path.size() - 1); used[i] = false;
        }
    }
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        backtrack(nums, new ArrayList<>(), new boolean[nums.length], res);
        return res;
    }
}`
    ),
    "### Approach: Backtracking Permutation Tree\nTrack used elements.\n\n- **Time Complexity:** $O(n \\cdot n!)$\n- **Space Complexity:** $O(n)$",
    ["Backtracking with used array."],
    "Advanced Patterns"
  ),

  problem(
    "Subsets",
    "Given an integer array `nums` of unique elements, return all possible subsets (the power set) without duplicate subsets.",
    "medium",
    ["array", "backtracking"],
    ["meta", "amazon", "google"],
    "1 ≤ nums.length ≤ 10",
    [
      { input: '{"nums":[1,2,3]}', output: '[[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]', explanation: "8 subsets." },
      { input: '{"nums":[0]}', output: '[[],[0]]', explanation: "2 subsets." },
      { input: '{"nums":[1,2]}', output: '[[],[1],[1,2],[2]]', explanation: "4 subsets." },
      { input: '{"nums":[]}', output: '[[]]', explanation: "Empty set." }
    ],
    makeSolutions(
      `function solve(input) {
  const nums = input.nums, res = [];
  const backtrack = (start, path) => {
    res.push([...path]);
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1, path);
      path.pop();
    }
  };
  backtrack(0, []);
  return res;
}`,
      `#include <vector>
using namespace std;
class Solution {
public:
    void backtrack(vector<int>& nums, int start, vector<int>& path, vector<vector<int>>& res) {
        res.push_back(path);
        for (int i = start; i < nums.size(); i++) {
            path.push_back(nums[i]);
            backtrack(nums, i + 1, path, res);
            path.pop_back();
        }
    }
    vector<vector<int>> subsets(vector<int>& nums) {
        vector<vector<int>> res; vector<int> path;
        backtrack(nums, 0, path, res);
        return res;
    }
};`,
      `import java.util.*;
class Solution {
    private void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> res) {
        res.add(new ArrayList<>(path));
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            backtrack(nums, i + 1, path, res);
            path.remove(path.size() - 1);
        }
    }
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), res);
        return res;
    }
}`
    ),
    "### Approach: Backtracking Power Set\nInclude or exclude each element.\n\n- **Time Complexity:** $O(2^n)$\n- **Space Complexity:** $O(n)$",
    ["Power set recursion."],
    "Advanced Patterns"
  ),

  problem(
    "Kth Largest Element in an Array",
    "Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array.",
    "medium",
    ["array", "heap"],
    ["meta", "amazon", "google"],
    "1 ≤ k ≤ nums.length ≤ 10^5",
    [
      { input: '{"nums":[3,2,1,5,6,4],"k":2}', output: '5', explanation: "2nd largest is 5." },
      { input: '{"nums":[3,2,3,1,2,4,5,5,6],"k":4}', output: '4', explanation: "4th largest is 4." },
      { input: '{"nums":[1],"k":1}', output: '1', explanation: "Single element." },
      { input: '{"nums":[7,6,5,4,3,2,1],"k":5}', output: '3', explanation: "5th largest is 3." }
    ],
    makeSolutions(
      `function solve(input) {
  return input.nums.sort((a, b) => b - a)[input.k - 1];
}`,
      `#include <vector>
#include <queue>
using namespace std;
class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        priority_queue<int, vector<int>, greater<int>> pq;
        for (int n : nums) {
            pq.push(n);
            if (pq.size() > k) pq.pop();
        }
        return pq.top();
    }
};`,
      `import java.util.*;
class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int n : nums) {
            pq.add(n);
            if (pq.size() > k) pq.poll();
        }
        return pq.peek();
    }
}`
    ),
    "### Approach: Min-Heap of Size K\nKeep top $k$ elements in min-heap.\n\n- **Time Complexity:** $O(n \\log k)$\n- **Space Complexity:** $O(k)$",
    ["Min-heap."],
    "Advanced Patterns"
  ),

  problem(
    "Median of Two Sorted Arrays",
    "Given two sorted arrays `nums1` and `nums2` of size `m` and `n`, return the median of the two sorted arrays in $O(\\log (m+n))$ time.",
    "hard",
    ["array", "binary-search", "heap"],
    ["google", "amazon", "microsoft"],
    "0 ≤ m, n ≤ 1000",
    [
      { input: '{"nums1":[1,3],"nums2":[2]}', output: '2', explanation: "Median is 2." },
      { input: '{"nums1":[1,2],"nums2":[3,4]}', output: '2.5', explanation: "Median is (2+3)/2 = 2.5." },
      { input: '{"nums1":[0,0],"nums2":[0,0]}', output: '0', explanation: "Median 0." },
      { input: '{"nums1":[],"nums2":[1]}', output: '1', explanation: "Median 1." }
    ],
    makeSolutions(
      `function solve(input) {
  const merged = [...input.nums1, ...input.nums2].sort((a, b) => a - b);
  const mid = Math.floor(merged.length / 2);
  return merged.length % 2 === 1 ? merged[mid] : (merged[mid - 1] + merged[mid]) / 2;
}`,
      `#include <vector>
#include <algorithm>
using namespace std;
class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        if (nums1.size() > nums2.size()) return findMedianSortedArrays(nums2, nums1);
        int m = nums1.size(), n = nums2.size(), l = 0, r = m;
        while (l <= r) {
            int p1 = (l + r) / 2, p2 = (m + n + 1) / 2 - p1;
            int maxL1 = (p1 == 0) ? -1e9 : nums1[p1 - 1];
            int minR1 = (p1 == m) ? 1e9 : nums1[p1];
            int maxL2 = (p2 == 0) ? -1e9 : nums2[p2 - 1];
            int minR2 = (p2 == n) ? 1e9 : nums2[p2];
            if (maxL1 <= minR2 && maxL2 <= minR1) {
                if ((m + n) % 2 == 0) return (max(maxL1, maxL2) + min(minR1, minR2)) / 2.0;
                return max(maxL1, maxL2);
            } else if (maxL1 > minR2) r = p1 - 1;
            else l = p1 + 1;
        }
        return 0.0;
    }
};`,
      `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);
        int m = nums1.length, n = nums2.length, l = 0, r = m;
        while (l <= r) {
            int p1 = (l + r) / 2, p2 = (m + n + 1) / 2 - p1;
            int maxL1 = (p1 == 0) ? Integer.MIN_VALUE : nums1[p1 - 1];
            int minR1 = (p1 == m) ? Integer.MAX_VALUE : nums1[p1];
            int maxL2 = (p2 == 0) ? Integer.MIN_VALUE : nums2[p2 - 1];
            int minR2 = (p2 == n) ? Integer.MAX_VALUE : nums2[p2];
            if (maxL1 <= minR2 && maxL2 <= minR1) {
                if ((m + n) % 2 == 0) return (Math.max(maxL1, maxL2) + Math.min(minR1, minR2)) / 2.0;
                return Math.max(maxL1, maxL2);
            } else if (maxL1 > minR2) r = p1 - 1;
            else l = p1 + 1;
        }
        return 0.0;
    }
}`
    ),
    "### Approach: Partition Binary Search\nBinary search cut point on smaller array.\n\n- **Time Complexity:** $O(\\log(\\min(m, n)))$\n- **Space Complexity:** $O(1)$",
    ["Binary search partition."],
    "Advanced Patterns"
  ),

  problem(
    "Edit Distance",
    "Given two strings `word1` and `word2`, return the minimum number of operations (insert, delete, replace) required to convert `word1` to `word2`.",
    "hard",
    ["string", "dp"],
    ["google", "amazon", "microsoft"],
    "0 ≤ word1.length, word2.length ≤ 500",
    [
      { input: '{"word1":"horse","word2":"ros"}', output: '3', explanation: "3 operations." },
      { input: '{"word1":"intention","word2":"execution"}', output: '5', explanation: "5 operations." },
      { input: '{"word1":"","word2":"a"}', output: '1', explanation: "1 insertion." },
      { input: '{"word1":"abc","word2":"abc"}', output: '0', explanation: "0 operations." }
    ],
    makeSolutions(
      `function solve(input) {
  const { word1, word2 } = input, m = word1.length, n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}`,
      `#include <string>
#include <vector>
#include <algorithm>
using namespace std;
class Solution {
public:
    int minDistance(string word1, string word2) {
        int m = word1.size(), n = word2.size();
        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
        for (int i = 0; i <= m; i++) dp[i][0] = i;
        for (int j = 0; j <= n; j++) dp[0][j] = j;
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++) {
                if (word1[i - 1] == word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
                else dp[i][j] = 1 + min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]});
            }
        return dp[m][n];
    }
};`,
      `class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length(), n = word2.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = i;
        for (int j = 0; j <= n; j++) dp[0][j] = j;
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1];
                else dp[i][j] = 1 + Math.min(dp[i - 1][j], Math.min(dp[i][j - 1], dp[i - 1][j - 1]));
            }
        return dp[m][n];
    }
}`
    ),
    "### Approach: 2D Dynamic Programming (Levenshtein)\n`dp[i][j] = 1 + min(insert, delete, replace)`.\n\n- **Time Complexity:** $O(m \\times n)$\n- **Space Complexity:** $O(m \\times n)$",
    ["Levenshtein DP."],
    "Advanced Patterns"
  )
];

async function seed() {
  if (!process.env.DB_CONNECT_STRING) throw new Error("DB_CONNECT_STRING is required to seed problems.");
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.DB_CONNECT_STRING);
  console.log("Connected! Creating author account if missing...");

  const author = await User.findOneAndUpdate(
    { emailId: "content@algoforge.dev" },
    {
      $setOnInsert: {
        firstName: "AlgoForge",
        lastName: "Curator",
        emailId: "content@algoforge.dev",
        role: "admin",
        password: "seeded-content-account",
        isVerified: true
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  console.log(`Author account ready (ID: ${author._id}). Upserting ${catalog.length} problems...`);

  const trackProblemMap = {
    "Foundation": [],
    "Interview Core": [],
    "Trees & Graphs": [],
    "Advanced Patterns": []
  };

  for (const entry of catalog) {
    const res = await Problem.findOneAndUpdate(
      { title: entry.title },
      {
        $set: {
          description: entry.description,
          difficulty: entry.difficulty,
          tags: entry.tags,
          companies: entry.companies,
          constraints: entry.constraints,
          hints: entry.hints,
          editorial: entry.editorial,
          visibleTestCases: entry.visibleTestCases,
          hiddenTestCases: entry.hiddenTestCases,
          startCode: entry.startCode,
          referenceSolution: entry.referenceSolution,
          problemCreator: author._id
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (trackProblemMap[entry.track]) {
      trackProblemMap[entry.track].push(res._id);
    }

    console.log(`  ✓ [${entry.track}] ${entry.title} (${entry.difficulty})`);
  }

  // ========================================================
  // SEED / SYNC 4 OFFICIAL STUDY PLANS (MATCHING THE 4 TRACKS)
  // ========================================================
  console.log("\nSyncing official Study Plans matching the 4 learning tracks...");

  const trackConfigs = [
    {
      name: "Foundation Track",
      trackKey: "Foundation",
      description: "Master foundational patterns across arrays, strings, and two-pointers that unlock dozens of questions.",
      difficulty: "easy",
      duration: 6,
      icon: "layers",
      color: "from-emerald-500 to-teal-500",
      topics: ["array", "string", "two-pointers", "prefix-sum"]
    },
    {
      name: "Interview Core Track",
      trackKey: "Interview Core",
      description: "Core algorithms: Hash maps, sliding windows, two pointers, intervals, monotonic stacks, and binary search.",
      difficulty: "medium",
      duration: 9,
      icon: "route",
      color: "from-cyan-500 to-blue-500",
      topics: ["hashmap", "sliding-window", "two-pointers", "stack", "intervals", "binary-search"]
    },
    {
      name: "Trees & Graphs Track",
      trackKey: "Trees & Graphs",
      description: "Build deep confidence with recursive thinking, binary trees, BSTs, BFS/DFS flood fills, and cycle detection.",
      difficulty: "medium",
      duration: 8,
      icon: "network",
      color: "from-amber-500 to-orange-500",
      topics: ["tree", "graph", "matrix", "dfs", "queue"]
    },
    {
      name: "Advanced Patterns Track",
      trackKey: "Advanced Patterns",
      description: "Master dynamic programming (1D & 2D), heaps, priority queues, backtracking, and divide-and-conquer.",
      difficulty: "hard",
      duration: 7,
      icon: "map",
      color: "from-rose-500 to-red-500",
      topics: ["dp", "heap", "backtracking", "bit-manipulation"]
    }
  ];

  for (const tc of trackConfigs) {
    const problemIds = trackProblemMap[tc.trackKey] || [];
    const problemsPerDay = 2;
    const days = [];

    for (let i = 0; i < problemIds.length; i += problemsPerDay) {
      const dayNum = Math.floor(i / problemsPerDay) + 1;
      days.push({
        dayNumber: dayNum,
        title: `Day ${dayNum}: ${tc.trackKey} Focus`,
        problems: problemIds.slice(i, i + problemsPerDay)
      });
    }

    await StudyPlan.findOneAndUpdate(
      { name: tc.name },
      {
        $set: {
          description: tc.description,
          difficulty: tc.difficulty,
          duration: days.length || tc.duration,
          icon: tc.icon,
          color: tc.color,
          topics: tc.topics,
          days: days,
          isOfficial: true,
          isPublic: true,
          createdBy: author._id
        }
      },
      { upsert: true }
    );
    console.log(`  ✓ [STUDY PLAN] ${tc.name} (${problemIds.length} problems across ${days.length} days)`);
  }

  console.log(`\n========================================`);
  console.log(`Seed Complete! Total: ${catalog.length} curated problems across 4 Tracks.`);
  console.log(`Foundation: ${trackProblemMap["Foundation"].length} | Interview Core: ${trackProblemMap["Interview Core"].length} | Trees & Graphs: ${trackProblemMap["Trees & Graphs"].length} | Advanced Patterns: ${trackProblemMap["Advanced Patterns"].length}`);
  console.log(`========================================\n`);

  await mongoose.disconnect();
  console.log("Database connection closed.");
}

seed().catch((error) => {
  console.error("Seed failed:", error.message);
  mongoose.disconnect();
  process.exitCode = 1;
});
