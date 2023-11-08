import * as abstract from './abstract'
import PairCollection from './pairCollection';
import tryCatch from "./tryCatch";

export interface AnalyserOptions {
  maxDepth?: number
  rawValues: unknown[]
  maxArrayDepth?: number
}

export class Analyser {
  private readonly maxDepth: number;
  private readonly maxArrayDepth: number | undefined
  private readonly rawValues: unknown[]

  private readonly values: PairCollection<unknown, abstract.Value>

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
    this.rawValues = options.rawValues

    this.values = new PairCollection<unknown, abstract.Value>(
      (a, b) => Object.is(a, b),
      (rawValue) => this.buildAbstractValue(rawValue),
    )
  }

  private analyse(): void {
    this.seedValues()
  }

  private seedValues() {
    for (const rawValue of this.rawValues) {
      this.values.findOrCreate(rawValue)
    }
  }

  private buildAbstractValue(rawValue: unknown): abstract.Value {
    const v: abstract.Value = {
      isWellKnown: false,
      nameWhateverThatMeans: rawValue.toString(),
      typeOf: typeof rawValue,
    }

    tryCatch(() => {
      v.objectProperties = {
        isExtensible: Object.isExtensible(rawValue),
        isFrozen: Object.isFrozen(rawValue),
        isSealed: Object.isSealed(rawValue),
      }
    })

    return v
  }




  // private analyse(): void {
  //
  //
  //   for (const rawValue of options.rawValues) {
  //     this._values.findOrCreate(rawValue)
  //   }
  //
  //   const queue = new Array<{
  //     value: Value,
  //     depth: number
  //   }>()
  //
  //   queue.push(...this._values.map(value => ({ value, depth: 0 })))
  //
  //   while (true) {
  //     const item = queue.shift() as (typeof queue)[0] | undefined
  //     if (item === undefined) break
  //
  //     console.log({ item })
  //     if (item.value.seen) continue
  //     item.value.seen = true
  //
  //     if (this.maxDepth !== undefined && item.depth >= this.maxDepth) {
  //       item.value.maxDepthReached = true
  //       continue
  //     }
  //
  //     const connections = item.value.findConnections(v => this.findOrCreateValue(v))
  //     item.value.connections.push(...connections)
  //     queue.push(...connections.map(c => ({ value: c.to, depth: item.depth + 1 })))
  //   }
  //
  //   console.log({
  //     valueCount: this._values.length,
  //     connectionCount: this._values.map(v => v.maxDepthReached ? 0 : v.connections.length).reduce((a, b) => a + b, 0),
  //     truncatedCount: this._values.filter(v => v.maxDepthReached).length,
  //   })
  // }
  //
  // public get values(): Array<Value<unknown>> {
  //   return [...this._values]
  // }

}
