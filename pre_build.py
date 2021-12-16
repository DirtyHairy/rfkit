import os

os.system("xxd -i web/index.html | sed 's/unsigned char/unsigned const char/g' > src/index_html.h")
