import * as util from "util";

export default abstract class Value<T> {
  public readonly value: T;

  constructor(value: T) {
    // console.log({ construct_from: value, caller: new Error('x').stack })
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
