export type TOEFLTestSection = 'listening' | 'structure' | 'reading';

export interface TOEFLParticipant {
  id: string; // uuid
  name: string;
  email: string;
  created_at: string;
}

export interface TOEFLAttempt {
  id: string; // uuid
  participant_id: string;
  section: TOEFLTestSection;
  started_at: string;
  completed_at: string | null;
  score: number | null;
  total: number | null;
  answers: Record<string, string | number>; // question_id -> answer
}

// Typing structure for hardcoded test templates

export interface ListeningQuestion {
  id: string;
  text?: string;
  audioUrl?: string; // Part A questions have individual audio
  options: string[];
  correctAnswerIndex: number;
}

export interface ListeningPassage {
  id: string;
  audioUrl: string; // Audio for Part B/C passages
  questions: {
    id: string;
    text: string;
    options: string[];
    correctAnswerIndex: number;
  }[];
}

export interface StructureQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface ReadingQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface ReadingPassage {
  id: string;
  title: string;
  content: string; // HTML allowed
  questions: ReadingQuestion[];
}

export interface TOEFLListeningTest {
  title: string;
  durationMinutes: number;
  parts: {
    A: {
      instructions: string;
      questions: ListeningQuestion[];
    };
    B: {
      instructions: string;
      passages: ListeningPassage[];
    };
    C: {
      instructions: string;
      passages: ListeningPassage[];
    };
  };
}

export interface TOEFLStructureTest {
  title: string;
  durationMinutes: number;
  parts: {
    A: {
      instructions: string;
      questions: StructureQuestion[];
    };
    B: {
      instructions: string;
      questions: StructureQuestion[];
    };
  };
}

export interface TOEFLReadingTest {
  title: string;
  durationMinutes: number;
  instructions: string;
  passages: ReadingPassage[];
}

export type TOEFLTestTemplate =
  | { type: 'listening'; test: TOEFLListeningTest }
  | { type: 'structure'; test: TOEFLStructureTest }
  | { type: 'reading'; test: TOEFLReadingTest };
