#!/bin/sh

# Called by DRMAA job submissions and used to bootstrap Savu jobs on the
# cluster

echo "Running on host: `hostname`"
echo "Args: $@"

. /etc/profile.d/modules.sh
module load savu/master

savu_mpi_local $@
