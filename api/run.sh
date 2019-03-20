#!/bin/bash

export PYTHONPATH=/webservice:$PYTHONPATH
python -m webservice /hebi_config.json
