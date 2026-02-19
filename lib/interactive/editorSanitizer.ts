const INLINE_ACTION_ARTIFACT_PARAGRAPH = /<p[^>]*>\s*Edit\s*Duplicate\s*Up\s*Down\s*Delete\s*<\/p>/gi

export function sanitizeEditorArtifacts(html: string): string {
  if (!html) return html
  return html.replace(INLINE_ACTION_ARTIFACT_PARAGRAPH, '')
}
