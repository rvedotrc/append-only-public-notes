# zsh

# Arrays

```shell
typeset -a name
```

# Associative arrays

```shell
typeset -A name
```

```shell
set -A name value ...
name=(value ...)
name=([key]=value ...)

```

## Associative arrays

```shell
set -A name
name=()

set -A name key value ...
name=(key value ...)
name=([key]=value ...)

name+=(key value ...)
name+=([key]=value ...)
```

## List command completions

It's in `_comps`.

```shell
for command completion in ${(okv)_comps:#-*(-|-,*)}
do
    printf "%-32s %s\n" $command $completion
done
```

`${_comps}` is the completions associative array. `(kv)` lists both keys and values.

To remove the completion for command `foo`:

```
unset '_comps[foo]'
```

## List functions

It's in `functions`.

Names, ordered:

```shell
print -l ${(ok)functions}
```
