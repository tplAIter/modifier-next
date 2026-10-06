#!/bin/sh
set -eu
source_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd -P)
test -f "$source_root/modifier.manifest.json" || { echo 'MODIFIER_PUBLICATION_SUBJECT_REQUIRED: immutable published React/Next content subjects are absent' >&2; exit 2; }
: "${CORE_DIR:?public core required}"
: "${NEXT_SOURCE_SUBJECTS:?actual producer source facts receipt required; caller JSON is not authority}"
echo 'MODIFIER_ADMISSION_REQUIRED: pure Parse/ResolveModifiers consumes captured subjects but the installed source/lifecycle adapter must authenticate them.' >&2
exit 2
