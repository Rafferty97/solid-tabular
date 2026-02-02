import { ProjectMetadata, AppState } from 'src/state/project/state'

export interface TelemetryProjectData {
  project_id: string
  data: {
    name: string
    created_at: number
    stats: {
      files: number
      tables: number
      canvases: number
    }
    last_accessed?: number
    blocks_used?: string[]
    file_formats?: string[]
  }
}

export interface BatchTelemetryPayload {
  token: string
  projects: TelemetryProjectData[]
}

class TelemetryService {
  private apiBaseUrl: string
  private userToken: string | null = null

  constructor(apiBaseUrl = 'https://api.columns.dev') {
    this.apiBaseUrl = apiBaseUrl
    this.initializeUserToken()
  }

  private initializeUserToken() {
    // Get or create a persistent user token
    let token = localStorage.getItem('columns_user_token')
    if (!token) {
      token = crypto.randomUUID().replace(/-/g, '')
      localStorage.setItem('columns_user_token', token)
    }
    this.userToken = token
  }

  private extractProjectTelemetryData(state: AppState): TelemetryProjectData {
    // Extract block types used in canvases
    const blocksUsed = new Set<string>()
    state.canvases.forEach(canvas => {
      canvas.atoms.forEach(atom => {
        blocksUsed.add(atom.type)
      })
    })

    // Extract file formats from files
    const fileFormats = new Set<string>()
    state.files.forEach(file => {
      if (file.options.format?.format) {
        fileFormats.add(file.options.format.format)
      }
    })

    return {
      project_id: state.id,
      data: {
        name: state.name,
        created_at: state.createdAt,
        stats: {
          files: state.files.length,
          tables: state.tables.length,
          canvases: state.canvases.length,
        },
        last_accessed: Date.now(),
        blocks_used: Array.from(blocksUsed),
        file_formats: Array.from(fileFormats),
      },
    }
  }

  async sendProjectTelemetry(state: AppState): Promise<void> {
    if (!this.userToken) return

    try {
      const projectData = this.extractProjectTelemetryData(state)

      const response = await fetch(`${this.apiBaseUrl}/telemetry/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: this.userToken,
          project_id: projectData.project_id,
          data: projectData.data,
        }),
      })

      if (!response.ok) {
        console.warn('Failed to send telemetry:', response.statusText)
      }
    } catch (error) {
      console.warn('Telemetry error:', error)
    }
  }

  async sendBatchTelemetry(projects: AppState[]): Promise<void> {
    if (!this.userToken || projects.length === 0) return

    try {
      const telemetryData: TelemetryProjectData[] = projects.map(state =>
        this.extractProjectTelemetryData(state),
      )

      const payload: BatchTelemetryPayload = {
        token: this.userToken,
        projects: telemetryData,
      }

      const response = await fetch(`${this.apiBaseUrl}/telemetry/projects/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.warn('Failed to send batch telemetry:', response.statusText)
      }
    } catch (error) {
      console.warn('Batch telemetry error:', error)
    }
  }

  async sendWorkspaceTelemetry(allProjects: ProjectMetadata[]): Promise<void> {
    if (!this.userToken || allProjects.length === 0) return

    try {
      // For workspace telemetry, we'll send basic project metadata
      const telemetryData: TelemetryProjectData[] = allProjects.map(meta => ({
        project_id: meta.id,
        data: {
          name: meta.name,
          created_at: meta.createdAt,
          stats: meta.stats,
          last_accessed: Date.now(),
          blocks_used: [],
          file_formats: [],
        },
      }))

      const payload: BatchTelemetryPayload = {
        token: this.userToken,
        projects: telemetryData,
      }

      const response = await fetch(`${this.apiBaseUrl}/telemetry/projects/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.warn('Failed to send workspace telemetry:', response.statusText)
      }
    } catch (error) {
      console.warn('Workspace telemetry error:', error)
    }
  }

  getUserToken(): string | null {
    return this.userToken
  }
}

// Create a singleton instance
export const telemetryService = new TelemetryService()

// Helper function to determine if telemetry should be sent
export function shouldSendTelemetry(): boolean {
  // Only send telemetry in production or if explicitly enabled
  return (
    window.location.hostname === 'columns.dev' ||
    window.location.hostname === 'app.columns.dev' ||
    localStorage.getItem('columns_telemetry_enabled') === 'true'
  )
}
