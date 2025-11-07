import { Link } from 'react-router-dom'

import type { ProjectSummary } from '@/entities/project/types'
import { routes } from '@/shared/config/routes'
import { formatPercent } from '@/shared/lib/utils'
import { Progress } from '@/shared/ui/Progress'

const gradients = [
  'from-emerald-400 via-teal-500 to-cyan-500',
  'from-purple-500 via-indigo-500 to-sky-500',
  'from-rose-400 via-orange-400 to-amber-400',
]

export function EpisodeCard({ project }: { project: ProjectSummary }) {
  const gradient = gradients[Math.abs(project.id.charCodeAt(0)) % gradients.length]

  return (
    <Link
      to={routes.projectDetail(project.id)}
      className="border-surface-3 bg-surface-1/95 focus-visible:outline-hidden hover:border-primary/60 block overflow-hidden rounded-3xl border shadow-soft transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      <div className="relative aspect-video overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80`} />
        <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">Episode</p>
          <p className="line-clamp-1 text-lg font-semibold">{project.title}</p>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="space-y-1">
          <p className="text-muted text-xs">
            사용 언어: {project.sourceLanguage} → {(project.targetLanguages ?? []).join(', ')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full">
            <Progress value={project.progress} />
          </div>
          <span className="text-muted text-xs font-semibold">
            {formatPercent(project.progress)}
          </span>
        </div>
      </div>
    </Link>
  )
}
