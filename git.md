# Git

The bits of git that I sometimes struggle to remember / find.

## rev-parse

`foo^{tree}` == `foo:`. The tree, of tree-ish `foo`.

## Manually adding a blob

`echo hello | git hash-object -w --stdin`

Prints the blob id.

Or, `echo hello | git hash-object -w FILE ...` to add existing files.

## Manually creating a tree

The empty tree: `git mktree < /dev/null`

A tree containing a single blob:

```
git mktree <<TREE
100644 blob 9705bd6c7091d72d3e38b7782ddfa179adbd9362	README.md
TREE
```

where that's a tab between the blob id and the path.

Prints the tree id.

## Manually creating a commit

`git commit-tree [-p PARENT ...] [-m MESSAGE] TREE` 

Prints the commit id.

For example:

```shell
git checkout main
git reset --hard $( git commit-tree HEAD: -m 'Lose all the history' )
```

## Ref manipulation

`git update-ref refs/heads/new-branch COMMIT`

## Ridiculous example

```shell
git update-ref refs/heads/hello $(
  git commit-tree -m Hello $(
    echo "100644 blob $(
      echo hello | git hash-object -w --stdin
    )\thello.txt" | git mktree
  )
) && git push origin --force hello:main
```
