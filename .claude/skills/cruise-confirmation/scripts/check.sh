#!/usr/bin/env bash
# Pre-flight checks for a filled cruise confirmation email.
# Usage: check.sh emails/confirmation-<client>.html
set -u

f="${1:?usage: check.sh <filled-confirmation.html>}"
[ -f "$f" ] || { echo "FAIL: no such file: $f"; exit 1; }

fail=0
err() { echo "FAIL: $1"; fail=1; }

# Unfilled template tokens (also catches the not-yet-deleted header comment).
if grep -qE '\{\{[A-Za-z0-9_]+\}\}' "$f"; then
  err "unfilled {{tokens}} remain: $(grep -oE '\{\{[A-Za-z0-9_]+\}\}' "$f" | sort -u | tr '\n' ' ')"
fi

# House voice: no em dashes, as entity or literal character. Recast the
# sentence rather than swapping in a comma, and never drop information to
# lose a dash. See CLAUDE.md, "Punctuation in outgoing writing".
if grep -qE '&mdash;|—' "$f"; then
  n=$(grep -oE '&mdash;|—' "$f" | wc -l | tr -d ' ')
  err "$n em dash(es) found. Use a semicolon, period, colon, commas, or &middot;"
  grep -nE '&mdash;|—' "$f" | cut -c1-140 | sed 's/^/       line /'
fi

# Brand Bible naming rule: the internal working name never ships.
if grep -qi 'aegean passport' "$f"; then
  err "'Aegean Passport' found — internal working name must never appear in output"
fi

# Transactional posture: no campaign machinery.
grep -qi 'unsubscribe' "$f" && err "unsubscribe reference found — confirmations are transactional"
grep -q 'utm_' "$f" && err "utm_ parameter found — confirmations must not carry campaign attribution"

# Placeholder-ish leftovers that suggest an unfinished fill.
if grep -qE 'TBD|FIXME|XXX|Lorem' "$f"; then
  err "unfinished-looking text found: $(grep -oE 'TBD|FIXME|XXX|Lorem' "$f" | sort -u | tr '\n' ' ')"
fi

# Tag balance — a dropped </td> renders as soup in Outlook.
for tag in table tr td div p; do
  o=$(grep -o "<$tag[ >]" "$f" | wc -l)
  c=$(grep -o "</$tag>" "$f" | wc -l)
  [ "$o" -eq "$c" ] || err "unbalanced <$tag>: $o open vs $c close"
done

# Identity present.
grep -q 'BON V:' "$f" || err "masthead identity 'BON V:' missing"
grep -q 'Luxury Voyage Advisor' "$f" || err "'Luxury Voyage Advisor' byline missing"

if [ "$fail" -eq 0 ]; then
  echo "OK: $f passes all confirmation checks"
fi
exit "$fail"
