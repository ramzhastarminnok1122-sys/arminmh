#!/bin/bash
KEY="44394E62627566762F6B444833635067596C44633466772B415A3852352F376F7633556B656A43646534593D"
SENDER="0018018949161"
TO="09378905454"
MSG="test"

echo "=== Without Sender ==="
curl -s "https://api.kavenegar.com/v1/$KEY/sms/send.json?receptor=$TO&message=$MSG"
echo ""
echo "=== With Sender ==="
curl -s "https://api.kavenegar.com/v1/$KEY/sms/send.json?receptor=$TO&message=$MSG&sender=$SENDER"
