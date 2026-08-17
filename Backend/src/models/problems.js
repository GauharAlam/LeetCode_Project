const mongoose = require("mongoose");
const { Schema } = mongoose;

const problemSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  tags: [
    {
      type: String,
      enum: [
        "array",
        "string",
        "math",
        "dp",
        "greedy",
        "prefix-sum",
        "hashmap",
        "graph",
        "matrix",
        "dfs",
        "stack",
        "tree",
        "linked-list",
        "heap",
        "binary-search",
        "sliding-window",
        "two-pointers",
        "recursion",
        "backtracking",
        "bit-manipulation",
        "trie",
        "queue",
        "union-find",
        "intervals",
      ],
      required: true,
    },
  ],
  companies: [
    {
      type: String,
      enum: [
        "google",
        "amazon",
        "meta",
        "microsoft",
        "apple",
        "netflix",
        "uber",
        "airbnb",
        "linkedin",
        "twitter",
        "spotify",
        "oracle",
        "salesforce",
        "adobe",
        "nvidia",
        "stripe",
        "coinbase",
        "other"
      ],
    },
  ],
  visibleTestCases: [
    {
      input: {
        type: String,
        required: true,
      },
      output: {
        type: String,
        required: true,
      },
      explanation: {
        type: String,
        required: true,
      },
    },
  ],

  hiddenTestCases: [
    {
      input: {
        type: String,
        required: true,
      },
      output: {
        type: String,
        required: true,
      },
      explanation: {
        type: String,
        required: true,
      },
    },
  ],

  startCode: [
    {
      language: {
        type: String,
        required: true,
      },
      initialCode: {
        type: String,
        required: true,
      },
    },
  ],

  referenceSolution: [
    {
      language: {
        type: String,
        required: true,
      },
      completeCode: {
        type: String,
        required: true,
      },
    },
  ],
  hints: [
    {
      type: String,
    },
  ],
  acceptedCount: {
    type: Number,
    default: 0,
  },
  submissionCount: {
    type: Number,
    default: 0,
  },
  constraints: {
    type: String,
  },
  editorial: {
    type: String,
    default: "",
  },
  problemCreator: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
}, { timestamps: true });

const Problem = mongoose.model("Problem", problemSchema);
module.exports = Problem;
