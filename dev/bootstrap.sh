apt-get update
# Make it possible to add PPA sources.
apt-get install python-software-properties -y

# Add sources for what we want to install
wget -q -O - http://packages.elasticsearch.org/GPG-KEY-elasticsearch | apt-key add -
echo "deb http://packages.elasticsearch.org/elasticsearch/1.1/debian stable main" | tee -a /etc/apt/sources.list
add-apt-repository ppa:rwky/redis -y
sudo add-apt-repository ppa:couchdb/stable -y
curl -sL https://deb.nodesource.com/setup | bash -

# Install stuff we need. And some stuff that might come in handy.
apt-get install openjdk-7-jre redis-server nodejs couchdb elasticsearch g++ git -y

# Fix a couple of potential permission problems. Not really production values, these...
sudo chmod o+w /var/run/couchdb/couch.uri
sudo chmod o+r /etc/couchdb/local.ini

# Create swapfile of 1GB with block size 1MB
/bin/dd if=/dev/zero of=/swapfile bs=1024 count=1048576

# Set up the swap file
/sbin/mkswap /swapfile

# Enable swap file immediately
/sbin/swapon /swapfile

# Enable swap file on every boot
/bin/echo '/swapfile          swap            swap    defaults        0 0' >> /etc/fstab

# Make elasticsearch available in PATH
echo 'PATH="/usr/share/elasticsearch/bin/:$PATH"' | tee -a /home/vagrant/.bashrc

# Make vagrant user start in /vagrant
echo 'cd /vagrant' | tee -a /home/vagrant/.bashrc
