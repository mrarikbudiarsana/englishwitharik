import { TOEFLTestTemplate } from './types'

export const toeflTemplate: Record<string, TOEFLTestTemplate> = {
  listening: {
    type: 'listening',
    test: {
      title: "Listening Comprehension",
      durationMinutes: 35,
      parts: {
        A: {
          instructions: "In Part A, you will hear short conversations between two people. After each conversation, you will hear a question about the conversation. The conversations and questions will not be repeated. After you hear a question, read the four possible answers and choose the best answer.",
          questions: [
            {
              id: "l-a-1",
              text: "What does the man imply?",
              audioUrl: "https://example.com/audio/q1.mp3",
              options: [
                "A) He is not sure what to do.",
                "B) He wants to go to the movie.",
                "C) He thinks it is a good idea.",
                "D) He doesn't like the movie."
              ],
              correctAnswerIndex: 1
            }
          ]
        },
        B: {
          instructions: "In Part B, you will hear longer conversations. After each conversation, you will hear several questions. The conversations and questions will not be repeated. After you hear a question, read the four possible answers and choose the best answer.",
          passages: [
            {
              id: "l-b-passage-1",
              audioUrl: "https://example.com/audio/part-b-conversation-1.mp3",
              questions: [
                {
                  id: "l-b-31",
                  text: "What are the speakers mainly discussing?",
                  options: [
                    "A) A new class schedule.",
                    "B) A change in graduation requirements.",
                    "C) The difficulty of a course.",
                    "D) A new professor."
                  ],
                  correctAnswerIndex: 0
                }
              ]
            }
          ]
        },
        C: {
          instructions: "In Part C, you will hear several talks. After each talk, you will hear some questions. The talks and questions will not be repeated. After you hear a question, read the four possible answers and choose the best answer.",
          passages: [
            {
              id: "l-c-passage-1",
              audioUrl: "https://example.com/audio/part-c-talk-1.mp3",
              questions: [
                {
                  id: "l-c-39",
                  text: "What is the main topic of the talk?",
                  options: [
                    "A) The history of printing.",
                    "B) The invention of the telegraph.",
                    "C) How the internet works.",
                    "D) Early communication methods."
                  ],
                  correctAnswerIndex: 3
                }
              ]
            }
          ]
        }
      }
    }
  },
  structure: {
    type: 'structure',
    test: {
      title: "Structure and Written Expression",
      durationMinutes: 25,
      parts: {
        A: {
          instructions: "Questions 1-15 are incomplete sentences. Beneath each sentence you will see four words or phrases, marked (A), (B), (C), and (D). Choose the one word or phrase that best completes the sentence.",
          questions: [
            {
              id: "s-a-1",
              text: "The committee _____ its decision tomorrow.",
              options: [
                "A) will announce",
                "B) announces",
                "C) announced",
                "D) is announcing"
              ],
              correctAnswerIndex: 0
            }
          ]
        },
        B: {
          instructions: "In questions 16-40, each sentence has four underlined words or phrases. The four underlined parts of the sentence are marked (A), (B), (C), and (D). Identify the one underlined word or phrase that must be changed in order for the sentence to be correct.",
          questions: [
            {
              id: "s-b-16",
              text: "The [A]childrens[/A] were playing [B]happily[/B] in the [C]park[/C] when it [D]started[/D] to rain.",
              options: [
                "A) childrens",
                "B) happily",
                "C) park",
                "D) started"
              ],
              correctAnswerIndex: 0
            }
          ]
        }
      }
    }
  },
  reading: {
    type: 'reading',
    test: {
      title: "Reading Comprehension",
      durationMinutes: 55,
      instructions: "In this section you will read several passages. Each one is followed by a number of questions about it. You are to choose the one best answer, (A), (B), (C), or (D), to each question.",
      passages: [
        {
          id: "r-passage-1",
          title: "The History of Chocolate",
          content: "<p>Chocolate has a long and fascinating history...</p><p>It was first cultivated by the Olmecs...</p>",
          questions: [
            {
              id: "r-1",
              text: "What is the main idea of the passage?",
              options: [
                "A) How to make chocolate.",
                "B) The health benefits of chocolate.",
                "C) The historical origins of chocolate.",
                "D) Where to buy the best chocolate."
              ],
              correctAnswerIndex: 2
            }
          ]
        }
      ]
    }
  }
}
