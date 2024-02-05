#!/bin/sh

./build.sh

if [ $? -ne 0 ]; then
  echo ">> Error building contract"
  exit 1
fi
near dev-deploy --wasmFile ./target/wasm32-unknown-unknown/release/pay_near.wasm