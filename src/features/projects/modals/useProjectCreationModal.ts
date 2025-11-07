import { useEffect, useMemo, useState } from 'react'

import { uploadFile } from '@/features/projects/api/storageApi'
import { useCreateProjectMutation } from '@/features/projects/hooks/useProjects'
import {
  useFinalizeUploadMutation,
  usePrepareUploadMutation,
  useRegisterYoutubeSourceMutation,
} from '@/features/projects/hooks/useProjectStorage'
import { trackEvent } from '@/shared/lib/analytics'
import { useUiStore } from '@/shared/store/useUiStore'

import type { AutoDubbingSettingsValues } from './steps/AutoDubbingSettingsStep'
import type { ProjectCreationDraft, SourceSelectionResult } from './types'

const createInitialDraft = (): ProjectCreationDraft => ({
  sourceType: 'file',
  title: '',
  detectAutomatically: true,
  sourceLanguage: '한국어',
  targetLanguages: [],
  speakerCount: 2,
})

export function useProjectCreationModal() {
  const { projectCreation, closeProjectCreation, setProjectCreationStep } = useUiStore((state) => ({
    projectCreation: state.projectCreation,
    closeProjectCreation: state.closeProjectCreation,
    setProjectCreationStep: state.setProjectCreationStep,
  }))

  const createProjectMutation = useCreateProjectMutation()
  const prepareUploadMutation = usePrepareUploadMutation()
  const finalizeUploadMutation = useFinalizeUploadMutation()
  const registerYoutubeSourceMutation = useRegisterYoutubeSourceMutation()

  const [draft, setDraft] = useState<ProjectCreationDraft>(() => createInitialDraft())

  useEffect(() => {
    if (!projectCreation.open) {
      setDraft(createInitialDraft())
    }
  }, [projectCreation.open])

  const isSourceStep = projectCreation.step === 'source'
  const isDetailsStep = projectCreation.step === 'details'

  const recentUploadSummary = useMemo(() => {
    if (!draft.fileName) return null
    const sizeMb = draft.fileSize ? (draft.fileSize / (1024 * 1024)).toFixed(1) : '0'
    return `${draft.fileName} • ${sizeMb}MB`
  }, [draft.fileName, draft.fileSize])

  const showToast = useUiStore((state) => state.showToast)
  const handleFileUpload = async (projectId: string, file: File) => {
    const { upload_url, fields, object_key } = await prepareUploadMutation.mutateAsync({
      projectId,
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
    })
    await uploadFile({
      uploadUrl: upload_url,
      fields,
      file,
    })
    await finalizeUploadMutation.mutateAsync({
      projectId,
      objectKey: object_key,
    })

    closeProjectCreation()
    showToast({
      id: 'example-create-success',
      title: '프로젝트 생성 완료',
      autoDismiss: 2500,
    })
  }

  const handleRegisterYoutube = async (projectId: string, draft: ProjectCreationDraft) => {
    await registerYoutubeSourceMutation.mutateAsync({
      projectId,
      youtubeUrl: draft.youtubeUrl as string,
    })

    closeProjectCreation()
    showToast({
      id: 'example-create-success',
      title: '프로젝트 생성 완료',
      autoDismiss: 2500,
    })
  }

  const handleSourceSubmit = (values: SourceSelectionResult) => {
    setDraft((prev) => ({
      ...prev,
      sourceType: values.mode,
      youtubeUrl: values.mode === 'youtube' ? values.youtubeUrl : undefined,
      file: values.mode === 'file' ? values.file : undefined,
      fileName: values.mode === 'file' ? (values.file?.name ?? prev.fileName) : undefined,
      fileSize: values.mode === 'file' ? (values.file?.size ?? prev.fileSize) : undefined,
    }))

    trackEvent('proj_source_ready', { mode: values.mode })
    setProjectCreationStep('details')
  }

  const handleDetailsSubmit = (values: AutoDubbingSettingsValues) => {
    const nextDraft: ProjectCreationDraft = {
      ...draft,
      title: values.title,
      detectAutomatically: values.detectAutomatically,
      sourceLanguage: values.sourceLanguage,
      targetLanguages: values.targetLanguages,
      speakerCount: values.speakerCount,
    }
    setDraft(nextDraft)

    createProjectMutation.mutate(
      { ...nextDraft, owner_code: 'temp' },
      {
        onSuccess(project) {
          const projectId = project.project_id
          if (nextDraft.sourceType === 'file') {
            const fileToUpload = nextDraft.file
            if (!fileToUpload) return
            void handleFileUpload(projectId, fileToUpload)
          } else if (nextDraft.sourceType === 'youtube') {
            void handleRegisterYoutube(projectId, nextDraft)
          }
        },
      },
    )

    trackEvent('proj_creation_complete', {
      title: values.title,
      targets: values.targetLanguages,
    })
  }

  const handleBackToSource = () => setProjectCreationStep('source')

  return {
    projectCreation,
    closeProjectCreation,
    isSourceStep,
    isDetailsStep,
    draft,
    recentUploadSummary,
    handleSourceSubmit,
    handleDetailsSubmit,
    handleBackToSource,
  }
}
