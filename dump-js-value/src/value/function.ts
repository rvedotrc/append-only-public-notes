import * as util from "util";
import {ObjectValue} from "./object";

export class FunctionValue extends ObjectValue {
  protected inspect2(): string {
    return `[a function value = ${util.inspect(this.value)}]`;
  }
}
