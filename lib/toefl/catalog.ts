import {
  TOEFLListeningTest,
  TOEFLReadingTest,
  TOEFLStructureTest,
  TOEFLTestSection,
  TOEFLTestTemplate,
} from './types'

export const TOEFL_SECTIONS: TOEFLTestSection[] = ['listening', 'structure', 'reading']

export const TOEFL_SECTION_LABELS: Record<TOEFLTestSection, string> = {
  listening: 'Listening',
  structure: 'Structure',
  reading: 'Reading',
}

export function isTOEFLSection(value: string): value is TOEFLTestSection {
  return TOEFL_SECTIONS.includes(value as TOEFLTestSection)
}

export function normalizeTemplateData(
  section: TOEFLTestSection,
  rawTestData: unknown,
): TOEFLListeningTest | TOEFLStructureTest | TOEFLReadingTest | null {
  if (!rawTestData || typeof rawTestData !== 'object') {
    return null
  }

  const candidate = rawTestData as Record<string, unknown>

  if ('title' in candidate) {
    return rawTestData as TOEFLListeningTest | TOEFLStructureTest | TOEFLReadingTest
  }

  if (
    candidate.type === section &&
    'test' in candidate &&
    candidate.test &&
    typeof candidate.test === 'object'
  ) {
    return candidate.test as TOEFLListeningTest | TOEFLStructureTest | TOEFLReadingTest
  }

  return null
}

export function toTemplate(
  section: TOEFLTestSection,
  rawTestData: unknown,
): TOEFLTestTemplate | null {
  const normalized = normalizeTemplateData(section, rawTestData)
  if (!normalized) return null

  return {
    type: section,
    test: normalized,
  } as TOEFLTestTemplate
}

export function calculateScore(
  answers: Record<string, number>,
  template: TOEFLTestTemplate,
) {
  let score = 0
  let total = 0

  if (template.type === 'listening') {
    template.test.parts.A.questions.forEach((q) => {
      total += 1
      if (answers[q.id] === q.correctAnswerIndex) score += 1
    })
    template.test.parts.B.passages.forEach((passage) => {
      passage.questions.forEach((q) => {
        total += 1
        if (answers[q.id] === q.correctAnswerIndex) score += 1
      })
    })
    template.test.parts.C.passages.forEach((passage) => {
      passage.questions.forEach((q) => {
        total += 1
        if (answers[q.id] === q.correctAnswerIndex) score += 1
      })
    })
  }

  if (template.type === 'structure') {
    template.test.parts.A.questions.forEach((q) => {
      total += 1
      if (answers[q.id] === q.correctAnswerIndex) score += 1
    })
    template.test.parts.B.questions.forEach((q) => {
      total += 1
      if (answers[q.id] === q.correctAnswerIndex) score += 1
    })
  }

  if (template.type === 'reading') {
    template.test.passages.forEach((passage) => {
      passage.questions.forEach((q) => {
        total += 1
        if (answers[q.id] === q.correctAnswerIndex) score += 1
      })
    })
  }

  return { score, total }
}
