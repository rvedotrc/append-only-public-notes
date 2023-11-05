const maxDepth = 3

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

  return addNode({ id: `proxyOut${type}${seq()}`, label, isProxy: true })
}

const functionProto = Reflect.getPrototypeOf(addNode)
const functionConst = Reflect.constructor(addNode)
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
  let v

  v = doCatch(() => Reflect.getPrototypeOf(value))
  if (v.ok) {
    edges.push({ from: parentNode.id, to: childNodeFor(v.value, 'Reflect.getPrototypeOf').id, label: 'Reflect\nprototype' })
  }

  v = doCatch(() => Reflect.constructor(value))
  if (v.ok) {
    edges.push({ from: parentNode.id, to: childNodeFor(v.value, 'Reflect.constructor').id, label: 'Reflect\nconstructor' })
  }

  v = doCatch(() => value.__proto__)
  if (v.ok) {
    edges.push({ from: parentNode.id, to: childNodeFor(v.value, '__proto__').id, label: '__proto__' })
  }

  v = doCatch(() => value.constructor)
  if (v.ok) {
    edges.push({ from: parentNode.id, to: childNodeFor(v.value, 'constructor').id, label: 'constructor' })
  }

  const keys = doCatch(() => Reflect.ownKeys(value))

  if (keys.ok) {
    for (const key of [...keys.value].sort((a, b) => a.toString().localeCompare(b.toString()))) {
      // Don't go too far along strings
      if (typeof key === 'string' && parseInt(key) >= 3) continue

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

      edges.push({ from: parentNode.id, to: valueNode.id, label: JSON.stringify(key) })
    }
  }

  node.linksFollowed = true
  return node
}

const addValueToGraph = (value, path = [], depth = 0) => {
  if (value === null) return addNode({ id: `null${seq()}`, label: 'null' })
  if (value === undefined) return addNode({ id: `undefined${seq()}`, label: 'undefined' })

  console.log(`${depth}   ${JSON.stringify(path)}`)

  if (typeof value === 'object' || typeof value === 'function') {
    for (const n of Object.values(nodes)) {
      if (Object.is(value, n.value)) return maybeWithLinks(n, path, depth)
    }
  }

  const n = addNode({
    value,
    id: `n${seq()}`,
    label: (typeof value === 'string')
      ? wrap(`string: ${JSON.stringify(value)}`, 50)
      : `${typeof value}: ${value}`,
  })

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
    else if (!n.linksFollowed) props.label += '\n(truncated)'

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
  addValueToGraph(Function)
  require('fs').writeFileSync('dump-value.dot', renderDot())
  console.log('updated dump-value.dot')
} catch (e) {
  console.log({ nodes, edges })
  console.log({ e })
  process.exit(1)
}
