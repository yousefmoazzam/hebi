#!/usr/bin/env python3

import click

import pod


@click.group()
@click.option("--uid", "-u", type=int)
@click.option("--gid", "-g", type=int)
@click.pass_context
def cli(ctx, uid, gid):
    ctx.ensure_object(dict)

    ctx.obj["uid"] = uid
    ctx.obj["gid"] = uid if gid is None else gid

    click.echo("Using UID={}, GID={}".format(ctx.obj["uid"], ctx.obj["gid"]))


@cli.command()
@click.pass_context
def start(ctx):
    user_id = ctx.obj["uid"], ctx.obj["gid"]
    rv = pod.start_user_pod(*user_id)
    click.echo(rv)


@cli.command()
@click.pass_context
def stop(ctx):
    user_id = ctx.obj["uid"], ctx.obj["gid"]
    rv = pod.stop_user_pod(*user_id)
    click.echo(rv)


if __name__ == "__main__":
    cli()
