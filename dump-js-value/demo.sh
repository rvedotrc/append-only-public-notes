run() {
  local js="$1"
  local name="${2:-$js}"

  for maxDepth in 0 1 2 3 4 ; do
    if node dump-js-value.js $maxDepth "$js" > var/demo.$name.$maxDepth.dot ; then
      twopi -Tpng -o var/demo.$name.$maxDepth.png var/demo.$name.$maxDepth.dot
    else
      mv "var/demo.$name.$maxDepth.dot" "var/demo.$name.$maxDepth.log"
      echo "ERROR: demo.$name.$maxDepth"
    fi
  done
}

rm var/demo.*

run null
run undefined
run true
run 0 number
run '"x"' string
run '([])' empty-array
run '({})' empty-object
run '(a, b) => 7' anon-function-returning-7
run 'new Error("bang!")' error
run '({ bool: true, name: "foo", count: 3, aliases: [null, undefined, () => 9] })' complex

ls -l var/demo.*
