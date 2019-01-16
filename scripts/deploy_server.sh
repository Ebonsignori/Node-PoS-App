#!/bin/bash
set -x

if [ $TRAVIS_BRANCH == 'master' ] ; then
    # Add remote to known_hosts
    ssh-keyscan -H 157.230.152.107 >> ~/.ssh/known_hosts
    # Push repo to DigitalOcean server using git
    git remote add deploy "root@157.230.152.107:/root/app"
    git config user.name "Travis CI"
    git config user.email "evanbonsignori+travisCI@yahoo.com"
    # Stash changes, then remove the stash (unneeded in CI VM)
    git stash save --keep-index --include-untracked
    git stash drop
    git push --force deploy master
else
    echo "Not deploying, since this branch isn't master."
fi