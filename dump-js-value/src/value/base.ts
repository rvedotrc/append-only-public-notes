import * as util from "util";
import {Connection} from "../connection";

export default abstract class Value<T> {
  public readonly value: T;
  public maxDepthReached = false;
  public seen = false;
  public readonly connections: Connection[] = []

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

  public findConnections(): Connection[] {
    throw new Error('findConnections not implemented')
  }
}
