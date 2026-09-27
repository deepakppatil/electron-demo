export {}

declare global {
  interface Window {
    desktop?: {
      platform: 'darwin' | 'win32' | 'linux' | string
      window: {
        minimize(): void
        toggleMaximize(): void
        close(): void
        isMaximized(): Promise<boolean>
        onMaximizedChange(cb: (isMaximized: boolean) => void): () => void
      }
    }
  }
}
