import { useState } from 'react'

import { Play } from 'lucide-react'
import { Link } from 'react-router-dom'

import { routes } from '../../shared/config/routes'
import { trackEvent } from '../../shared/lib/analytics'
import { useAuthStore } from '../../shared/store/useAuthStore'
import { Button } from '../../shared/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '../../shared/ui/Card'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '../../shared/ui/Tabs'
import WorkspacePage from '../workspace/WorkspacePage'

type SampleLanguage = 'ko' | 'ja' | 'es'

const samples: Record<SampleLanguage, { label: string; waveColor: string }> = {
  ko: { label: '한국어', waveColor: 'from-purple-500 to-blue-500' },
  ja: { label: '日本語', waveColor: 'from-rose-500 to-amber-500' },
  es: { label: 'Español', waveColor: 'from-cyan-500 to-emerald-500' },
}

function SampleVideoMock({ language }: { language: SampleLanguage }) {
  const gradient = samples[language].waveColor
  return (
    <div className="border-surface-3 bg-surface-1 relative overflow-hidden rounded-3xl border">
      <div className={`h-48 bg-gradient-to-br ${gradient} opacity-80`} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/40 backdrop-blur">
          <Play className="h-8 w-8" />
        </div>
        <p className="text-sm font-medium">샘플 영상 프리뷰 (모의)</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [language, setLanguage] = useState<SampleLanguage>('ko')
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <WorkspacePage />
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16">
      <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
        <div className="space-y-6">
          <span className="border-surface-4 bg-surface-2 text-muted inline-flex items-center rounded-full border px-4 py-1 text-xs font-medium uppercase tracking-wider">
            원본 → 선택 언어 더빙 영상
          </span>
          <h1 className="text-foreground text-4xl font-semibold tracking-tight md:text-5xl">
            더빙 파이프라인을 누구나 30분 만에 세팅할 수 있도록 돕습니다
          </h1>
          <p className="text-muted text-lg leading-relaxed">
            배급자는 업로드와 배포에 집중하고, 번역가는 싱크와 퀄리티에 집중하도록 설계된 협업
            플랫폼입니다. 역할 기반 워크플로와 자동 트래킹으로 프로젝트 현황을 실시간으로
            파악하세요.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => trackEvent('sample_play', { lang: language })}
              className="px-6"
            >
              <Play className="h-4 w-4" />
              예제 영상 재생
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to={routes.login}>로그인</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to={routes.signup}>회원가입</Link>
            </Button>
          </div>
        </div>
        <Card className="bg-surface-2 border-none p-8 shadow-soft">
          <CardHeader>
            <CardTitle>샘플 영상</CardTitle>
            <CardDescription>
              언어 토글로 오디오/자막 트랙을 즉시 전환하는 모의 화면입니다.
            </CardDescription>
          </CardHeader>
          <TabsRoot
            value={language}
            onValueChange={(lang) => {
              setLanguage(lang as SampleLanguage)
              trackEvent('sample_language_toggle', { lang })
            }}
          >
            <TabsList className="mb-6">
              {Object.entries(samples).map(([code, value]) => (
                <TabsTrigger key={code} value={code}>
                  {value.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={language}>
              <SampleVideoMock language={language} />
            </TabsContent>
          </TabsRoot>
          <div className="bg-surface-1 mt-6 space-y-3 rounded-2xl p-4">
            <div className="text-muted flex items-center justify-between text-sm">
              <span>상태</span>
              <span className="text-foreground font-medium">Ready</span>
            </div>
            <div className="text-muted flex items-center justify-between text-sm">
              <span>최근 업데이트</span>
              <span className="text-foreground font-medium">방금 전</span>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: '배급자 워크플로',
            description:
              '프로젝트 생성부터 배포까지 3단계 모달 플로우로 구성되어 있으며, 업로드/언어/일정 설정을 순차 진행합니다.',
          },
          {
            title: '번역가 에디터',
            description:
              '세그먼트·파형·화자 레인을 동시에 편집하며, 속도 조절·분할·병합으로 싱크를 정밀하게 맞춥니다.',
          },
          {
            title: '완료 리포트',
            description:
              '역할별 권한을 반영한 레포트 화면에서 진행률, 더빙 결과물, 언어별 자산을 확인하고 공유합니다.',
          },
        ].map((item) => (
          <Card key={item.title} className="border-surface-4 bg-surface-1/80 border p-6">
            <CardHeader className="mb-3">
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardDescription className="text-muted text-base leading-relaxed">
              {item.description}
            </CardDescription>
          </Card>
        ))}
      </section>
    </div>
  )
}
