#!/bin/bash

# Builds Docker images for Savu API (-api) and NGINX (-web) containers.

ORG="dannixon"
PROJECT="hebi"

docker build \
  --tag "${ORG}/${PROJECT}-web" \
  web

docker build \
  --tag "${ORG}/${PROJECT}-api" \
  api
