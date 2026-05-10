# agent-tool-pr-reviewer

CLI producing `findings.json` + `review-output.md` from a local-branch diff. Uses Pydantic AI with OpenRouter.

## Install

```bash
uv tool install --editable D:/agent-tool-pr-reviewer
```

## Usage

```bash
agent-tool-pr-reviewer --base origin/main --output ./.ai-review/runs/
```

See [docs/MODELS.md](./docs/MODELS.md) for the model basket.
