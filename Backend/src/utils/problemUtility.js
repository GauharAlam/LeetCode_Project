const axios = require("axios");
require("dotenv").config();

// ---------------------------------------------------------------------------
// Language mapping (accepts common aliases)
// ---------------------------------------------------------------------------
const normalizeLanguage = (lang) => {
  if (!lang || typeof lang !== "string") return null;
  const l = lang.trim().toLowerCase();
  if (["c++", "cpp", "c_plus_plus", "cplusplus", "g++"].includes(l)) return "c++";
  if (["java"].includes(l)) return "java";
  if (["javascript", "js", "node", "nodejs"].includes(l)) return "javascript";
  return null;
};

const getLanguageById = (lang) => {
  const normalized = normalizeLanguage(lang);
  const language = {
    "c++": 54,
    java: 62,
    javascript: 63,
  };
  return normalized ? language[normalized] : undefined;
};

// ---------------------------------------------------------------------------
// Judge0 helpers — throw structured errors instead of returning null so the
// controllers can send a clear JSON message to the frontend.
// ---------------------------------------------------------------------------
const judgeError = (message, details, status = 502) => {
  const err = new Error(message);
  err.status = status;
  err.details = details;
  return err;
};

const requireJudgeKey = () => {
  if (!process.env.JUDGE0_API_KEY) {
    throw judgeError(
      "Code execution is not configured on the server (JUDGE0_API_KEY is missing).",
      "Set JUDGE0_API_KEY in the backend environment (Render dashboard -> Environment).",
      500
    );
  }
};

const b64 = (s) => Buffer.from(String(s ?? ""), "utf8").toString("base64");
const unb64 = (s) => {
  if (!s) return s;
  try {
    return Buffer.from(String(s), "base64").toString("utf8");
  } catch {
    return s;
  }
};

const submitBatch = async (submissions) => {
  requireJudgeKey();
  // Base64 transport: avoids Judge0 "cannot be converted to UTF-8" 400s on
  // large generated drivers. Responses are decoded back in submitToken.
  const encoded = (submissions || []).map((s) => ({
    source_code: b64(s.source_code),
    language_id: s.language_id,
    stdin: b64(s.stdin),
    expected_output: b64(s.expected_output),
  }));
  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      base64_encoded: "true",
    },
    headers: {
      "x-rapidapi-key": process.env.JUDGE0_API_KEY, // Use environment variables for API keys
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: { submissions: encoded },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    const details = error.response ? error.response.data : error.message;
    console.error("Error in submitBatch:", details);
    throw judgeError("No response from Judge0 during submission.", details, 502);
  }
};

const waiting = (timer) => {
  return new Promise((resolve) => setTimeout(resolve, timer));
};

const submitToken = async (resultToken) => {
  requireJudgeKey();
  const options = {
    method: "GET",
    url: `https://judge0-ce.p.rapidapi.com/submissions/batch`,
    params: {
      tokens: resultToken.join(","), // Join tokens into a single string
      base64_encoded: "true",
      fields: "*",
    },
    headers: {
      "x-rapidapi-key": process.env.JUDGE0_API_KEY, // Use environment variables for API keys
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      const details = error.response ? error.response.data : error.message;
      console.error("Error in submitToken:", details);
      throw judgeError("No response from Judge0 when fetching results.", details, 502);
    }
  }

  const MAX_RETRIES = 30; // Maximum 30 seconds timeout
  let retries = 0;

  while (retries < MAX_RETRIES) {
    const result = await fetchData();

    if (!result) {
      retries++;
      await waiting(1000);
      continue;
    }

    // Judge0 returns results inside `submissions` array
    const isResultObtained = result.submissions.every(
      (r) => r.status?.id > 2 // use optional chaining to be safe
    );

    if (isResultObtained) {
      // Decode base64 fields back to plain text so controllers/frontend
      // keep working with plain strings (Judge0 returns *every* field,
      // including stdin/expected_output, base64-encoded when requested).
      return result.submissions.map((r) => ({
        ...r,
        stdout: unb64(r.stdout),
        stderr: unb64(r.stderr),
        compile_output: unb64(r.compile_output),
        message: unb64(r.message),
        stdin: unb64(r.stdin),
        expected_output: unb64(r.expected_output),
      }));
    }

    retries++;
    await waiting(1000);
  }

  throw judgeError(
    "Judge0 request timeout - maximum retries exceeded.",
    "The code took longer than 30s. Check for infinite loops.",
    504
  );
};

// ---------------------------------------------------------------------------
// Signature parsing (LeetCode-style `class Solution` support for C++/Java)
// ---------------------------------------------------------------------------
const UNSUPPORTED_TYPE_RE = /TreeNode|ListNode|RandomNode|GraphNode|Node\s*\*|NestedInteger/i;

const splitTopLevel = (s, delimiter = ",") => {
  const parts = [];
  let depthAngle = 0;
  let depthParen = 0;
  let depthBracket = 0;
  let current = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "<") depthAngle++;
    else if (c === ">") depthAngle = Math.max(0, depthAngle - 1);
    else if (c === "(") depthParen++;
    else if (c === ")") depthParen = Math.max(0, depthParen - 1);
    else if (c === "[") depthBracket++;
    else if (c === "]") depthBracket = Math.max(0, depthBracket - 1);
    if (c === delimiter && depthAngle === 0 && depthParen === 0 && depthBracket === 0) {
      parts.push(current);
      current = "";
    } else {
      current += c;
    }
  }
  if (current.trim() !== "") parts.push(current);
  return parts;
};

