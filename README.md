# obsidian-wayback-machine

[![ci](https://github.com/loozhengyuan/obsidian-wayback-machine/actions/workflows/ci.yml/badge.svg)](https://github.com/loozhengyuan/obsidian-wayback-machine/actions/workflows/ci.yml)

Converts web links in Obsidian to Wayback Machine links.

## Installation

> [!NOTE]
> This plugin is not available in the
> [Obsidian Plugin Directory](https://obsidian.md/plugins) yet so it needs to be
> installed manually.

To install this plugin, start by cloning the repository:

```shell
git clone https://github.com/loozhengyuan/obsidian-wayback-machine.git
```

__NOTE_: You may either move the repository to your `.obsidian/plugins`
directory, or create a symbolic link._

Next, ensure you have [Deno](https://deno.com) installed and run the following
command to build the `main.js` file:

```shell
deno task build
```

Finally, refresh your plugins directory in Obsidian and enable the plugin.

## License

[MIT](https://choosealicense.com/licenses/mit/)
