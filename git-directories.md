# git directory-finding

```
$ git rev-parse --git-dir
.git
$ git rev-parse --absolute-git-dir
/Users/rachel/git/github.com/rvedotrc/append-only-public-notes/.git
$ git rev-parse --show-toplevel
/Users/rachel/git/github.com/rvedotrc/append-only-public-notes

$ git rev-parse --is-inside-git-dir
false
$ git rev-parse --is-inside-work-tree
true
$ git rev-parse --is-bare-repository
false
$ git rev-parse --is-shallow-repository
false
```

`git rev-parse --show-toplevel` - top directory (fails in a bare repo)

`git rev-parse --git-dir` - usually top directory plus `/.git`

`git rev-parse --show-prefix` - the empty string if you're at the root, `foo/` if you're in the `foo/` directory, and so on

All of the above fail if you're neither in a worktree nor a git directory
