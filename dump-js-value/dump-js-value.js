const util = require('util')

const maxDepth = parseInt(process.argv[2] || '3')

const wrap = (text, width) => {
  if (text.length <= width) return text

  const space = text.indexOf(' ', width)
  if (space < 0) return text

  return `${text.substring(0, space)}\n${wrap(text.substring(space + 1), width)}`
}

const doCatch = (f) => {
  try {
    return { ok: true, value: f() }
  } catch(e) {
    return { ok: false, error: e }
  }
}

const nodes = {}
const edges = []
const seq = (() => {
  let n = 0
  return () => n += 1
})()

const addNode = (n) => nodes[n.id] = n

const proxyFor = (realNode, type, label) => {
  // const proxyInId = `proxyIn${type}`
  //
  // if (!nodes[proxyInId]) {
  //   console.log(`Creating in + edge for ${type}`)
    // addNode({ id: proxyInId })
    // edges.push({ from: uniqueIn.id, to: realNode.id, label: 'is' })
  // }

  return addNode({ id: `proxyOut${type}${seq()}`, label, value: realNode.value, isProxy: true })
}

const functionProto = Reflect.getPrototypeOf(addNode)
const functionConst = (() => null).constructor
const nullProto = Reflect.getPrototypeOf({})

const maybeProxyFor = (fromNode, realNode) => {
  if (Object.is(fromNode, realNode)) return realNode
  if (Object.is(realNode.value, Object)) return proxyFor(realNode, 'o', 'Object')
  if (Object.is(realNode.value, nullProto)) return proxyFor(realNode, 'np', 'the null prototype')
  if (Object.is(realNode.value, Function)) return proxyFor(realNode, 'f', 'Function')
  if (Object.is(realNode.value, functionConst)) return proxyFor(realNode, 'fc', 'Function.constructor')
  if (Object.is(realNode.value, functionProto)) return proxyFor(realNode, 'fp', 'Function.prototype')
  return realNode
}

const maybeWithLinks = (node, path, depth) => {
  if (node.linksFollowed) return node
  if (depth >= maxDepth) return node

  node.linksFollowed = true

  const childNodes = []
  const childNodeFor = (childValue, why) => {
    const found = childNodes.find(childNode => Object.is(childNode.value, childValue))
    if (found) return found

    const add = maybeProxyFor(parentNode, addValueToGraph(childValue, [...path, why], depth + 1))
    childNodes.push(add)
    return add
  }

  const parentNode = node
  const value = parentNode.value

  const childEdges = []
  const addChildEdge = (childNode, label) => {
    const found = childEdges.find(e => Object.is(nodes[e.to], childNode))
    if (found) {
      found.label += `,\n${label}`
    } else {
      const edge = { from: parentNode.id, to: childNode.id, label }
      childEdges.push(edge)
      edges.push(edge)
    }
  }

  let v

  v = doCatch(() => Reflect.getPrototypeOf(value))
  if (v.ok) {
    addChildEdge(childNodeFor(v.value, 'Reflect.getPrototypeOf'), 'Reflect.prototype')
  }

  v = doCatch(() => value.__proto__)
  if (v.ok) {
    addChildEdge(childNodeFor(v.value, '__proto__'), '__proto__')
  }

  v = doCatch(() => value.constructor)
  if (v.ok) {
    addChildEdge(childNodeFor(v.value, 'constructor'), 'constructor')
  }

  const keys = doCatch(() => Reflect.ownKeys(value))

  if (keys.ok) {
    const listOfKeys = [...keys.value].sort((a, b) => a.toString().localeCompare(b.toString()))
    // console.log({ p: parentNode.id, n: parentNode.label, listOfKeys })

    for (const key of listOfKeys) {
      // Don't go too far along strings
      if (typeof key === 'string' && parseInt(key) >= 3) continue
      if (key === 'constructor') continue
      if (key === '__proto__') continue

      const descriptor = Reflect.getOwnPropertyDescriptor(value, key)
      console.log({ descriptor })

      // const descriptorNode = addNode({ id: `n${seq()}`, label: `d:${util.inspect(key)}` })
      // descriptorNode.label += `\nenumerable: ${descriptor.enumerable}`
      // descriptorNode.label += `\nconfigurable: ${descriptor.configurable}`
      // addChildEdge(descriptorNode, "d." + util.inspect(key))

      const maybeValueUnderKey = doCatch(() => Reflect.get(value, key))

      if (!maybeValueUnderKey.ok) {
        const errorNode = addNode({
          id: `error${seq()}`,
          label: `Threw an error:\n${ wrap(maybeValueUnderKey.error.toString(), 50)  }`
        })
        edges.push({ from: parentNode.id, to: errorNode.id, label: typeof key === 'string' ? JSON.stringify(key) : key.toString() })
        continue
      }

      const valueUnderKey = maybeValueUnderKey.value

      if (typeof value === 'function' && key === 'name' && typeof valueUnderKey === 'string') {
        parentNode.label += `\nname = ${valueUnderKey}`
        continue
      }

      if (typeof value === 'function' && key === 'length' && typeof valueUnderKey === 'number') {
        parentNode.label += `\nlength = ${valueUnderKey}`
        continue
      }

      const valueNode = childNodeFor(valueUnderKey, `key ${key.toString()}`)

      addChildEdge(valueNode, typeof key === 'string' ? JSON.stringify(key) : key.toString())
    }
  }

  return node
}

