#!/usr/bin/env python3

import click
from kubernetes import config, client

import pod

config.load_kube_config()
kube = client.CoreV1Api()


@click.group()
@click.option("--uid", "-u", type=int)
@click.option("--gid", "-g", type=int)
@click.option("--namespace", default="tux")
@click.pass_context
def cli(ctx, uid, gid, namespace):
    ctx.ensure_object(dict)

    ctx.obj["uid"] = uid
    ctx.obj["gid"] = uid if gid is None else gid
    ctx.obj["namespace"] = namespace

    click.echo("Using UID={}, GID={}".format(ctx.obj["uid"], ctx.obj["gid"]))


@cli.command()
@click.pass_context
def start(ctx):
    uid, gid, ns = ctx.obj["uid"], ctx.obj["gid"], ctx.obj["namespace"]
    rv = pod.start_user_pod(kube, ns, uid, gid)
    click.echo(rv)


@cli.command()
@click.pass_context
def stop(ctx):
    uid, gid, ns = ctx.obj["uid"], ctx.obj["gid"], ctx.obj["namespace"]
    rv = pod.stop_user_pod(kube, ns, uid, gid)
    click.echo(rv)


if __name__ == "__main__":
    cli()
