# Kubernetes deployment

The Kubernetes deployment is in two parts:

- Deployment of a pod consisting of everything required to support a single user
- Deployment of a service to allow that user access to their pod

## User pod

A "user pod" is comprised of three containers:

- `api`: The web API for Savu (build from `api`)
- `dataserver`: DAWN running in data server mode (image from
  [here](https://github.com/DanNixon/dockerfiles/tree/master/dawn-dataserver))
- `web`: NGINX serving static web content and reverse proxying the above two
  webservices (built from `web`)

The `api` and `dataserver` containers require having data mounted form whatever
filesystem stores the experimental data and the users process lists, these are
to be mounted via Kubernetes' volume drivers. `api` requires read/write access
and `dataserver` only requires read access.

Both the `api` and `dataserver` containers should be provided with the target
users UNIX user and group IDs to ensure that filesystem permissions are
respected. While the `web` container has the mechanics for setting user and
group IDs it is not required as no volumes are mounted on that container.

At both STFC and DLS this information can be retrieved from an LDAP query using
the target users federal ID/username.

(the filesystem I have used at DLS (where `/dls/tmp` is located) appears to
disallow operations as `root`, this provides an additional safety net in the
event of a permission escalation to `root` within the container)

## Access via service

For development a NodePort service can be used to expose port 80 on the user pod
to a random port on the node it is running on. For a limited number of user pods
on the single node of the Kubernetes test "cluster" this is sufficient.

## Deployment

The `pod_launcher` directory contains a simple command line application to
launch and stop the pod and service for a given user.

The script requires Python 3 and dependencies to be installed using `pip install
-r requirements.txt`.

To deploy for the current user one can use:
```sh
./main.py --uid `id -u` start
```

Full usage and flags can be shown using `./main.py --help`.
