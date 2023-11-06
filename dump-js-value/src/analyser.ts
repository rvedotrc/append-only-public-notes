import Value from "./value/base";
import {builder} from "./value/builder";
import {RawValue} from "./rawValue";

export interface AnalyserOptions {
  maxDepth?: number
  rawValues: unknown[]
}

export class Analyser {
  private maxDepth: number;
  private values: Value<unknown>[] = [];

  public static analyse(options: AnalyserOptions): Analyser {
    const a = new Analyser(options)
    a.analyse()
    return a
  }

  private constructor(options: AnalyserOptions) {
    this.maxDepth = options.maxDepth || 0

    for (const rawValue of options.rawValues) {
      if (this.getValue(rawValue) === undefined) {
        this.values.push(builder(rawValue))
      }
    }
  }

  private getValue(rawValue: unknown): Value<unknown> | undefined {
    const r = this.values.find(v => {
      // console.log([ v, rawValue ])
      return Object.is(v.value, rawValue);
    })
    // console.log({ r, rawValue })
    return r
  }

  private analyse(): void {

  }
}
