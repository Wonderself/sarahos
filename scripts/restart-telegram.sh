#!/bin/bash
# Restart Freenzy Telegram Bot
# Run on VPS: ssh hetzner-vps 'bash /root/projects/freenzy/sarahos/scripts/restart-telegram.sh'

echo "Restarting Freenzy Telegram Bot..."
sudo systemctl restart freenzy-telegram-bot.service
sleep 2
echo "Status:"
sudo systemctl status freenzy-telegram-bot.service --no-pager -l
echo ""
echo "Recent logs:"
sudo journalctl -u freenzy-telegram-bot.service -n 20 --no-pager
