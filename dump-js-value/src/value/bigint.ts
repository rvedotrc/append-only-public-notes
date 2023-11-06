import * as util from "util";
import Value from "./base";

export class BigIntValue extends Value<bigint> {
  protected inspect2(): string {
    return `[a bigint value = ${util.inspect(this.value)} with ${this.connections?.length} connections]`;
  }
}
