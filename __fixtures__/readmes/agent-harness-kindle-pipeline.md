# agent-harness-kindle-pipeline

Subprocess-orchestrates the kindle-pipeline tools. Source PDF → Marker → figure scan → book-builder PDF + Obsidian export.

## Install

```bash
uv tool install --editable D:/agent-harness-kindle-pipeline
```

## Usage

```bash
process-book --config books.json --book moby-dick
```
