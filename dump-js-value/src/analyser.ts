import Value from "./value/base";
import {builder} from "./value/builder";

export interface AnalyserOptions {
  maxDepth?: number
  rawValues: unknown[]
  maxArrayDepth?: number
}

export class Analyser {
  private maxDepth: number;
  private values: Value<unknown>[] = [];
  private maxArrayDepth: number | undefined

  public static analyse(options: AnalyserOptions): Analyser {
    const a = new Analyser(options)
    a.analyse()
    return a
  }

  private constructor(options: AnalyserOptions) {
    if (options.maxArrayDepth === undefined) {
      this.maxArrayDepth = undefined
    } else {
      if (isNaN(options.maxArrayDepth)) throw new Error('maxArrayDepth cannot be NaN')
      this.maxArrayDepth = options.maxArrayDepth
    }

    this.maxDepth = options.maxDepth || 0

    for (const rawValue of options.rawValues) {
      this.findOrCreateValue(rawValue)
    }
  }

  private getValue(rawValue: unknown): Value<unknown> | undefined {
    const r = this.values.find(v => {
      return Object.is(v.value, rawValue);
    })
    return r
  }

  private analyse(): void {
    const queue = new Array<{
      value: Value<unknown>,
      depth: number
    }>()

    queue.push(...this.values.map(value => ({ value, depth: 0 })))

    while (true) {
      const item = queue.shift() as (typeof queue)[0] | undefined
      if (item === undefined) break

      console.log({ item })
      if (item.value.seen) continue
      item.value.seen = true

      if (this.maxDepth !== undefined && item.depth >= this.maxDepth) {
        item.value.maxDepthReached = true
        continue
      }

      const connections = item.value.findConnections(v => this.findOrCreateValue(v))
      item.value.connections.push(...connections)
      queue.push(...connections.map(c => ({ value: c.to, depth: item.depth + 1 })))
    }

    console.log({
      valueCount: this.values.length,
      connectionCount: this.values.map(v => v.maxDepthReached ? 0 : v.connections.length).reduce((a, b) => a + b, 0),
      truncatedCount: this.values.filter(v => v.maxDepthReached).length,
    })
  }

  private findOrCreateValue(rawValue: unknown): Value<unknown> {
    const found = this.getValue(rawValue)
    if (found !== undefined) return found

    const v = builder(rawValue)
    this.values.push(v)
    return v
  }
}
