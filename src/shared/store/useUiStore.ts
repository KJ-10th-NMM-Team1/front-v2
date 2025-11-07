import { toast } from 'sonner'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type ToastPayload = {
  id?: string
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  autoDismiss?: number
}

type ProjectCreationStep = 'upload' | 'settings-a' | 'settings-b'

type UiState = {
  showToast: (toast: ToastPayload) => void
  dismissToast: (id: string) => void
  projectCreation: {
    open: boolean
    step: ProjectCreationStep
  }
  openProjectCreation: (step?: ProjectCreationStep) => void
  closeProjectCreation: () => void
  setProjectCreationStep: (step: ProjectCreationStep) => void
}

export const useUiStore = create<UiState>()(
  devtools((set) => ({
    showToast: ({ id, title, description, actionLabel, onAction, autoDismiss }) => {
      toast(title ?? '알림', {
        id,
        description,
        duration: autoDismiss ?? 3500,
        action:
          actionLabel && onAction
            ? {
                label: actionLabel,
                onClick: onAction,
              }
            : undefined,
      })
    },
    dismissToast: (id) => {
      toast.dismiss(id)
    },
    projectCreation: {
      open: false,
      step: 'upload',
    },
    openProjectCreation: (step = 'upload') =>
      set(
        {
          projectCreation: {
            open: true,
            step,
          },
        },
        false,
        { type: 'ui/openProjectCreation' },
      ),
    closeProjectCreation: () =>
      set(
        {
          projectCreation: {
            open: false,
            step: 'upload',
          },
        },
        false,
        { type: 'ui/closeProjectCreation' },
      ),
    setProjectCreationStep: (step) =>
      set(
        (state) => ({
          projectCreation: {
            ...state.projectCreation,
            step,
          },
        }),
        false,
        { type: 'ui/setProjectCreationStep', payload: step },
      ),
  })),
)

export type { ProjectCreationStep, ToastPayload }
