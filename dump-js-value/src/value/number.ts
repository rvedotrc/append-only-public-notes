import * as util from "util";
import Value from "./base";

export class PrimitiveNumberValue extends Value<number> {
  protected inspect2(): string {
    return `[a number value = ${util.inspect(this.value)} with ${this.connections?.length} connections]`;
  }
}
