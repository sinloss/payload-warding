#!/bin/bash

WORKSPACE="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../..; pwd)"

[[ ! -e "$WORKSPACE/.vscode/context" ]] && {
    echo "MONGO_SVR=warding"
    echo "MONGO_PORT_LOCAL=27017"
    echo "MONGO_PORT_REMOTE=27017"
    echo "MONGO_ADDRESS_REMOTE=127.0.0.1"
} > "$WORKSPACE/.vscode/context"

. "$WORKSPACE/.vscode/context"

ssh -vNL \
    ${MONGO_PORT_LOCAL:-27017}:${MONGO_ADDRESS_REMOTE:-127.0.0.1}:${MONGO_PORT_REMOTE:-27017} \
    ${MONGO_SVR:-warding}