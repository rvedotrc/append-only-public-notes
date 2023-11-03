# Remove the event handlers from all `a` elements

```javascript
[...document.getElementsByTagName("a")].forEach(a => { const span = a.ownerDocument.createElement("span"); span.innerHTML = a.outerHTML; a.parentNode.replaceChild(span, a) })
```
