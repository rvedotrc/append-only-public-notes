import * as util from "util";
import Value from "./base";

export class SingletonValue extends Value<undefined | null | true | false> {
  protected inspect2(): string {
    return `[singleton value = ${util.inspect(this.value)}]`;
  }
}
