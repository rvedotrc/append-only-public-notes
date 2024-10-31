# List vaults

`op vault list` doesn't show all fields. In particular, `type` is missing. Therefore:

```
op vault list --format=json | op vault get - --format=json
```

# Dump all items

```
op item list --format=json | op item get - --format=json
```
