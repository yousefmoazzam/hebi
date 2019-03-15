from kubernetes import config, client
from kubernetes.client.rest import ApiException

savu_ws_namespace = "tux"

config.load_kube_config()
kube = client.CoreV1Api()


def user_pod_name(uid, gid):
    return "pod-for-uid{}-gid{}".format(uid, gid)


def user_pod_manifest(uid, gid):
    return {
        "apiVersion": "v1",
        "kind": "Pod",
        "metadata": {
            "name": user_pod_name(uid, gid),
            "labels": {
                "hebi-role": "user-pod",
            },
        },
        "spec": {
            "containers": [
                {
                    "name": "dataserver",
                    "image": "dannixon/dawn-dataserver:latest",
                    "volumeMounts": [
                        {
                            "mountPath": "/data",
                            "name": "vol-dlstmp",
                            "readonly": True,
                            "subPath": "ibn32760",
                        },
                    ],
                },
                {
                    "name": "api",
                    "image": "dannixon/hebi-api:latest",
                    "env": [
                        {
                            "name": "PUID",
                            "value": str(uid),
                        },
                        {
                            "name": "PGID",
                            "value": str(gid),
                        },
                    ],
                    "volumeMounts": [
                        {
                            "mountPath": "/data",
                            "name": "vol-dlstmp",
                            "subPath": "ibn32760",
                        },
                    ],
                },
                {
                    "name": "web",
                    "image": "dannixon/hebi-web:latest",
                    "env": [
                        {
                            "name": "TZ",
                            "value": "Eurpoe/London",
                        },
                        {
                            "name": "PUID",
                            "value": str(uid),
                        },
                        {
                            "name": "PGID",
                            "value": str(gid),
                        },
                    ],
                },
            ],
            "volumes": [
                {
                    "name": "vol-dlstmp",
                    "persistentVolumeClaim": {
                        "claimName": "dlstmp",
                    },
                },
            ],
        },
    }


def start_user_pod(uid, gid):
    rv = kube.create_namespaced_pod(
        body=user_pod_manifest(uid, gid), namespace=savu_ws_namespace)
    return rv


def stop_user_pod(uid, gid):
    rv = kube.delete_namespaced_pod(
        name=user_pod_name(uid, gid),
        body=client.V1DeleteOptions(),
        namespace=savu_ws_namespace)
    return rv
