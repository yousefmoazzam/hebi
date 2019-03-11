#!/bin/bash

export PYTHONPATH=/webservice:$PYTHONPATH

python -m webservice /webservice/config_dev.json
