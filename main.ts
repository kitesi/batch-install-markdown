#!/usr/bin/env node

import yargs from 'yargs';
import clipboard from 'clipboardy';
import * as path from 'path';
import { readFile } from 'fs/promises';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

interface Args {
    files?: string[];
    output?: string;
    useClipboard?: boolean;
    dryRun?: boolean;
    ytdlArgs?: string;
    format: string;
}

const exec = promisify(execCallback);

const args = yargs(process.argv.slice(2))
    .command({
        command: '$0 [files..]',
        describe:
            'takes in markdown files, extracts the item lists and downloads them in batch',
        builder: (y) => y,
        handler: () => {},
    })
    .option('output', {
        alias: 'o',
        describe: 'directory to write to',
        type: 'string',
    })
    .option('use-clipboard', {
        alias: 'c',
        describe: 'read from clipboard',
        type: 'boolean',
    })
    .option('ytdl-args', {
        alias: 'y',
        describe: 'arguments to pass onto youtube-dl',
        type: 'string',
    })
    .option('dry-run', {
        alias: 'd',
        describe: "dry run, don't install anything",
        type: 'boolean',
    })
    .option('format', {
        alias: 'f',
        describe: 'the foramt in which to install',
        default: 'm4a',
        type: 'string',
    })
    .parseSync() as Args;

const parseLineRegex = /\[(?<name>[^\]]*)\]\((?<link>[^)]*)/;
const isEmptyLineRegex = /^\s*$/;

function parseContent(content: string) {
    const promises: Promise<any>[] = [];

    for (const line of content.split(/\r?\n/)) {
        if (isEmptyLineRegex.test(line)) {
            continue;
        }

        const matches = line.match(parseLineRegex);

        if (
            !matches ||
            !matches.groups ||
            !matches.groups.name ||
            !matches.groups.link
        ) {
            console.log("Didn't match pattern: " + line);
            continue;
        }

        const { name, link } = matches.groups;

        if (!link.startsWith('http')) {
            console.log('Skipping since valid link not found: ' + line);
            continue;
        }

        console.log(`Installing ${name}\n${link}\n`);

        if (args.dryRun) {
            continue;
        }

        promises.push(
            exec(
                `youtube-dl -f ${args.format} -o "${path.join(
                    args.output || process.cwd(),
                    `${name}.%(ext)s`
                )}" ${args.ytdlArgs || ''} -- "${link}"`
            )
        );
    }

    return promises;
}

const files = args.files;

(async () => {
    if (args.useClipboard) {
        await Promise.all(parseContent(clipboard.readSync()));
    } else if (files) {
        const fileContents = await Promise.all(
            files.map((e) => readFile(e, 'utf-8'))
        );

        for (const content of fileContents) {
            parseContent(content);
        }
    } else {
        console.log('No content method provided, stdin not useable currently');
    }
})();
