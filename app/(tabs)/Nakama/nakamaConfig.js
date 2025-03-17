// src/config/nakamaConfig.js
export const NAKAMA_SERVER_KEY = "defaultkey";
export const NAKAMA_HOST = "35.200.219.93";
export const NAKAMA_PORT = "7350";
export const NAKAMA_USE_SSL = false;

export const SUBJECT_TYPES = {
  MATH: "math",
  SCIENCE: "science",
  HISTORY: "history",
  GENERAL: "general"
};

export const AGE_GROUPS = {
  KIDS: "8-12",
  TEEN: "13-17",
  ADULT: "18+"
};

// Sample questions data structure
export const QUESTIONS = {
  [SUBJECT_TYPES.MATH]: {
    [AGE_GROUPS.TEEN]: [
      {
        id: 1,
        question: "What is the value of π (pi) to two decimal places?",
        options: ["3.10", "3.14", "3.16", "3.18"],
        correctAnswer: 1, // Index of correct answer (0-based)
        timeLimit: 30 // seconds
      },
      {
        id: 2,
        question: "What is the square root of 144?",
        options: ["10", "12", "14", "16"],
        correctAnswer: 1,
        timeLimit: 30
      },
      {
        id: 3,
        question: "If x + 2y = 10 and x - y = 1, what is the value of y?",
        options: ["2", "3", "4", "5"],
        correctAnswer: 1,
        timeLimit: 30
      },
      {
        id: 4,
        question: "What is the sum of the angles in a triangle?",
        options: ["90°", "180°", "270°", "360°"],
        correctAnswer: 1,
        timeLimit: 30
      },
      {
        id: 5,
        question: "What is 25% of 80?",
        options: ["15", "20", "25", "30"],
        correctAnswer: 1,
        timeLimit: 30
      }
    ]
  },
  [SUBJECT_TYPES.SCIENCE]: {
    [AGE_GROUPS.TEEN]: [
      {
        id: 1,
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gl", "Au", "Ag"],
        correctAnswer: 2,
        timeLimit: 30
      },
      {
        id: 2,
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1,
        timeLimit: 30
      },
      {
        id: 3,
        question: "What is the hardest natural substance on Earth?",
        options: ["Platinum", "Iron", "Gold", "Diamond"],
        correctAnswer: 3,
        timeLimit: 30
      },
      {
        id: 4,
        question: "Which gas do plants absorb from the atmosphere?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
        correctAnswer: 1,
        timeLimit: 30
      },
      {
        id: 5,
        question: "What is the largest organ in the human body?",
        options: ["Heart", "Liver", "Skin", "Brain"],
        correctAnswer: 2,
        timeLimit: 30
      }
    ]
  }
};