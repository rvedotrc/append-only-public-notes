# dtrace and dtruss

https://8thlight.com/insights/dtrace-even-better-than-strace-for-os-x

dtrace: low-level tool

dtruss: wrapper for dtrace

## Examples

```shell
sudo dtruss -t open_nocancel -p <PID>
```

So how to know what "-t" arguments there are?

```shell
sudo dtrace -ln 'syscall:::entry'
```

But we need to turn off System Integrity Protection for any of this.

Last time I tried this, the system rapidly beachballed. Maybe more trouble than it's worth.

https://derflounder.wordpress.com/2015/10/01/system-integrity-protection-adding-another-layer-to-apples-security-model/

`/System/Library/Sandbox/rootless.conf` defines files what SIP protects. Also, `/System/Library/Sandbox/Compatibility.bundle/Contents/Resources/paths`.

`ls -lO` shows protected files as `restricted`.

The tool used to manage SIP is `/usr/bin/csrutil`. Changes must be made via recovery mode.

`codesign -d --entitlements - /usr/bin/csrutil` shows entitlements.

`csrutil enable` (or `disable`) switches SIP on/off. `status` to show.

`csrutil enable --without dtrace` looks interesting, but it comes with a scary message.

Recovery with Apple silicon: nice and easy. Keep the power button pressed.
