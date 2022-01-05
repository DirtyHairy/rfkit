import subprocess
import os
import sys

os.chdir(os.path.dirname(sys.argv[0]))

subprocess.run("yarn build", cwd="./web", shell=True)
subprocess.run(
    "gzip --best -c web/dist/index.html > web/dist/index.html.gz", shell=True)
subprocess.run(
    "xxd -i web/dist/index.html.gz | sed 's/unsigned char/const char/g' > main/index_html.h", shell=True)
