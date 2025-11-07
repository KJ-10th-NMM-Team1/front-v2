import { useParams } from 'react-router-dom'

import { EditorToolbar } from '../../features/editor/components/EditorToolbar'
import { SegmentList } from '../../features/editor/components/SegmentList'
import { VoiceAssign } from '../../features/editor/components/VoiceAssign'
import { WaveformEditor } from '../../features/editor/components/WaveformEditor'
import { useEditorState } from '../../features/editor/hooks/useEditorState'
import { Spinner } from '../../shared/ui/Spinner'

export default function EditorPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading } = useEditorState(id)

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-muted text-sm">에디터 상태를 불러오는 중…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <p className="text-muted text-xs font-semibold uppercase tracking-wider">편집자 전용</p>
        <h1 className="text-foreground text-3xl font-semibold">더빙 편집 스튜디오</h1>
        <p className="text-muted text-sm">
          세그먼트 텍스트·타이밍 편집, 화자별 보이스 매핑, 속도 조절·분할·병합을 통해 최종 더빙 영상
          싱크를 확보합니다.
        </p>
      </header>
      <EditorToolbar />
      <div className="grid gap-6 xl:grid-cols-[320px,1fr]">
        <aside className="border-surface-3 bg-surface-2 space-y-4 rounded-3xl border p-5">
          <h2 className="text-foreground text-lg font-semibold">세그먼트 리스트</h2>
          <p className="text-muted text-xs">
            선택한 세그먼트는 파형과 영상 플레이헤드에 동기 반영됩니다.
          </p>
          <SegmentList segments={data.segments} />
        </aside>
        <section className="space-y-6">
          <WaveformEditor duration={data.playback.duration} segmentCount={data.segments.length} />
          <VoiceAssign voices={data.voices} segments={data.segments} />
        </section>
      </div>
    </div>
  )
}
