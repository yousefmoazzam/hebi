#!/usr/bin/env python3

import ldap


def query_username(username):
    """
    Gets user details given a users username/Fed ID.
    """
    # Use the STFC LDAP server (it has been the most reliable)
    cclrc_ldap = ldap.initialize("ldap://altfed.cclrc.ac.uk")
    cclrc_ldap.simple_bind_s()

    try:
        # Search by username (common name)
        result = cclrc_ldap.search_s("dc=fed,dc=cclrc,dc=ac,dc=uk",
                                     ldap.SCOPE_SUBTREE,
                                     "(cn={})".format(username))
    except ldap.TIMEOUT:
        return None

    return result[0][1]


def surname(user):
    """
    Gets the users surname(s) from their queried details.
    """
    return [n.decode('utf-8') for n in user["sn"]]


def given_name(user):
    """
    Gets the users given name(s) from their queried details.
    """
    return [n.decode('utf-8') for n in user["givenName"]]


def uid_gid(user):
    """
    Gets the users UNIX user and group IDs from their queried details.
    """
    uid = int(user["uidNumber"][0])
    gid = int(user["gidNumber"][0])
    return (uid, gid)


if __name__ == "__main__":
    # Usage: user_info_ldap.py [username]

    # Get details for a given user
    import sys
    user = query_username(sys.argv[1])

    # Print their full name
    name = " ".join(given_name(user)), " ".join(surname(user))
    print("{} {}".format(*name))

    # Print their UNIX IDs
    ids = uid_gid(user)
    print("UID: {}\nGID: {}".format(*ids))
