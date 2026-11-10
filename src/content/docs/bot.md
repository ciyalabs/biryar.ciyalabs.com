---
title: BiryarBot
description: What the request from BiryarBot in your server log is, what it reads, and how to decline it.
---

If this page is in your server log, a seller running Biryar on their own
computer asked it to read your shop's public product pages, to compare your
shelf prices with Amazon's. The request identified itself as

```
BiryarBot/0.1 (+https://biryar.ciyalabs.com/bot)
```

**What it does.** It reads `robots.txt` first and honours every rule in it.
It fetches public category and product pages only, never a basket, an
account or a checkout. It waits at least three seconds between two
requests to the same shop, and it caches what it read so the same page is
not asked for again within a day. It does not pretend to be a browser.

**Where it runs from.** There is no central crawler. Each request comes
from the computer of the seller who runs Biryar, and only for the shops
that seller chose. Ciya Labs operates none of them and sees none of the
traffic.

**To decline it**, add to your `robots.txt`:

```
User-agent: BiryarBot
Disallow: /
```

Every copy of Biryar reads that on its next visit and stops. A shop that
answers requests with an error is treated the same way, and the seller is
told the shop refused rather than that something broke.

Questions: [info@ciyalabs.com](mailto:info@ciyalabs.com?subject=BiryarBot).
