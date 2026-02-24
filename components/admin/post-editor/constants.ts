export const CTA_TEMPLATES_KEY = 'post-editor-cta-templates-v1'
export const BLOCK_TEMPLATES_KEY = 'post-editor-block-templates-v1'
export const BLOCKS_PANEL_COLLAPSED_KEY = 'post-editor-blocks-panel-collapsed-v1'
export const BLOCK_TEMPLATES_PANEL_COLLAPSED_KEY = 'post-editor-block-templates-panel-collapsed-v1'

export const DEFAULT_CTA_TITLE = 'Need help with IELTS or PTE?'
export const DEFAULT_CTA_DESCRIPTION = 'Leave your contact and we will reach out shortly.'
export const DEFAULT_CTA_SUBMIT_LABEL = 'Get Free Consultation'
export const DEFAULT_CTA_SOURCE = 'blog-cta'

export const DEFAULT_EMAIL_WRITING_TITLE = 'Email Writing Practice'
export const DEFAULT_EMAIL_WRITING_SUBMIT_LABEL = 'Submit response'
export const DEFAULT_EMAIL_WRITING_SUCCESS_MESSAGE = 'Thanks. Your response has been submitted.'
export const DEFAULT_EMAIL_WRITING_SOURCE = 'blog-email-writing'
export const DEFAULT_EMAIL_WRITING_PLACEHOLDER = 'Write your email response here...'

export const BLOCK_TYPE_MAP: Record<string, string> = {
  mcq: 'mcq',
  audio: 'audio',
  fill: 'fill_gaps',
  dropdown: 'dropdown_gaps',
  truefalse: 'true_false',
  matching: 'matching',
  cta: 'cta',
  emailwriting: 'email_writing',
  missingletters: 'missing_letters',
  dragsentence: 'drag_sentence',
  collapsible: 'collapsible',
}

export const BLOCK_TYPE_TO_MODAL: Record<string, string> = {
  mcq: 'mcq',
  audio: 'audio',
  fill_gaps: 'fill',
  dropdown_gaps: 'dropdown',
  true_false: 'truefalse',
  matching: 'matching',
  cta: 'cta',
  email_writing: 'emailwriting',
  missing_letters: 'missingletters',
  drag_sentence: 'dragsentence',
  collapsible: 'collapsible',
}
