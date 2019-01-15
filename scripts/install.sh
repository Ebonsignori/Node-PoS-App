#!/bin/bash
set -x

# Import and decrypt the encrypted SSH key
openssl aes-256-cbc -K $encrypted_001fae338dd8_key -iv $encrypted_001fae338dd8_iv -in id_rsa_node_pos_deploy.enc -out id_rsa_node_pos_deploy -d
rm id_rsa_node_pos_deploy.enc
chmod 600 id_rsa_node_pos_deploy
mv id_rsa_node_pos_deploy ~/.ssh/id_rsa

