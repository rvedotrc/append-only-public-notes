# local-statsd

Run a mock Datadog `statsd` APM server.

Prerequisites: Ruby (see `.ruby-version`); `jq`.

Usage:

```shell
bundle install
bundle exec ./local-statsd
```

You may with to filter the output through `./show-posted-data`:

```shell
bundle exec ./local-statsd | ./show-posted-data
```
