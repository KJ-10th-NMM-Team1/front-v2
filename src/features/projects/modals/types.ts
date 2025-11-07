export type SourceSelectionResult = {
  mode: 'youtube' | 'file'
  youtubeUrl?: string
  file?: File
}

export type ProjectCreationDraft = {
  sourceType: 'youtube' | 'file'
  youtubeUrl?: string
  file?: File
  fileName?: string
  fileSize?: number
  title: string
  detectAutomatically: boolean
  sourceLanguage: string
  targetLanguages: string[]
  speakerCount: number
}
