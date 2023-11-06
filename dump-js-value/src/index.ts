import {Analyser} from "./analyser";

const usage = (): never => {
  process.stderr.write('Usage: dump-js-value MAX_DEPTH EXPRESSION ...\n')
  return process.exit(1)
}

const maxDepth = Number(process.argv[2])
if (isNaN(maxDepth)) usage()

const analyser = new Analyser({ maxDepth })

for (const expr of process.argv.slice(3)) {
  let value: unknown
  try {
    value = [eval(expr)]
  } catch (e) {
    console.error({ e })
  }

  if (value) analyser.addValue(value[0])
}

console.log({ analyser })