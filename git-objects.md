# Git

The bits of git that I sometimes struggle to remember / find.

## rev-parse

`foo^{tree}` == `foo:`. The tree, of tree-ish `foo`.

### directory-finding

See [git-directories](./git-directories.md).

## Manually adding a blob

```shell
echo hello | git hash-object -w --stdin
```

Prints the blob id.

Or, to add existing files:

```shell
git hash-object -w FILE ...
```

## Manually creating a tree

The empty tree:

```shell
git mktree < /dev/null
```

Prints the tree id.

A tree containing a single blob:

```
git mktree <<TREE
100644 blob 9705bd6c7091d72d3e38b7782ddfa179adbd9362	README.md
TREE
```

where that's a tab between the blob id and the path.

## Manually creating a commit

```shell
git commit-tree [-p PARENT ...] [-m MESSAGE] TREE
```

Prints the commit id.

For example:

```shell
git checkout main
git reset --hard $( git commit-tree HEAD: -m 'Lose all the history' )
```

## Ref manipulation

```shell
git update-ref refs/heads/new-branch COMMIT
```

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

## worktrees

In additional worktrees, `.git` isn't a directory, it's a text file:

```text
gitdir: /private/tmp/main-checkout/.git/worktrees/my-worktree
```

That directory is a form of git dir, but without a `config`.
`./commondir` points to "parent" git dir:

```shell
$ cat commondir
../..
```
