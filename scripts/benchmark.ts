import { performance } from 'perf_hooks'
import { createRAGEngine, OllamaEmbedding } from '../packages/rag-engine/src/index.js'
import { OllamaClient } from '../packages/llm-client/src/index.js'
import fs from 'fs'
import path from 'path'
import os from 'os'

interface BenchmarkResult {
  operation: string
  iterations: number
  avgTime: number
  minTime: number
  maxTime: number
  notes: string
}

const results: BenchmarkResult[] = []

function formatTime(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`
  if (ms < 1000) return `${ms.toFixed(0)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

async function benchmark(
  name: string,
  fn: () => Promise<any>,
  iterations: number = 1,
  notes: string = ''
): Promise<BenchmarkResult> {
  console.log(`\n📊 Benchmarking: ${name} (${iterations} iteration${iterations > 1 ? 's' : ''})`)

  const times: number[] = []

  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    await fn()
    const end = performance.now()
    const time = end - start
    times.push(time)
    console.log(`  Iteration ${i + 1}: ${formatTime(time)}`)
  }

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length
  const minTime = Math.min(...times)
  const maxTime = Math.max(...times)

  console.log(`  Average: ${formatTime(avgTime)}`)
  console.log(`  Range: ${formatTime(minTime)} - ${formatTime(maxTime)}`)

  return {
    operation: name,
    iterations,
    avgTime,
    minTime,
    maxTime,
    notes
  }
}

async function main() {
  console.log('🚀 Starting Baynetna Performance Benchmarks')
  console.log('='.repeat(60))

  // Get system info
  console.log(`\n💻 System Info:`)
  console.log(`  Platform: ${os.platform()} ${os.arch()}`)
  console.log(`  CPUs: ${os.cpus()[0].model} (${os.cpus().length} cores)`)
  console.log(`  Memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)} GB`)
  console.log(`  Free Memory: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(1)} GB`)

  // Initialize clients
  const ollamaClient = new OllamaClient({
    model: 'granite3.3:8b',
    baseUrl: 'http://127.0.0.1:11434'
  })

  // Check Ollama connection
  console.log('\n🔌 Testing Ollama connection...')
  const isConnected = await ollamaClient.isAvailable()
  if (!isConnected) {
    console.error('❌ Ollama is not running. Please start Ollama first.')
    process.exit(1)
  }
  console.log('✅ Ollama connected')

  // Get current model
  const models = await ollamaClient.listModels()
  const currentModel = models[0] || 'granite3.3:8b'
  console.log(`  Using model: ${currentModel}`)

  // Test data
  const sampleText1000 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. '.repeat(10).slice(0, 1000)
  const sampleText5000 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. '.repeat(50).slice(0, 5000)

  // Benchmark 1: Embedding generation via Ollama
  const embeddingModel = new OllamaEmbedding()
  results.push(await benchmark(
    'Embedding Generation (1000 chars)',
    async () => {
      await embeddingModel.embed([sampleText1000])
    },
    3,
    'Via Ollama nomic-embed-text'
  ))

  // Benchmark 2: Document indexing
  const ragEngine = await createRAGEngine()
  results.push(await benchmark(
    'Document Indexing (5000 chars)',
    async () => {
      await ragEngine.indexDocument('benchmark-doc', sampleText5000)
    },
    2,
    'Chunking + embedding generation'
  ))

  // Benchmark 3: Vector search
  await ragEngine.indexDocument('search-test', sampleText5000)
  results.push(await benchmark(
    'Vector Search',
    async () => {
      await ragEngine.search('what is this document about', 3)
    },
    5,
    'Semantic search with k=3'
  ))

  // Benchmark 4: LLM Summary (short)
  results.push(await benchmark(
    'Summary Generation (1000 chars)',
    async () => {
      await ollamaClient.summarize(sampleText1000)
    },
    1,
    `${currentModel} model`
  ))

  // Benchmark 5: LLM Summary (medium)
  results.push(await benchmark(
    'Summary Generation (5000 chars)',
    async () => {
      await ollamaClient.summarize(sampleText5000)
    },
    1,
    `${currentModel} model`
  ))

  // Benchmark 6: RAG Query (end-to-end)
  await ragEngine.indexDocument('rag-benchmark', sampleText5000)
  results.push(await benchmark(
    'RAG Query (end-to-end)',
    async () => {
      await ragEngine.query('What is the main topic of this document?')
    },
    2,
    'Retrieval + LLM generation'
  ))

  // Print summary table
  console.log('\n\n' + '='.repeat(100))
  console.log('📊 BENCHMARK RESULTS')
  console.log('='.repeat(100))
  console.log('')
  console.log('| Operation | Avg Time | Min | Max | Notes |')
  console.log('|-----------|----------|-----|-----|-------|')

  results.forEach(r => {
    console.log(
      `| ${r.operation.padEnd(35)} | ${formatTime(r.avgTime).padEnd(8)} | ${formatTime(r.minTime).padEnd(7)} | ${formatTime(r.maxTime).padEnd(7)} | ${r.notes} |`
    )
  })

  // Save results to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const outputPath = path.join(process.cwd(), 'benchmarks', `benchmark-${timestamp}.json`)

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        system: {
          platform: os.platform(),
          arch: os.arch(),
          cpu: os.cpus()[0].model,
          cores: os.cpus().length,
          totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)} GB`,
          model: currentModel
        },
        results
      },
      null,
      2
    )
  )

  console.log(`\n💾 Results saved to: ${outputPath}`)
  console.log('\n✅ Benchmarking complete!')
}

main().catch(console.error)
