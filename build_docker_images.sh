#!/bin/bash

docker build \
  --tag dannixon/hebi-web \
  web

docker build \
  --tag dannixon/hebi-api \
  api
