// Type declarations for @mintplex-labs/transformersjs-electron
// This package has the same API as @xenova/transformers

declare module '@mintplex-labs/transformersjs-electron' {
  export function pipeline(task: string, model?: string, options?: any): Promise<any>

  export const env: {
    backends: {
      onnx: {
        wasm: {
          numThreads: number
          wasmPaths?: string
        }
      }
    }
    allowRemoteModels: boolean
    allowLocalModels: boolean
  }
}
