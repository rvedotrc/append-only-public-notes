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

```shell
for command completion in ${(kv)_comps:#-*(-|-,*)}                                                                                                        ✔  08:46:30 
do
    printf "%-32s %s\n" $command $completion
done | sort
```

`${_comps}` is the completions associative array. `(kv)` lists both keys and values.

