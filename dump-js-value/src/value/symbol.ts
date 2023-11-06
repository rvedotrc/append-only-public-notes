import {inspect} from "util";
import Value from "./base";

export class SymbolValue extends Value<symbol> {
  protected inspect2(): string {
    return `[a symbol value = ${inspect(this.value)} with ${this.connections?.length} connections]`;
  }
}
