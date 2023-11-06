import * as util from "util";
import Value from "./base";

export class PrimitiveStringValue extends Value<string> {
  protected inspect2(): string {
    return `[a string value = ${util.inspect(this.value)} with ${this.connections?.length} connections]`;
  }
}
