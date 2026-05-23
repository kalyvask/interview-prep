"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  type Dispatch,
} from "react";
import type {
  InterviewSession,
  SessionConfig,
  Question,
  UserAnswer,
  Evaluation,
  AnswerMode,
  SessionStatus,
  MCOption,
  FollowUpTurn,
  LoopState,
  ConsistencyReport,
} from "@/types";

const initialState: InterviewSession = {
  config: { mode: "standard", questionCount: 5 },
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  evaluations: {},
  followUps: {},
  answerMode: "freetext",
  mcOptions: {},
  status: "setup",
  isLoading: false,
  error: null,
};

type Action =
  | { type: "SET_CONFIG"; payload: SessionConfig }
  | { type: "SET_QUESTIONS"; payload: Question[] }
  | { type: "SET_ANSWER_MODE"; payload: AnswerMode }
  | { type: "SUBMIT_ANSWER"; payload: { questionId: string; answer: UserAnswer } }
  | { type: "SET_EVALUATION"; payload: { questionId: string; evaluation: Evaluation } }
  | { type: "SET_MC_OPTIONS"; payload: { questionId: string; options: MCOption[] } }
  | { type: "APPEND_FOLLOW_UP"; payload: { questionId: string; turn: FollowUpTurn } }
  | { type: "SET_FOLLOW_UP_ANSWER"; payload: { questionId: string; turnId: string; answer: string } }
  | { type: "INIT_LOOP"; payload: LoopState }
  | { type: "ADVANCE_LOOP_ROUND" }
  | { type: "SET_CONSISTENCY"; payload: ConsistencyReport }
  | { type: "NEXT_QUESTION" }
  | { type: "SET_STATUS"; payload: SessionStatus }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET" };

function reducer(state: InterviewSession, action: Action): InterviewSession {
  switch (action.type) {
    case "SET_CONFIG":
      return { ...state, config: action.payload };
    case "SET_QUESTIONS":
      return { ...state, questions: action.payload, currentQuestionIndex: 0, status: "active" };
    case "SET_ANSWER_MODE":
      return { ...state, answerMode: action.payload };
    case "SUBMIT_ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.payload.questionId]: action.payload.answer },
        status: "reviewing",
      };
    case "SET_EVALUATION":
      return {
        ...state,
        evaluations: {
          ...state.evaluations,
          [action.payload.questionId]: action.payload.evaluation,
        },
      };
    case "SET_MC_OPTIONS":
      return {
        ...state,
        mcOptions: {
          ...state.mcOptions,
          [action.payload.questionId]: action.payload.options,
        },
      };
    case "APPEND_FOLLOW_UP": {
      const existing = state.followUps[action.payload.questionId] || [];
      return {
        ...state,
        followUps: {
          ...state.followUps,
          [action.payload.questionId]: [...existing, action.payload.turn],
        },
      };
    }
    case "SET_FOLLOW_UP_ANSWER": {
      const turns = state.followUps[action.payload.questionId] || [];
      return {
        ...state,
        followUps: {
          ...state.followUps,
          [action.payload.questionId]: turns.map((t) =>
            t.id === action.payload.turnId ? { ...t, answer: action.payload.answer } : t,
          ),
        },
      };
    }
    case "INIT_LOOP":
      return { ...state, loop: action.payload };
    case "ADVANCE_LOOP_ROUND": {
      if (!state.loop) return state;
      const nextIdx = state.loop.currentRoundIndex + 1;
      return {
        ...state,
        loop: { ...state.loop, currentRoundIndex: nextIdx },
      };
    }
    case "SET_CONSISTENCY": {
      if (!state.loop) return state;
      return { ...state, loop: { ...state.loop, consistency: action.payload } };
    }
    case "NEXT_QUESTION": {
      const nextIndex = state.currentQuestionIndex + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, status: "complete" };
      }
      return {
        ...state,
        currentQuestionIndex: nextIndex,
        status: "active",
        answerMode: "freetext",
      };
    }
    case "SET_STATUS":
      return { ...state, status: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const InterviewContext = createContext<{
  state: InterviewSession;
  dispatch: Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

const STORAGE_KEY = "interview-session";

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    if (typeof window === "undefined") return initialState;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as InterviewSession;
        // Reset transient state; default new fields if loading from older snapshot
        return {
          ...parsed,
          followUps: parsed.followUps || {},
          isLoading: false,
          error: null,
        };
      }
    } catch {
      // ignore parse errors
    }
    return initialState;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  return (
    <InterviewContext.Provider value={{ state, dispatch }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterview must be used within InterviewProvider");
  }
  return context;
}
