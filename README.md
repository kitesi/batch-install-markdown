# Batch Install Markdown

Install links from markdown lists. Can read from files or clipboard. Uses youtube-dl internally, so you will need that.

Example:

```
- [Bad Instagram: Life Runining Challenges](https://www.youtube.com/watch?v=uw0U-26WmDc)
- [I Took A Terrifying Masterclass](https://www.youtube.com/watch?v=aDtnSrGq9dM)
```

This will install both youtube videos, with their respective name.

## Installation

```
npm i -g batch-install-markdown
```

## Usage

`bimd [files..]`

`--output | -o <string>` the directory to write it, default is the current folder you are in

`--use-clipboard | -c` read the markdown content from clipboard rather than files

`--dry-run | -d` dry run, don't install anything

`--ytdl-args | -y <string>` arguments to pass onto youtube-dl

`--format | -f <string>` specify the format to install