const extractSolutionBody = (code) => {
  const idx = code.search(/class\s+Solution\b/);
  if (idx === -1) return null;
  const braceStart = code.indexOf("{", idx);
  if (braceStart === -1) return null;
  let depth = 0;
  for (let i = braceStart; i < code.length; i++) {
    if (code[i] === "{") depth++;
    else if (code[i] === "}") {
      depth--;
      if (depth === 0) return code.slice(braceStart + 1, i);
    }
  }
  return null;
};

const parseCppSignature = (code) => {
  const body = extractSolutionBody(code);
  if (!body) return null;
  // Match: <return type> <name>(<params>) {   (skip control flow keywords)
  const re = /([A-Za-z_:][\w:\s<>,*&]*?)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*(?:const\s*)?\{/g;
  const candidates = [];
  let m;
  const banned = new Set(["if", "for", "while", "switch", "catch", "return"]);
  while ((m = re.exec(body)) !== null) {
    let retRaw = m[1].trim().replace(/^(public|private|protected)\s*:\s*/, "").trim();
    retRaw = retRaw.replace(/^(public|protected|private|static)\s+/g, "").trim();
    const name = m[2].trim();
    const paramsRaw = m[3].trim();
    if (banned.has(name)) continue;
    if (/^(public|private|protected)\s*:?$/.test(retRaw)) continue;
    if (!retRaw) continue;
    if (name === "Solution" || name.startsWith("~")) continue; // constructor/destructor
    candidates.push({ retRaw, name, paramsRaw });
  }
  // Prefer public-looking methods; if several distinct methods exist the class
  // is likely stateful (e.g. MinStack) which a single-call driver can't handle.
  const distinct = [...new Set(candidates.map((c) => c.name))];
  if (distinct.length === 0) return null;
  if (distinct.length > 1) {
    return { unsupported: `stateful class with ${distinct.length} methods (${distinct.join(", ")})` };
  }
  const { retRaw, name, paramsRaw } = candidates[0];
  const params = paramsRaw === "" || paramsRaw === "void"
    ? []
    : splitTopLevel(paramsRaw).map((p) => {
        const t = p.trim().replace(/\s*=\s*[^,]+$/, "").trim(); // drop default values
        const parts = t.split(/\s+/);
        const varName = (parts.pop() || "arg").replace(/^[*&]+/, "");
        const type = parts.join(" ");
        return { type, name: varName || "arg" };
      });
  return { returnType: retRaw, name, params };
};

const parseJavaSignature = (code) => {
  const body = extractSolutionBody(code);
  if (!body) return null;
  const re = /(public|protected|private)?\s*(static\s+)?([\w<>\[\].,\s?]+?)\s+(\w+)\s*\(([^)]*)\)\s*(?:throws\s+[\w,\s]+)?\{/g;
  const candidates = [];
  let m;
  const banned = new Set(["if", "for", "while", "switch", "catch", "return"]);
  while ((m = re.exec(body)) !== null) {
    let retRaw = (m[3] || "").trim().replace(/^(public|protected|private|static)\s+/g, "").trim();
    const name = (m[4] || "").trim();
    const paramsRaw = (m[5] || "").trim();
    if (!retRaw || !name || banned.has(name)) continue;
    if (name === "Solution") continue;
    if (/^(public|private|protected|static)$/.test(retRaw)) continue;
    candidates.push({ retRaw, name, paramsRaw });
  }
  const distinct = [...new Set(candidates.map((c) => c.name))];
  if (distinct.length === 0) return null;
  if (distinct.length > 1) {
    return { unsupported: `stateful class with ${distinct.length} methods (${distinct.join(", ")})` };
  }
  const { retRaw, name, paramsRaw } = candidates[0];
  const params = paramsRaw === ""
    ? []
    : splitTopLevel(paramsRaw).map((p, i) => {
        const t = p.trim();
        const parts = t.split(/\s+/);
        const varName = parts.length > 1 ? parts.pop() : `arg${i}`;
        return { type: parts.join(" "), name: varName };
      });
  return { returnType: retRaw, name, params };
};

// ---------------------------------------------------------------------------
// C++ driver (STL only — no Boost on Judge0)
// The driver reads the whole stdin (JSON object), extracts values
// positionally, converts them to the Solution method's parameter types,
// calls the method and prints the result in the expected-output format.
// ---------------------------------------------------------------------------
const CPP_HELPERS = `
static inline std::string __trim(const std::string& s){ size_t a=0; while(a<s.size()&&isspace((unsigned char)s[a])) a++; size_t b=s.size(); while(b>a&&isspace((unsigned char)s[b-1])) b--; return s.substr(a,b-a); }
static std::vector<std::string> __extractValues(const std::string& raw){
  std::vector<std::string> out; std::string t=__trim(raw);
  if(t.empty()) return out;
  if(t.front()!=(char)123){ out.push_back(t); return out; }
  size_t i=1; bool inS=false,esc=false,readingVal=false; size_t valStart=std::string::npos;
  int bDepth=0,brDepth=0;
  for(;i<t.size();i++){ char c=t[i];
    if(readingVal){
      if(inS){ if(esc) esc=false; else if(c==(char)92) esc=true; else if(c==(char)34) inS=false; }
      else { if(c==(char)34) inS=true;
        else if(c==(char)123) bDepth++;
        else if(c==(char)125){ if(bDepth==0){ out.push_back(__trim(t.substr(valStart,i-valStart))); break; } else bDepth--; }
        else if(c==(char)91) brDepth++;
        else if(c==(char)93) brDepth--;
        else if(c==(char)44 && bDepth==0 && brDepth==0){ out.push_back(__trim(t.substr(valStart,i-valStart))); readingVal=false; } }
    } else { if(c==(char)58){ size_t j=i+1; while(j<t.size()&&isspace((unsigned char)t[j])) j++; valStart=j; readingVal=true; bDepth=0; brDepth=0; inS=false; esc=false; i=j-1; } }
  }
  return out;
}
static long long __parseInt(const std::string& s){ return std::stoll(__trim(s)); }
static double __parseDouble(const std::string& s){ return std::stod(__trim(s)); }
static bool __parseBool(const std::string& s){ std::string t=__trim(s); std::transform(t.begin(),t.end(),t.begin(),::tolower); return (t=="true"||t=="1"); }
static std::string __parseString(const std::string& s){ std::string t=__trim(s); if(t.size()>=2&&t.front()==(char)34&&t.back()==(char)34){ std::string o; for(size_t i=1;i+1<t.size();i++){ if(t[i]==(char)92&&i+1<t.size()-1){ char n=t[i+1]; if(n=='n') o+='\\n'; else if(n=='t') o+='\\t'; else o+=n; i++; } else o+=t[i]; } return o; } return t; }
static char __parseChar(const std::string& s){ std::string t=__parseString(s); return t.empty()?0:t[0]; }
static std::vector<long long> __parseVecLL(const std::string& s){ std::vector<long long> v; std::string t=__trim(s); if(t.size()<2) return v; std::string inner=t.substr(1,t.size()-2); std::string cur; for(size_t i=0;i<inner.size();i++){ char c=inner[i]; if(c==(char)44){ if(!__trim(cur).empty()) v.push_back(std::stoll(__trim(cur))); cur.clear(); } else cur+=c; } if(!__trim(cur).empty()) v.push_back(std::stoll(__trim(cur))); return v; }
static std::vector<int> __parseVectorInt(const std::string& s){ std::vector<int> v; for(auto x:__parseVecLL(s)) v.push_back((int)x); return v; }
static std::vector<double> __parseVectorDouble(const std::string& s){ std::vector<double> v; std::string t=__trim(s); if(t.size()<2) return v; std::string inner=t.substr(1,t.size()-2); std::string cur; for(size_t i=0;i<inner.size();i++){ char c=inner[i]; if(c==(char)44){ if(!__trim(cur).empty()) v.push_back(std::stod(__trim(cur))); cur.clear(); } else cur+=c; } if(!__trim(cur).empty()) v.push_back(std::stod(__trim(cur))); return v; }
static std::vector<std::string> __splitTop(const std::string& inner){ std::vector<std::string> parts; std::string cur; bool inS=false,esc=false; int bd=0,brd=0; for(size_t i=0;i<inner.size();i++){ char c=inner[i]; if(inS){ cur+=c; if(esc) esc=false; else if(c==(char)92) esc=true; else if(c==(char)34) inS=false; } else { if(c==(char)34){ inS=true; cur+=c; } else if(c==(char)91){ brd++; cur+=c; } else if(c==(char)93){ brd--; cur+=c; } else if(c==(char)123){ bd++; cur+=c; } else if(c==(char)125){ bd--; cur+=c; } else if(c==(char)44&&bd==0&&brd==0){ parts.push_back(cur); cur.clear(); } else cur+=c; } } if(!__trim(cur).empty()) parts.push_back(cur); return parts; }
static std::vector<std::string> __parseVectorString(const std::string& s){ std::vector<std::string> v; std::string t=__trim(s); if(t.size()<2) return v; for(auto &p:__splitTop(t.substr(1,t.size()-2))) v.push_back(__parseString(p)); return v; }
static std::vector<std::vector<int>> __parseVectorVectorInt(const std::string& s){ std::vector<std::vector<int>> v; std::string t=__trim(s); if(t.size()<2) return v; for(auto &p:__splitTop(t.substr(1,t.size()-2))) v.push_back(__parseVectorInt(p)); return v; }
static std::vector<std::vector<std::string>> __parseVectorVectorString(const std::string& s){ std::vector<std::vector<std::string>> v; std::string t=__trim(s); if(t.size()<2) return v; for(auto &p:__splitTop(t.substr(1,t.size()-2))) v.push_back(__parseVectorString(p)); return v; }
static std::vector<std::vector<char>> __parseVectorVectorChar(const std::string& s){ std::vector<std::vector<char>> v; std::string t=__trim(s); if(t.size()<2) return v; for(auto &row:__splitTop(t.substr(1,t.size()-2))){ std::vector<char> r; for(auto &cell:__parseVectorString(row)) r.push_back(cell.empty()?0:cell[0]); v.push_back(r); } return v; }
static std::string __toOutput(long long x){ return std::to_string(x); }
static std::string __toOutput(int x){ return std::to_string(x); }
static std::string __toOutput(double x){ std::ostringstream o; o<<std::setprecision(10)<<x; return o.str(); }
static std::string __toOutput(bool x){ return x?"true":"false"; }
static std::string __toOutput(const std::string& x){ return x; }
static std::string __toOutput(char x){ std::string s; s+=x; return s; }
static std::string __toOutput(const std::vector<int>& v){ std::string o="["; for(size_t i=0;i<v.size();i++){ if(i) o+=","; o+=std::to_string(v[i]); } o+="]"; return o; }
static std::string __toOutput(const std::vector<long long>& v){ std::string o="["; for(size_t i=0;i<v.size();i++){ if(i) o+=","; o+=std::to_string(v[i]); } o+="]"; return o; }
static std::string __toOutput(const std::vector<double>& v){ std::string o="["; for(size_t i=0;i<v.size();i++){ if(i) o+=","; std::ostringstream ss; ss<<std::setprecision(10)<<v[i]; o+=ss.str(); } o+="]"; return o; }
static std::string __toOutput(const std::vector<std::string>& v){ std::string o="["; for(size_t i=0;i<v.size();i++){ if(i) o+=","; o+="\\""+v[i]+"\\""; } o+="]"; return o; }
static std::string __toOutput(const std::vector<std::vector<int>>& m){ std::string o="["; for(size_t i=0;i<m.size();i++){ if(i) o+=","; o+=__toOutput(m[i]); } o+="]"; return o; }
static std::string __toOutput(const std::vector<std::vector<std::string>>& m){ std::string o="["; for(size_t i=0;i<m.size();i++){ if(i) o+=","; o+=__toOutput(m[i]); } o+="]"; return o; }
static std::string __toOutput(const std::vector<std::vector<char>>& m){ std::string o="["; for(size_t i=0;i<m.size();i++){ if(i) o+=","; o+="["; for(size_t j=0;j<m[i].size();j++){ if(j) o+=","; o+="\\""; o+=m[i][j]; o+="\\""; } o+="]"; } o+="]"; return o; }
`;

const cppBaseType = (t) => {
  const n = t.replace(/\bconst\b/g, "").replace(/[&*]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  return n;
};

const cppParseExpr = (type, valExpr) => {
  const n = cppBaseType(type);
  if (["int", "long", "long long", "short", "long long int"].includes(n)) return `__parseInt(${valExpr})`;
  if (["double", "float"].includes(n)) return `__parseDouble(${valExpr})`;
  if (["bool"].includes(n)) return `__parseBool(${valExpr})`;
  if (["string", "std::string"].includes(n)) return `__parseString(${valExpr})`;
  if (["char"].includes(n)) return `__parseChar(${valExpr})`;
  if (n === "vector<int>" || n === "vector<long>" || n === "vector<long long>") return `__parseVectorInt(${valExpr})`;
  if (n === "vector<double>" || n === "vector<float>") return `__parseVectorDouble(${valExpr})`;
  if (n === "vector<string>" || n === "vector<std::string>") return `__parseVectorString(${valExpr})`;
  if (n === "vector<vector<int>>" || n === "vector<vector<long>>") return `__parseVectorVectorInt(${valExpr})`;
  if (n === "vector<vector<string>>" || n === "vector<vector<std::string>>") return `__parseVectorVectorString(${valExpr})`;
  if (n === "vector<vector<char>>") return `__parseVectorVectorChar(${valExpr})`;
  return null;
};

const buildCppDriver = (code) => {
  if (/int\s+main\s*\(/.test(code)) return code; // full program already
  const sig = parseCppSignature(code);
  if (!sig) {
    throw judgeError(
      "Could not find a Solution method to run. Write your logic as a method inside 'class Solution' (e.g. 'vector<int> twoSum(...)') or provide a full program with 'int main'.",
      null,
      400
    );
  }
  if (sig.unsupported) {
    throw judgeError(
      `C++ auto-runner does not support this ${sig.unsupported}. This problem needs a custom runner — JavaScript is supported, or write a full program with 'int main' that reads stdin and prints the answer.`,
      null,
      400
    );
  }
  if (UNSUPPORTED_TYPE_RE.test(`${sig.returnType} ${sig.params.map((p) => p.type).join(" ")}`)) {
    throw judgeError(
      "C++ auto-runner does not support tree / linked-list / graph node types yet. JavaScript is supported for these problems, or write a full program with 'int main'.",
      null,
      400
    );
  }
  const isVoid = /^\s*void\s*$/.test(sig.returnType.trim());
  const decls = [];
  const args = [];
  sig.params.forEach((p, i) => {
    // Declare by value (strip const/&/*): parse helpers return temporaries
    // which cannot bind to `vector<int>&`, and a named lvalue still binds
    // to reference params at the call site (supports in-place modification).
    const cleanType = p.type.replace(/\bconst\b/g, "").replace(/[&*]/g, "").replace(/\s+/g, " ").trim() || "auto";
    const varName = `__p${i}`;
    const expr = cppParseExpr(p.type, `vals[${i}]`);
    if (!expr) {
      throw judgeError(
        `C++ auto-runner does not support parameter type '${p.type}'. Supported: int, double, bool, string, char, vector<int/string/double>, vector<vector<int/string/char>>.`,
        null,
        400
      );
    }
    decls.push(`  ${cleanType} ${varName} = ${expr};`);
    // Pass lvalues for reference params; for by-value this also works.
    args.push(varName);
  });
  if (!isVoid && !cppParseExpr(sig.returnType, "x") && !/void/.test(sig.returnType)) {
    // Allowlist return types by attempting a parse mapping on a dummy value.
    const n = cppBaseType(sig.returnType);
    const supportedRet = ["int", "long", "long long", "short", "double", "float", "bool", "string", "std::string", "char", "vector<int>", "vector<long>", "vector<long long>", "vector<double>", "vector<float>", "vector<string>", "vector<std::string>", "vector<vector<int>>", "vector<vector<long>>", "vector<vector<string>>", "vector<vector<std::string>>", "vector<vector<char>>"].includes(n);
    if (!supportedRet) {
      throw judgeError(
        `C++ auto-runner does not support return type '${sig.returnType}'.`,
        null,
        400
      );
    }
  }
  const call = `sol.${sig.name}(${args.join(", ")})`;
  const needsBits = !/#include\s*<bits\/stdc\+\+\.h>/.test(code);
  // Find first vector-typed param for void (in-place) printing.
  let voidPrint = "cout<<\"\";";
  if (isVoid) {
    const idx = sig.params.findIndex((p) => /vector/i.test(p.type));
    if (idx !== -1) voidPrint = `cout<<__toOutput(__p${idx});`;
  }
  const mainBody = isVoid
    ? `  Solution sol;\n  ${call};\n  ${voidPrint}`
    : `  Solution sol;\n  auto __res = ${call};\n  cout<<__toOutput(__res);`;
  return `${needsBits ? "#include <bits/stdc++.h>\n" : ""}${
    /using\s+namespace\s+std\s*;/.test(code) ? "" : "using namespace std;\n"
  }${CPP_HELPERS}\n// User Code\n${code}\nint main(){\n  ios::sync_with_stdio(false);\n  cin.tie(nullptr);\n  std::string raw((std::istreambuf_iterator<char>(std::cin)), std::istreambuf_iterator<char>());\n  std::vector<std::string> vals = __extractValues(raw);\n  if(vals.size() < ${sig.params.length}){ cout<<""; return 0; }\n${decls.join("\n")}\n${mainBody}\n  return 0;\n}`;
};

// ---------------------------------------------------------------------------
// Java driver (stdlib only). File holds `class Solution` + `public class Main`.
// Judge0 compiles this as Main.java — verified working.
// ---------------------------------------------------------------------------
const JAVA_HELPERS = `
  static String __trim(String s){ return s == null ? "" : s.trim(); }
  static java.util.List<String> __extractValues(String raw){
    java.util.List<String> out = new java.util.ArrayList<>();
    String t = __trim(raw);
    if(t.isEmpty()) return out;
    if(t.charAt(0) != '{'){ out.add(t); return out; }
    boolean inS=false,esc=false,readingVal=false;
    int bDepth=0,brDepth=0; int valStart=-1;
    for(int i=1;i<t.length();i++){ char c=t.charAt(i);
      if(readingVal){
        if(inS){ if(esc) esc=false; else if(c=='\\\\') esc=true; else if(c=='"') inS=false; }
        else { if(c=='"') inS=true;
          else if(c=='{') bDepth++;
          else if(c=='}'){ if(bDepth==0){ out.add(__trim(t.substring(valStart,i))); break; } else bDepth--; }
          else if(c=='[') brDepth++;
          else if(c==']') brDepth--;
          else if(c==',' && bDepth==0 && brDepth==0){ out.add(__trim(t.substring(valStart,i))); readingVal=false; } }
      } else { if(c==':'){ int j=i+1; while(j<t.length()&&Character.isWhitespace(t.charAt(j))) j++; valStart=j; readingVal=true; bDepth=0; brDepth=0; inS=false; esc=false; i=j-1; } }
    }
    return out;
  }
  static int __parseInt(String s){ return Integer.parseInt(__trim(s)); }
  static long __parseLong(String s){ return Long.parseLong(__trim(s)); }
  static double __parseDouble(String s){ return Double.parseDouble(__trim(s)); }
  static boolean __parseBool(String s){ String t=__trim(s).toLowerCase(); return t.equals("true")||t.equals("1"); }
  static String __parseString(String s){ String t=__trim(s); if(t.length()>=2&&t.charAt(0)=='"'&&t.charAt(t.length()-1)=='"'){ StringBuilder o=new StringBuilder(); for(int i=1;i+1<t.length();i++){ if(t.charAt(i)=='\\\\'&&i+1<t.length()-1){ char n=t.charAt(i+1); if(n=='n') o.append('\\n'); else if(n=='t') o.append('\\t'); else o.append(n); i++; } else o.append(t.charAt(i)); } return o.toString(); } return t; }
  static java.util.List<String> __splitTop(String inner){ java.util.List<String> parts=new java.util.ArrayList<>(); StringBuilder cur=new StringBuilder(); boolean inS=false,esc=false; int bd=0,brd=0; for(int i=0;i<inner.length();i++){ char c=inner.charAt(i); if(inS){ cur.append(c); if(esc) esc=false; else if(c=='\\\\') esc=true; else if(c=='"') inS=false; } else { if(c=='"'){ inS=true; cur.append(c); } else if(c=='['){ brd++; cur.append(c); } else if(c==']'){ brd--; cur.append(c); } else if(c=='{'){ bd++; cur.append(c); } else if(c=='}'){ bd--; cur.append(c); } else if(c==','&&bd==0&&brd==0){ parts.add(cur.toString()); cur.setLength(0); } else cur.append(c); } } if(!__trim(cur.toString()).isEmpty()) parts.add(cur.toString()); return parts; }
  static int[] __parseIntArray(String s){ String t=__trim(s); if(t.length()<2) return new int[0]; java.util.List<String> ps=__splitTop(t.substring(1,t.length()-1)); int[] a=new int[ps.size()]; for(int i=0;i<ps.size();i++) a[i]=Integer.parseInt(__trim(ps.get(i))); return a; }
  static long[] __parseLongArray(String s){ String t=__trim(s); if(t.length()<2) return new long[0]; java.util.List<String> ps=__splitTop(t.substring(1,t.length()-1)); long[] a=new long[ps.size()]; for(int i=0;i<ps.size();i++) a[i]=Long.parseLong(__trim(ps.get(i))); return a; }
  static double[] __parseDoubleArray(String s){ String t=__trim(s); if(t.length()<2) return new double[0]; java.util.List<String> ps=__splitTop(t.substring(1,t.length()-1)); double[] a=new double[ps.size()]; for(int i=0;i<ps.size();i++) a[i]=Double.parseDouble(__trim(ps.get(i))); return a; }
  static boolean[] __parseBoolArray(String s){ String t=__trim(s); if(t.length()<2) return new boolean[0]; java.util.List<String> ps=__splitTop(t.substring(1,t.length()-1)); boolean[] a=new boolean[ps.size()]; for(int i=0;i<ps.size();i++) a[i]=__parseBool(ps.get(i)); return a; }
  static String[] __parseStringArray(String s){ String t=__trim(s); if(t.length()<2) return new String[0]; java.util.List<String> ps=__splitTop(t.substring(1,t.length()-1)); String[] a=new String[ps.size()]; for(int i=0;i<ps.size();i++) a[i]=__parseString(ps.get(i)); return a; }
  static int[][] __parseInt2D(String s){ String t=__trim(s); if(t.length()<2) return new int[0][0]; java.util.List<String> ps=__splitTop(t.substring(1,t.length()-1)); int[][] m=new int[ps.size()][]; for(int i=0;i<ps.size();i++) m[i]=__parseIntArray(ps.get(i)); return m; }
  static String[][] __parseString2D(String s){ String t=__trim(s); if(t.length()<2) return new String[0][0]; java.util.List<String> ps=__splitTop(t.substring(1,t.length()-1)); String[][] m=new String[ps.size()][]; for(int i=0;i<ps.size();i++) m[i]=__parseStringArray(ps.get(i)); return m; }
  static char[][] __parseChar2D(String s){ String[][] sm=__parseString2D(s); char[][] m=new char[sm.length][]; for(int i=0;i<sm.length;i++){ m[i]=new char[sm[i].length]; for(int j=0;j<sm[i].length;j++) m[i][j]=sm[i][j].isEmpty()?0:sm[i][j].charAt(0); } return m; }
  static String __toOutput(int x){ return String.valueOf(x); }
  static String __toOutput(long x){ return String.valueOf(x); }
  static String __toOutput(double x){ return String.valueOf(x); }
  static String __toOutput(boolean x){ return x?"true":"false"; }
  static String __toOutput(String x){ return x == null ? "" : x; }
  static String __toOutput(char x){ return String.valueOf(x); }
  static String __toOutput(int[] a){ StringBuilder o=new StringBuilder("["); for(int i=0;i<a.length;i++){ if(i>0) o.append(","); o.append(a[i]); } o.append("]"); return o.toString(); }
  static String __toOutput(long[] a){ StringBuilder o=new StringBuilder("["); for(int i=0;i<a.length;i++){ if(i>0) o.append(","); o.append(a[i]); } o.append("]"); return o.toString(); }
  static String __toOutput(double[] a){ StringBuilder o=new StringBuilder("["); for(int i=0;i<a.length;i++){ if(i>0) o.append(","); o.append(a[i]); } o.append("]"); return o.toString(); }
  static String __toOutput(boolean[] a){ StringBuilder o=new StringBuilder("["); for(int i=0;i<a.length;i++){ if(i>0) o.append(","); o.append(a[i]?"true":"false"); } o.append("]"); return o.toString(); }
  static String __toOutput(String[] a){ StringBuilder o=new StringBuilder("["); for(int i=0;i<a.length;i++){ if(i>0) o.append(","); o.append("\\"").append(a[i]).append("\\""); } o.append("]"); return o.toString(); }
  static String __toOutput(int[][] m){ StringBuilder o=new StringBuilder("["); for(int i=0;i<m.length;i++){ if(i>0) o.append(","); o.append(__toOutput(m[i])); } o.append("]"); return o.toString(); }
  static String __toOutput(String[][] m){ StringBuilder o=new StringBuilder("["); for(int i=0;i<m.length;i++){ if(i>0) o.append(","); o.append(__toOutput(m[i])); } o.append("]"); return o.toString(); }
  static String __toOutput(char[][] m){ StringBuilder o=new StringBuilder("["); for(int i=0;i<m.length;i++){ if(i>0) o.append(","); o.append("["); for(int j=0;j<m[i].length;j++){ if(j>0) o.append(","); o.append("\\"").append(m[i][j]).append("\\""); } o.append("]"); } o.append("]"); return o.toString(); }
  static String __toOutput(java.util.List<?> l){
    StringBuilder o=new StringBuilder("[");
    for(int i=0;i<l.size();i++){ if(i>0) o.append(",");
      Object e=l.get(i);
      if(e instanceof java.util.List) o.append(__toOutput((java.util.List<?>)e));
      else if(e instanceof int[]) o.append(__toOutput((int[])e));
      else if(e instanceof String[]) o.append(__toOutput((String[])e));
      else if(e instanceof Integer||e instanceof Long||e instanceof Double||e instanceof Boolean) o.append(String.valueOf(e).toLowerCase().equals("true")||String.valueOf(e).toLowerCase().equals("false")?String.valueOf(e).toLowerCase():String.valueOf(e));
      else if(e instanceof String) o.append("\\"").append(e).append("\\"");
      else o.append(String.valueOf(e));
    }
    o.append("]"); return o.toString();
  }
`;

const javaBaseType = (t) => (t || "").replace(/\s+/g, " ").trim();

const javaParseExpr = (type, valExpr) => {
  const n = javaBaseType(type).replace(/java\.lang\./g, "").replace(/java\.util\./g, "");
  if (n === "int" || n === "Integer") return `__parseInt(${valExpr})`;
  if (n === "long" || n === "Long") return `__parseLong(${valExpr})`;
  if (n === "double" || n === "float" || n === "Double" || n === "Float") return `__parseDouble(${valExpr})`;
  if (n === "boolean" || n === "Boolean") return `__parseBool(${valExpr})`;
  if (n === "String") return `__parseString(${valExpr})`;
  if (n === "char" || n === "Character") return `__parseString(${valExpr}).charAt(0)`;
  if (n === "int[]") return `__parseIntArray(${valExpr})`;
  if (n === "long[]") return `__parseLongArray(${valExpr})`;
  if (n === "double[]" || n === "float[]") return `__parseDoubleArray(${valExpr})`;
  if (n === "boolean[]") return `__parseBoolArray(${valExpr})`;
  if (n === "String[]") return `__parseStringArray(${valExpr})`;
  if (n === "int[][]") return `__parseInt2D(${valExpr})`;
  if (n === "String[][]") return `__parseString2D(${valExpr})`;
  if (n === "char[][]") return `__parseChar2D(${valExpr})`;
  return null;
};

const JAVA_SUPPORTED_RET = new Set([
  "void", "int", "Integer", "long", "Long", "double", "float", "Double", "Float",
  "boolean", "Boolean", "String", "char", "Character",
  "int[]", "long[]", "double[]", "float[]", "boolean[]", "String[]",
  "int[][]", "String[][]", "char[][]",
]);

const buildJavaDriver = (code) => {
  if (/public\s+static\s+void\s+main\s*\(/.test(code)) return code; // full program
  const sig = parseJavaSignature(code);
  if (!sig) {
    throw judgeError(
      "Could not find a Solution method to run. Write your logic as a method inside 'class Solution' (e.g. 'public int[] twoSum(...)') or provide a full program with 'public static void main'.",
      null,
      400
    );
  }
  if (sig.unsupported) {
    throw judgeError(
      `Java auto-runner does not support this ${sig.unsupported}. This problem needs a custom runner — JavaScript is supported, or write a full program with 'public static void main' that reads stdin and prints the answer.`,
      null,
      400
    );
  }
  if (UNSUPPORTED_TYPE_RE.test(`${sig.returnType} ${sig.params.map((p) => p.type).join(" ")}`)) {
    throw judgeError(
      "Java auto-runner does not support tree / linked-list / graph node types yet. JavaScript is supported for these problems, or write a full program with 'public static void main'.",
      null,
      400
    );
  }
  const normalizedRet = sig.returnType.replace(/java\.util\./g, "").replace(/\s+/g, "");
  if (/List|ArrayList|Map|HashMap|Set|Tree/.test(sig.returnType) && !/List<List<(Integer|String)>>/.test(normalizedRet)) {
    throw judgeError(
      `Java auto-runner does not support return type '${sig.returnType}' yet (supported List: List<List<Integer>>, List<List<String>>). Use JavaScript or a full program with main.`,
      null,
      400
    );
  }
  const decls = [];
  const args = [];
  sig.params.forEach((p, i) => {
    const expr = javaParseExpr(p.type, `vals.get(${i})`);
    if (!expr) {
      throw judgeError(
        `Java auto-runner does not support parameter type '${p.type}'. Supported: int, long, double, boolean, String, char, int[]/String[]/..., int[][]/String[][]/char[][].`,
        null,
        400
      );
    }
    decls.push(`    ${p.type} __p${i} = ${expr};`);
    args.push(`__p${i}`);
  });
  const isVoid = sig.returnType.trim() === "void";
  if (!isVoid && !JAVA_SUPPORTED_RET.has(sig.returnType.trim()) && !/^List<List<(Integer|String)>>$/.test(normalizedRet) && !/^java\.util\.List<java\.util\.List<(Integer|String)>>$/.test(sig.returnType.replace(/\s+/g, ""))) {
    throw judgeError(
      `Java auto-runner does not support return type '${sig.returnType}'.`,
      null,
      400
    );
  }
  let voidPrint = `System.out.print("");`;
  if (isVoid) {
    const idx = sig.params.findIndex((p) => /\[\]/.test(p.type));
    if (idx !== -1) voidPrint = `System.out.print(__toOutput(__p${idx}));`;
  }
  const call = `sol.${sig.name}(${args.join(", ")})`;
  const mainBody = isVoid
    ? `    Solution sol = new Solution();\n    ${call};\n    ${voidPrint}`
    : `    Solution sol = new Solution();\n    System.out.print(__toOutput(${call}));`;
  const hasImport = /import\s+java\.util\./.test(code);
  return `${hasImport ? "" : "import java.util.*;\n"}${code}\npublic class Main {\n${JAVA_HELPERS}\n  public static void main(String[] args) throws Exception {\n    java.util.Scanner sc = new java.util.Scanner(System.in);\n    StringBuilder sb = new StringBuilder();\n    while(sc.hasNextLine()){ sb.append(sc.nextLine()); }\n    String raw = sb.toString().trim();\n    java.util.List<String> vals = __extractValues(raw);\n    if(vals.size() < ${sig.params.length}){ System.out.print(""); return; }\n${decls.join("\n")}\n${mainBody}\n  }\n}`;
};

/**
 * Prepares user code for execution by injecting the hidden runner/driver
 * if the user wrote a pure LeetCode-style solution function/class without I/O boilerplate.
 */
const prepareExecutableCode = (code, language) => {
  if (!code) return code;
  const normalized = normalizeLanguage(language);
  if (!normalized) {
    throw judgeError(
      `Unsupported language '${language}'. Supported languages: javascript, c++, java.`,
      null,
      400
    );
  }

  if (normalized === "javascript") {
    // If the code already has manual stdin reader, pass through directly
    if (code.includes("readFileSync") || code.includes("require('fs')")) {
      return code;
    }

    // Pick the entry function: `solve` wins, then `class Solution`,
    // otherwise the first top-level function (e.g. `twoSum(nums, target)`).
    let entryCall = null; // JS expression resolving to the function to call
    if (/(?:function\s+solve\s*\(|(?:const|let|var)\s+solve\s*=)/.test(code)) {
      entryCall = "solve";
    } else if (/class\s+Solution\b/.test(code)) {
      entryCall = "__solutionFn()";
    } else {
      const fnMatch =
        code.match(/(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/) ||
        code.match(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(/);
      if (fnMatch) entryCall = fnMatch[1];
    }
    if (!entryCall) {
      throw judgeError(
        "Could not find a function to run. Define `function solve(input)`, a `class Solution` method, or a named function like `function twoSum(nums, target)`.",
        null,
        400
      );
    }

    // Wrap with hidden driver
    return `
const fs = require('fs');
const __rawInput = fs.readFileSync(0, 'utf8').trim();
let input;
try {
  input = JSON.parse(__rawInput);
} catch (e) {
  input = __rawInput;
}

// User Code
${code}

// Execution Driver
// Supports both styles:
//   function solve(input) {...}            -> called with the parsed object
//   function twoSum(nums, target) {...}     -> args matched by param name,
//                                            falling back to object values
//   class Solution { twoSum(nums, target) } -> same, via first method
const __callWithInput = (fn) => {
  if (typeof fn !== 'function') return undefined;
  if (fn.length <= 1 || input === null || typeof input !== 'object' || Array.isArray(input)) {
    return fn(input);
  }
  let names = [];
  try {
    const src = Function.prototype.toString.call(fn);
    const m = src.match(/^[^(]*\(([^)]*)\)/) || src.match(/^\s*\(?([^)]*?)\)?\s*=>/);
    if (m) {
      names = m[1].split(',').map(s => s.trim()).filter(Boolean).map(s => {
        const mm = s.match(/^([A-Za-z_$][\w$]*)/);
        return mm ? mm[1] : '';
      }).filter(Boolean);
    }
  } catch (e) { names = []; }
  let args;
  if (names.length > 0 && names.every(n => n in input)) {
    args = names.map(n => input[n]);
  } else {
    args = Object.values(input);
  }
  return fn(...args);
};
const __printRes = (__res) => {
  if (__res !== undefined) {
    console.log(typeof __res === 'object' ? JSON.stringify(__res) : __res);
  }
};
const __solutionFn = () => {
  if (typeof Solution === 'undefined') return null;
  const __inst = new Solution();
  const __methods = Object.getOwnPropertyNames(Solution.prototype).filter(m => m !== 'constructor');
  if (__methods.length > 0 && typeof __inst[__methods[0]] === 'function') {
    return __inst[__methods[0]].bind(__inst);
  }
  return null;
};
const __entry = (typeof ${entryCall} !== 'undefined' && ${entryCall} instanceof Function) ? ${entryCall} : __solutionFn();
if (typeof __entry === 'function') {
  __printRes(__callWithInput(__entry));
}
`;
  }

  if (normalized === "c++") return buildCppDriver(code);
  if (normalized === "java") return buildJavaDriver(code);

  return code;
};

module.exports = { getLanguageById, normalizeLanguage, submitBatch, submitToken, prepareExecutableCode };
