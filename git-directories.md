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
