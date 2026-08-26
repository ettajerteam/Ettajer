# Dr Sara Autonomy

## Levels

- `OBSERVE`
- `RECOMMEND`
- `APPROVAL_REQUIRED`
- `CONTROLLED_AUTO`

## Defaults

- Platform default: observe/recommend with **approval required** for execute
- `CONTROLLED_AUTO` policy: **DISABLED**
- `autoExecute`: **false** (hard invariant)
- Kill switch DISABLED blocks V9 EXECUTE

Even when an intervention would qualify for CONTROLLED_AUTO
(low risk, high confidence, reversible, strong history, low blast),
V10 demotes to APPROVAL_REQUIRED unless policy is explicitly enabled.

Intelligence never authorizes execution.
