scp -r ./client/dist/* root@150.158.13.8:/usr/share/nginx/chat
scp -r ./serve/src/* root@150.158.13.8:/usr/share/nginx/chat-server/src
scp -r ./serve/app.js ./serve/package.json root@150.158.13.8:/usr/share/nginx/chat-server
