import * as util from "util";
import Value from "./base";

export class ObjectValue extends Value<unknown> {
  protected inspect2(): string {
    return `[an object value = ${util.inspect(this.value, { depth: 0 })}]`;
  }
}
