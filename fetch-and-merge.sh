#!/bin/bash

set -e
git fetch https://github.com/kiki-kanri/bun-template main
git merge FETCH_HEAD
