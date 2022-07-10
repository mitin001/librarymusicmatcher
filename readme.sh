# install dependencies

## ffmpeg
cd /usr/local/bin
mkdir ffmpeg
cd ffmpeg
wget https://www.johnvansickle.com/ffmpeg/old-releases/ffmpeg-4.2.1-amd64-static.tar.xz
tar xvf ffmpeg-4.2.1-amd64-static.tar.xz
mv ffmpeg-4.2.1-amd64-static/ffmpeg .
ln -s /usr/local/bin/ffmpeg/ffmpeg /usr/bin/ffmpeg

## python
yum install gcc openssl-devel bzip2-devel libffi-devel
cd /opt
wget https://www.python.org/ftp/python/3.9.6/Python-3.9.6.tgz
tar xzf Python-3.9.6.tgz
cd Python-3.9.6
./configure --enable-optimizations 
make install

## nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash

## ts
cd ~
wget http://viric.name/soft/ts/ts-1.0.2.tar.gz
tar -xf ts-1.0.2.tar.gz
cd ts-1.0.2/
make
make install
ln -s /usr/local/bin/ts /bin/ts

## librarymusicmatcher (this repository)
cd ~
git clone git@github.com:mitin001/librarymusicmatcher.git
cd librarymusicmatcher
mkdir pklz # put .pklz files in there
mkdir precompute
mkdir tmp
mkdir public/archives
mkdir public/lookups
nvm install
nvm use
npm install

## audfprint
cd ~/librarymusicmatcher
git clone git@github.com:dpwe/audfprint.git
python3.9 -m pip install -r requirements.txt -t ./

## pm2
cd ~/librarymusicmatcher
nvm use
npm install pm2 -g

# start the server
cd ~/librarymusicmatcher
nvm use
pm2 start index.js --max-memory-restart 300M
