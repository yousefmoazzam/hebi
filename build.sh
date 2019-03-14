#!/bin/bash

docker build \
  --tag dannixon/hebi-web \
  webapp

docker build \
  --tag dannixon/hebi-api \
  webservice
