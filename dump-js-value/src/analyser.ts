import Value from "./value/base";
import {builder} from "./value/builder";
import {Connection} from "./connection";

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
      if (this.getValue(rawValue) === undefined) {
        this.values.push(builder(rawValue))
      }
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

      if (item.value.seen) continue
      item.value.seen = true

      if (this.maxDepth !== undefined && item.depth >= this.maxDepth) {
        item.value.maxDepthReached = true
        continue
      }

      const connections = item.value.findConnections()
      item.value.connections.push(...connections)
      queue.push(...connections.map(c => ({ value: c.to, depth: item.depth + 1 })))
    }
  }
}
