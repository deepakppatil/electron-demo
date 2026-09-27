/* ------------------------------------------------------------------ *
 * Harness — screen fixtures
 * ------------------------------------------------------------------ */

export type Tone = 'accent' | 'blue' | 'green' | 'amber' | 'red' | 'purple'

/* --- Stat strip ---------------------------------------------------- */
export type Stat = {
  id: string
  label: string
  value: number
  delta: number
  tone: Tone
  spark: number[]
}

export const STATS: Stat[] = [
  { id: 'total', label: 'Total actions', value: 42, delta: 18, tone: 'purple', spark: [4, 6, 5, 8, 7, 9, 11, 10, 13, 14] },
  { id: 'critical', label: 'Critical', value: 5, delta: -12, tone: 'red', spark: [9, 8, 10, 7, 8, 6, 5, 6, 4, 5] },
  { id: 'progress', label: 'In progress', value: 14, delta: 33, tone: 'blue', spark: [3, 4, 5, 4, 7, 8, 7, 10, 11, 14] },
  { id: 'awaiting', label: 'Awaiting input', value: 6, delta: -14, tone: 'green', spark: [11, 10, 12, 9, 8, 9, 7, 8, 6, 6] },
  { id: 'done', label: 'Completed', value: 28, delta: 25, tone: 'green', spark: [8, 10, 9, 13, 12, 16, 15, 20, 24, 28] },
]

/* --- Project ------------------------------------------------------- */
export type Stage = 'done' | 'running' | 'input' | 'todo'

export type Task = {
  id: string
  name: string
  status: 'RUNNING' | 'NEEDS INPUT' | 'SUCCESS'
  tone: Tone
  stages: Stage[]
}

export type Repo = {
  id: string
  name: string
  kind: 'Brownfield' | 'Greenfield'
  stack: string
  branch: string
  summary: string
  tasks: Task[]
}

export type Project = {
  id: string
  name: string
  openTasks: number
  repositories: number
  type: 'Brownfield' | 'Greenfield'
  backend: string
  persona: string
  branch: string
  mcp: boolean[]
}

export const PROJECTS: Project[] = [
  { id: 'demo', name: 'Demo', openTasks: 4, repositories: 4, type: 'Brownfield', backend: 'Claude Code', persona: 'Architect', branch: 'develop', mcp: [true, true, false] },
  { id: 'foo-bar', name: 'Foo-Bar', openTasks: 10, repositories: 6, type: 'Greenfield', backend: 'Claude Code', persona: 'Architect', branch: 'main', mcp: [true, false, false] },
]

export const REPOS: Repo[] = [
  {
    id: 'admin-client',
    name: 'admin_client',
    kind: 'Brownfield',
    stack: 'React · Vite',
    branch: 'develop',
    summary: '3 tasks · 1 running · 1 needs input',
    tasks: [
      {
        id: 't1',
        name: 'auth-service-jwt-refresh',
        status: 'RUNNING',
        tone: 'blue',
        stages: ['done', 'done', 'running', 'todo', 'todo'],
      },
      {
        id: 't2',
        name: 'links-management-v2',
        status: 'NEEDS INPUT',
        tone: 'amber',
        stages: ['input', 'todo', 'todo', 'todo', 'todo'],
      },
      {
        id: 't3',
        name: 'api-rate-limiter',
        status: 'SUCCESS',
        tone: 'green',
        stages: ['done', 'done', 'done', 'done', 'done'],
      },
    ],
  },
  {
    id: 'core-service',
    name: 'core-service',
    kind: 'Brownfield',
    stack: 'Java · Spring Boot',
    branch: 'main',
    summary: '1 task · 1 running',
    tasks: [
      {
        id: 't4',
        name: 'payment-webhook-retry',
        status: 'RUNNING',
        tone: 'blue',
        stages: ['done', 'done', 'done', 'running', 'todo'],
      },
    ],
  },
  {
    id: 'ledger-svc',
    name: 'ledger-service',
    kind: 'Greenfield',
    stack: 'Go · gRPC',
    branch: 'develop',
    summary: '1 task · 1 needs input',
    tasks: [
      {
        id: 't5',
        name: 'graph-query-cache',
        status: 'NEEDS INPUT',
        tone: 'amber',
        stages: ['input', 'todo', 'todo', 'todo', 'todo'],
      },
    ],
  },
  {
    id: 'webhooks',
    name: 'webhooks',
    kind: 'Brownfield',
    stack: 'Node · TypeScript',
    branch: 'develop',
    summary: '2 tasks · 2 success',
    tasks: [
      {
        id: 't6',
        name: 'signature-rotation',
        status: 'SUCCESS',
        tone: 'green',
        stages: ['done', 'done', 'done', 'done', 'done'],
      },
      {
        id: 't7',
        name: 'retry-backoff',
        status: 'SUCCESS',
        tone: 'green',
        stages: ['done', 'done', 'done', 'done', 'done'],
      },
    ],
  },
]

/* --- Agents -------------------------------------------------------- */
export type Agent = {
  id: string
  name: string
  command: string
  task: string
  tag: string
  state: 'running' | 'input'
  tone: Tone
  icon: 'wrench' | 'gem' | 'pen' | 'list'
}

export const AGENTS: Agent[] = [
  { id: 'ag1', name: 'Implementer', command: 'implement-tasks', task: 'auth-service-jwt-refresh', tag: 'BUILD', state: 'running', tone: 'blue', icon: 'wrench' },
  { id: 'ag2', name: 'Spec Shaper', command: 'shape-spec', task: 'links-management-v2', tag: 'SPEC', state: 'input', tone: 'amber', icon: 'gem' },
  { id: 'ag3', name: 'Test Builder', command: 'build-test', task: 'payment-webhook-retry', tag: 'TEST', state: 'running', tone: 'blue', icon: 'pen' },
  { id: 'ag4', name: 'Task Planner', command: 'create-tasks', task: 'graph-query-cache', tag: 'TASKS', state: 'input', tone: 'amber', icon: 'list' },
]

export const IDLE_AGENTS =
  '6 more agents (Code Reviewer, Jira Sync, Security, Architecture, …) are idle — they activate as tasks reach their stage.'

/* --- Nav ----------------------------------------------------------- */
export const NAV = [
  { id: 'workspace', label: 'Workspace', icon: 'grid' },
  { id: 'health', label: 'Health', icon: 'pulse' },
  { id: 'jira', label: 'Jira', icon: 'tag' },
  { id: 'audit', label: 'Audit', icon: 'list' },
  { id: 'config', label: 'Config', icon: 'sliders' },
] as const

export const TASK_BOT = {
  blurb: 'Let the Task Bot draft, queue and label work while you stay on the critical path.',
  stats: [
    { label: 'Queued', value: '12' },
    { label: 'Triaged today', value: '38' },
  ],
}
