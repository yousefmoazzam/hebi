from kubernetes import client
from kubernetes.client.rest import ApiException


def user_pod_name(uid):
    return "uid{}".format(uid)


def user_pod_manifest(uid, gid):
    return {
        "apiVersion": "v1",
        "kind": "Pod",
        "metadata": {
            "name": user_pod_name(uid),
            "labels": {
                "hebi-role": "user-pod",
                "hebi-user": str(uid),
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


def user_pod_service_manifest(uid):
    return {
        "apiVersion": "v1",
        "kind": "Service",
        "metadata": {
            "name": user_pod_name(uid),
            "labels": {
                "hebi-role": "user-pod-expose",
                "hebi-user": str(uid),
            },
        },
        "spec": {
            "type": "NodePort",
            "selector": {
                "hebi-role": "user-pod",
                "hebi-user": str(uid),
            },
            "ports": [
                {
                    "port": 80,
                    "targetPort": 80,
                },
            ],
        },
    }


def start_user_pod(kube, namespace, uid, gid):
    kube.create_namespaced_pod(
        body=user_pod_manifest(uid, gid), namespace=namespace)

    kube.create_namespaced_service(
        body=user_pod_service_manifest(uid), namespace=namespace)


def stop_user_pod(kube, namespace, uid, gid):
    kube.delete_namespaced_pod(
        name=user_pod_name(uid),
        body=client.V1DeleteOptions(),
        namespace=namespace)

    kube.delete_namespaced_service(
            name=user_pod_name(uid),
        body=client.V1DeleteOptions(),
        namespace=namespace)
