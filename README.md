# NoDB

A working template for a Svelte / Sapper web app which uses GitHub as
the back end and Firebase for authentication. HOWTO set it up is [here](./HOWTO.md).

The "NoDB" name is a bit extreme. In practice, a site would maintain it own
database (or use a cloud DB such as Firebase) for indexing, processing,
performance, etc. But this template shows that a database isn't actually
_necessary_. 

That may sound silly and pointless -- but a model wherein a git repository is
the ultimate source of truth for user data has some interesting consequences:
* An app acts more as a filter than a silo; you can point it to _any_ public
repo, and if the data there matches the expected format, it will be processed
and displayed accordingly.
* Users can log in with GitHub and subsequently have their data saved to a
personal repo, instead of a common one, using their OAuth token.
* Such users literally own their data, and can decide who to share it with,
using GitHub's panoply of access controls. They -- and any other people and
services they choose -- can also use GitHub's collaborative tools to
fork / edit / pull-request / merge changes.
* Users automatically get git's versioning etc.; can use git to get live copies
of their data at any time, without having to request it; and can easily move
their data between competing services, or from GitHub to another repo host.

Imagine if Facebook followed this model. Then all your Facebook data,
everything you'd ever posted or commented, would be in a git repository you
controlled. Facebook would have a copy too, of course, for efficient
processing and indexing; but you wouldn't have to rely on them to access it.
Other companies could offer services letting you mine and search your own
data, and provide alternative interfaces to it.

An analogy: there are lots of services like Plaid, Mint, etc., which access
your banking information on your behalf, via OAuth tokens or just straight-up
using your passwords. This is an example of (the secure version of) that,
treating your data like your money. Here, GitHub is the data bank, and you
choose which services to share data with. You can't stop them from keeping a
copy - but you _can_ stop them from _owning_ your data, so that you can easily
move to a competitor, or use this data for multiple services at the same time.

I call this the "self-hosted data" model. It's pretty surprising that I can't
think of any other sites/services which use it. There's Blockstack... but
there's zero reason for any cryptocurrency here. For-profit companies are
obviously opposed to anything which crumbles the moat that keeps users with
them, but even open-source / nonprofit organizations don't seem to do it.
