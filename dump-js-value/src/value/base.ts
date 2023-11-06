import * as util from "util";

export default abstract class Value<T> {
  protected readonly value: T;

  constructor(value: T) {
    this.value = value
  }

  protected abstract inspect2(): string;

  [util.inspect.custom](
    depth: Parameters<util.CustomInspectFunction>[0],
    options: Parameters<util.CustomInspectFunction>[1]
  ): ReturnType<util.CustomInspectFunction> {
    return this.inspect2()
  }
}
