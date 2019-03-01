#!/bin/bash

export PYTHONPATH=/webservice:$PYTHONPATH

# Run unit tests first, launch server if tests pass
cd /webservice && \
    pytest && \
    python -m webservice /webservice/config_dev.json
