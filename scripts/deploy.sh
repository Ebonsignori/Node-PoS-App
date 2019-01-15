#!/bin/bash
set -x

if [ $TRAVIS_BRANCH == 'master' ] ; then
    # Add remote to known_hosts
    ssh-keyscan -H 157.230.152.107 >> ~/.ssh/known_hosts
    # Push repo to DigitalOcean server using git
    git remote add deploy "root@157.230.152.107:/home/deploy/app"
    git config user.name "Travis CI"
    git config user.email "evanbonsignori+travisCI@yahoo.com"
    git push --force deploy master
else
    echo "Not deploying, since this branch isn't master."
fi