const addValueToGraph = (value, path = [], depth = 0) => {
  if (value === null) return addNode({ id: `null${seq()}`, label: 'null', isProxy: true, value })
  if (value === undefined) return addNode({ id: `undefined${seq()}`, label: 'undefined', isProxy: true, value })

  // console.log(`${depth}   ${JSON.stringify(path)}`)

  if (typeof value === 'object' || typeof value === 'function') {
    for (const n of Object.values(nodes)) {
      if (Object.is(value, n.value)) return maybeWithLinks(n, path, depth)
    }
  }

  // console.log({ value })
  // console.log({ toString: value.toString })
  // console.log({ toString2: value.toString?.() })
  // if (value.toString) console.log({ qq: `${value}` })
  // if (value.toString) console.log({ S: String(value) })
  // console.log({ i: util.inspect(value, true, 1) })

  const n = addNode({
    value,
    id: `n${seq()}`,
    label: (typeof value === 'string')
      ? wrap(`string: ${JSON.stringify(value)}`, 50)
      : wrap(`${typeof value}: ${util.inspect(value)}`, 50),
  })

  // console.log({ value, ok: true })

  if (Object.is(value, functionConst)) n.label = `well-known value: function constructor\n${n.label}`
  if (Object.is(value, functionProto)) n.label = `well-known value: function proto\n${n.label}`
  if (Object.is(value, nullProto)) n.label = `well-known value: the null prototype\n${n.label}`
  if (Object.is(value, Array)) n.label = `well-known value: Array\n${n.label}`
  if (Object.is(value, Error)) n.label = `well-known value: Error\n${n.label}`
  if (Object.is(value, Function)) n.label = `well-known value: Function\n${n.label}`
  if (Object.is(value, String)) n.label = `well-known value: String\n${n.label}`
  if (Object.is(value, Object)) n.label = `well-known value: Object\n${n.label}`

  return maybeWithLinks(n, path, depth)
}

const renderDot = () => {
  const chunks = []

  chunks.push('digraph {')
  chunks.push('  ranksep=7')

  const add = (pre, props) => {
    const propsStrings = [...Reflect.ownKeys(props)].sort()
      .filter(key => props[key] !== null && props[key] !== undefined)
      .map(key => `${key}=${JSON.stringify(props[key])}`)
    const after = propsStrings.length === 0 ? '' : ` [${propsStrings.join(' ')}]`
    chunks.push(`  ${pre}${after}`)
  }

  for (const n of Object.values(nodes)) {
    const props = { label: n.label }

    if (n.label.startsWith('well-known value')) props.fontsize = '24pt'

    if (n.isProxy) props.label += `\n(proxy)`
    else if (!n.linksFollowed) props.label += '\n(maximum depth reached)'

    if (typeof n.value === 'function') {
      props.shape = 'rect'
      props.labeljust = 'l'
    }

    add(n.id, props)
  }

  for (const e of edges) {
    const props = { label: e.label }
    add(`${e.from} -> ${e.to}`, props)
  }

  chunks.push('}')

  return chunks.join('\n') + '\n'
}

try {
  process.argv.slice(3).forEach(text => addValueToGraph(eval(text)))
  console.log(renderDot())
  // addValueToGraph({ n: 7, s: "foo" })
  // require('fs').writeFileSync('dump-js-value.dot', renderDot())
  // console.log('updated dump-js-value.dot')
} catch (e) {
  console.log({ nodes, edges })
  console.log({ e })
  process.exit(1)
}
