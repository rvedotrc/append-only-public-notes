# Git

The bits of git that I sometimes struggle to remember / find.

## rev-parse

`foo^{tree}` == `foo:`. The tree, of tree-ish `foo`.

## Manually creating a commit

`git commit-tree [-p PARENT ...] [-m MESSAGE] TREE` 

and prints the commit id.

For example:

```shell
git checkout main
git reset --hard $( git commit-tree HEAD: -m 'Lose all the history' )
```

## Ref manipulation

