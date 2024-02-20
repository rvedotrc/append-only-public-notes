# local-statsd

Run a mock Sentry server (event sink).

Prerequisites: Ruby (see `.ruby-version`); `jq`.

Usage:

```shell
bundle install
bundle exec ./local-sentry
```

You may with to filter the output through `./show-posted-data`:

```shell
bundle exec ./local-sentry | ./show-posted-data
```
