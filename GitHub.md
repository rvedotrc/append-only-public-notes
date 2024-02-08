# `gh` hacking

## For each open PR: some summary info, plus the "first" 100 affected paths

```shell
gh api graphql --paginate -f query='
  query open_prs($endCursor: String) {
    repository(owner: "zendesk", name: "help_center") {
      pullRequests(first: 30, after: $endCursor, states: [OPEN]) {
        pageInfo { hasNextPage endCursor }
        nodes { url number state title files(first: 100) { nodes { path } } }
      }
    }
  }
' | jq -c '.data.repository.pullRequests.nodes[]'
```
