printf 'Generating new server.key.'&&
mkdir certificates&&
openssl genrsa -des3 -passout pass:genus -out server.pass.key 2048&&
openssl rsa -passin pass:genus -in server.pass.key -out server.key&&
rm server.pass.key&&
printf 'PL\nWarsaw\nWarsaw\nGenusOne\nFinland\nGenusOne\noffice@genus.one\ngenus\nGenusOne\nGenusOne' | openssl req -new -key server.key -out server.csr&&
openssl x509 -req -sha256 -days 365 -in server.csr -signkey server.key -out server.crt&&
cat server.key