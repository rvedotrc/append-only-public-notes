# The git http protocol

See _man gitprotocol-http_.

## List references

```shell
# Smart client:
curl -i -o - https://github.com/rvedotrc/append-only-public-notes/info/refs'?service=git-upload-pack'
```

# Read from the remote

using `git-upload-pack`.

Start with ref discovery: ```
POST $GIT_URL/info/refs?service=git-upload-pack
Content-Type: application/x-git-upload-pack-request
0032want 0a53e9ddeaddad63ad106860237bbf53411d11a7\n
0032have 441b40d833fdfa93eb2908e52742248faf0ee993\n
0000
