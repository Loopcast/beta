# include all files from /etc/icecast.d/ configuration
# <include>/etc/icecast.d/*.xml"</include>

#https://forum.sourcefabric.org/discussion/16622/tips-to-build-icecast-kh-ubuntu/p1


###

We need to downoad the file: 
wget https://github.com/karlheyes/icecast-kh/archive/icecast-2.3.3-kh10.tar.gz
Unzip the file:
tar xzf icecast-2.3.3-kh10.tar.gz
Change to the directory created:
cd icecast-kh-icecast-2.3.3-kh10
Download and install some required repositories:
sudo apt-get install libxslt1-dev libcurl4-openssl-dev libvorbis-dev
Set up and install:
./configure
  *check for errors in output as you may need to fix this or the next 2   commands wont work
make
sudo make install

NB: Your old icecast file will be in /usr/bin/icecast2
Your new icecast file will be in /usr/local/bin/icecast

You will need to edit the following file:
/etc/init.d/incecast2

Change DEAMON=/usr/bin/icecast2 to /usr/local/bin/icecast
Stop the old Icecast Server:
/etc/init.d/icecast2 stop
You can use the existing XML for specific changes */etc/icecast2/icecast.xml
Now reboot your server and log into your icecast at IP:8000 and in version you should see the KH suffix!



