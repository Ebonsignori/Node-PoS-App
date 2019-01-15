#!/bin/bash
set -x

# Import and decrypt the encrypted SSH key
openssl aes-256-cbc -K $encrypted_001fae338dd8_key -iv $encrypted_001fae338dd8_iv -in deploy_key.enc -out deploy_key -d
# Remove existing key, set privileges, and rename into ~/.ssh as default key, id_rsa
rm deploy_key.enc
chmod 600 deploy_key
mv deploy_key ~/.ssh/id_rsa

