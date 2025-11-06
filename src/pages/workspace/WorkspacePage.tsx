import { useEffect, useMemo } from 'react'

import { useSearchParams } from 'react-router-dom'

import { sampleGlossaries } from '../../entities/glossary/types'
import { sampleVoices } from '../../entities/voice-sample/types'
import { useProjects } from '../../features/projects/hooks/useProjects'
import { ProjectCreationModal } from '../../features/projects/modals/ProjectCreationModal'
import { useUiStore } from '../../shared/store/useUiStore'
import { Card, CardDescription, CardHeader, CardTitle } from '../../shared/ui/Card'
import { Spinner } from '../../shared/ui/Spinner'
import { ProjectList } from '../../widgets/project-list/ProjectList'
import { WorkspaceSideNav } from '../../widgets/sidenav/WorkspaceSideNav'
import { UploadCard } from '../../widgets/upload-card/UploadCard'

const stepMap = {
  upload: 'upload',
  settings: 'settings-a',
  assign: 'settings-b',
} as const

type WorkspaceSection = 'projects' | 'voice-samples' | 'glossary' | 'guide' | 'support'

export default function WorkspacePage() {
  const { data: projects = [], isLoading } = useProjects()
  const [searchParams, setSearchParams] = useSearchParams()
  const uiState = useUiStore((state) => ({
    open: state.projectCreation.open,
    step: state.projectCreation.step,
    openModal: state.openProjectCreation,
    setStep: state.setProjectCreationStep,
    close: state.closeProjectCreation,
  }))

  const stepParam = searchParams.get('create')
  const derivedStep = stepParam ? stepMap[stepParam as keyof typeof stepMap] : null
  const sectionParam = searchParams.get('section') as WorkspaceSection | null
  const section: WorkspaceSection = sectionParam ?? 'projects'

  const sectionCopy = useMemo<Record<WorkspaceSection, { title: string; description: string }>>(
    () => ({
      projects: {
        title: '나의 워크스페이스',
        description:
          '프로젝트 진행 현황을 확인하고 신규 워크플로를 생성하세요. 모든 데이터는 사용자 단위로 관리됩니다.',
      },
      'voice-samples': {
        title: '보이스 샘플',
        description:
          '언어·성별별 보이스 샘플을 관리하여 번역가와 스튜디오 팀이 일관된 음색을 유지할 수 있도록 합니다.',
      },
      glossary: {
        title: '번역 사전',
        description:
          '자주 사용하는 용어와 정의를 등록해 프로젝트 전반에 일관된 번역 품질을 보장하세요.',
      },
      guide: {
        title: '이용 가이드',
        description:
          '업로드부터 배포까지 파이프라인을 단계별로 확인하고, 팀 온보딩에 활용할 수 있는 문서를 제공합니다.',
      },
      support: {
        title: '문의',
        description:
          '궁금한 점이나 버그를 발견했다면 즉시 팀에 공유하세요. SLA 24시간 내 1차 응대를 약속합니다.',
      },
    }),
    [],
  )

  useEffect(() => {
    if (derivedStep) {
      uiState.openModal(derivedStep)
    }
  }, [derivedStep, uiState])

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (!uiState.open) {
        next.delete('create')
      } else {
        const currentKey = Object.entries(stepMap).find(([, value]) => value === uiState.step)?.[0]
        if (currentKey) {
          next.set('create', currentKey)
        }
      }
      return next
    })
  }, [uiState.open, uiState.step, setSearchParams])

  useEffect(() => {
    if (!stepParam) {
      uiState.close()
    }
  }, [stepParam, uiState])

  useEffect(() => {
    if (!sectionParam) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set('section', 'projects')
        return next
      })
    }
  }, [sectionParam, setSearchParams])

  const renderSection = () => {
    switch (section) {
      case 'projects':
        return (
          <>
            <UploadCard />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-foreground text-xl font-semibold">최근 프로젝트</h2>
                <span className="text-muted text-xs">자동 더빙 진행률이 표시됩니다.</span>
              </div>
              {isLoading ? (
                <div className="border-surface-3 bg-surface-1 flex items-center justify-center rounded-3xl border py-10">
                  <Spinner />
                  <span className="text-muted ml-3 text-sm">프로젝트 불러오는 중…</span>
                </div>
              ) : (
                <ProjectList projects={projects} />
              )}
            </div>
          </>
        )
      case 'voice-samples':
        return (
          <div className="space-y-6">
            <Card className="border-surface-4 bg-surface-1/80 border border-dashed p-6">
              <CardTitle>보이스 라이브러리</CardTitle>
              <CardDescription>
                각 언어와 음색에 맞는 샘플을 등록해 두면 프로젝트 생성 시 빠르게 할당할 수 있습니다.
                팀원들은 동일한 목록을 공유하며, 수정 이력은 활동 로그에 기록됩니다.
              </CardDescription>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              {sampleVoices.map((voice) => (
                <Card key={voice.id} className="border-surface-4 bg-surface-1/90 border p-5">
                  <CardHeader className="mb-2">
                    <CardTitle>{voice.name}</CardTitle>
                    <CardDescription>
                      {voice.language} · {voice.gender}
                    </CardDescription>
                  </CardHeader>
                  <p className="text-muted text-sm">
                    미리듣기: <span className="text-primary font-medium">{voice.previewUrl}</span>
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )
      case 'glossary':
        return (
          <div className="space-y-4">
            {sampleGlossaries.map((glossary) => (
              <Card key={glossary.id} className="border-surface-4 bg-surface-1/80 border p-6">
                <CardHeader className="mb-3">
                  <CardTitle>{glossary.name}</CardTitle>
                  <CardDescription>
                    {glossary.items.length}개의 용어가 등록되어 있습니다.
                  </CardDescription>
                </CardHeader>
                <ul className="text-muted space-y-2 text-sm">
                  {glossary.items.slice(0, 3).map((item) => (
                    <li key={item.id} className="bg-surface-2 rounded-2xl px-4 py-3">
                      <p className="text-foreground font-medium">{item.term}</p>
                      <p className="mt-1 text-xs">{item.definition}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )
      case 'guide':
        return (
          <Card className="border-surface-4 bg-surface-1/90 border p-6">
            <CardHeader className="mb-4">
              <CardTitle>서비스 이용 가이드</CardTitle>
              <CardDescription>
                아래 단계는 신규 팀원이 온보딩할 때 따라야 할 권장 워크플로입니다.
              </CardDescription>
            </CardHeader>
            <ol className="text-muted space-y-3 pl-5 text-sm">
              <li className="list-decimal">
                원본 영상 업로드: 정책에 맞는 포맷과 용량을 확인한 뒤, 프로젝트 생성 플로우를
                시작합니다.
              </li>
              <li className="list-decimal">
                목표 언어 및 음성 리소스 연결: 자동 감지 결과를 검토하고, 필요 시 보이스 샘플과 용어
                사전을 지정합니다.
              </li>
              <li className="list-decimal">
                번역가 어사인: 일정과 역할을 입력하면 편집자 워크스페이스에 즉시 알림이 전송됩니다.
              </li>
              <li className="list-decimal">
                편집·검수: 세그먼트 편집과 파형 싱크 조정을 마친 뒤 저장하면 배급사에게 완료 알림이
                발송됩니다.
              </li>
              <li className="list-decimal">
                배포 및 리포트: 결과물을 다운로드하거나 보고서를 공유하여 프로젝트를 마무리합니다.
              </li>
            </ol>
          </Card>
        )
      case 'support':
        return (
          <Card className="border-surface-4 bg-surface-1/90 border p-6">
            <CardHeader className="mb-4">
              <CardTitle>지원 센터</CardTitle>
              <CardDescription>
                서비스 이용 중 문제가 있다면 아래 채널로 연락 주세요. 24시간 내 1차 응답을 드립니다.
              </CardDescription>
            </CardHeader>
            <div className="text-muted space-y-3 text-sm">
              <p>
                이메일:{' '}
                <a className="text-primary font-medium" href="mailto:support@frontwireframe.dev">
                  support@frontwireframe.dev
                </a>
              </p>
              <p>Slack: #front-wireframe-support</p>
              <p>업무 시간: 평일 09:00 ~ 18:00 (KST)</p>
            </div>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[280px,1fr]">
      <aside>
        <WorkspaceSideNav />
      </aside>
      <section className="space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-3xl font-semibold">{sectionCopy[section].title}</h1>
          <p className="text-muted text-sm">{sectionCopy[section].description}</p>
        </div>
        {renderSection()}
      </section>
      <ProjectCreationModal />
    </div>
  )
}
