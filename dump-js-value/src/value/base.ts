import * as util from "util";
import {Connection} from "../connection";
import tryCatch, {Result} from "../tryCatch";
import {builder} from "./builder";

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

  public findConnections(findOrCreateValue: (rawValue: unknown) => Value<unknown>): Connection[] {
    if (this.value === undefined) return []
    if (this.value === null) return []

    const connections: Connection[] = []
    let r: Result<unknown>

    r = tryCatch(() => Reflect.getPrototypeOf(this.value as unknown as object))
    if (r.ok) connections.push(new Connection('Reflect.getPrototypeOf', findOrCreateValue(r.value)))

    const keys = tryCatch(() => Reflect.ownKeys(this.value as unknown as object))

    if (keys.ok) {
      for (const propertyName of keys.value) {
        const descriptor = Reflect.getOwnPropertyDescriptor(this.value, propertyName);
        if (descriptor === undefined) continue

        if ("value" in descriptor) {
          connections.push(new Connection('property value', findOrCreateValue(descriptor.value), propertyName))
        }

        if ("get" in descriptor) {
          connections.push(new Connection('property getter', findOrCreateValue(descriptor.get), propertyName))
        }

        if ("set" in descriptor) {
          connections.push(new Connection('property setter', findOrCreateValue(descriptor.set), propertyName))
        }
      }
    }


    return connections
  }
}
