import os

os.system("gzip --best -c web/dist/index.html > web/dist/index.html.gz")
os.system("xxd -i web/dist/index.html.gz | sed 's/unsigned char/unsigned const char/g' > src/index_html.h")
