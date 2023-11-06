import Value from "./value/base";
import {builder} from "./value/builder";

export interface AnalyserOptions {
  maxDepth?: number
}

export class Analyser {
  private maxDepth: number;
  private values: Value<unknown>[] = [];

  constructor(options: AnalyserOptions = {}) {
    this.maxDepth = options.maxDepth || 0
  }

  public addValue(v: unknown): void {
    const value = builder(v)
    this.values.push(value)
  }
}
