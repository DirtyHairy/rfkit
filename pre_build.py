import subprocess

subprocess.run("yarn build", cwd="./web", shell=True)
subprocess.run(
    "gzip --best -c web/dist/index.html > web/dist/index.html.gz", shell=True)
subprocess.run(
    "xxd -i web/dist/index.html.gz | sed 's/unsigned char/const char/g' > src/index_html.h", shell=True)
