# Remove the event handlers from all `a` elements

```javascript
[...document.getElementsByTagName("a")].forEach(a => { const span = a.ownerDocument.createElement("span"); span.innerHTML = a.outerHTML; a.parentNode.replaceChild(span, a) })
```

Turn the results of `document.evaluate` into iterables:

```shell
const nodeIteratorToGenerator = function *(i) { let node; while (node = i.iterateNext()) { yield node } }

const nodeSnapshotToGenerator = function *(s) { let i; for (i=0; i<s.snapshotLength; ++i) { yield s.snapshotItem(i) } } 
```
