FROM nginx

ARG SSH_PUB_KEY

RUN apt update

RUN apt install openssh-server rsync sudo -y

RUN echo "PubkeyAuthentication yes" >> /etc/ssh/sshd_config.d/pub.conf
RUN echo "AuthorizedKeysFile  .ssh/authorized_keys" >> /etc/ssh/sshd_config.d/pub.conf

RUN mkdir -p /var/www/html
RUN mkdir -p /var/www/html/test
RUN mkdir -p /var/www/html/test2
RUN chmod -R 775 /var/www/html

RUN useradd -rm -d /home/test -s /bin/bash -g root -G sudo -u 1000 test
RUN usermod -aG sudo test
RUN mkdir -p /home/test/.ssh
RUN echo "$SSH_PUB_KEY" > /home/test/.ssh/authorized_keys
RUN chmod 700 /home/test/.ssh
RUN chown -R test /home/test/.ssh

RUN useradd -rm -d /home/test2 -s /bin/bash -g root -G sudo -u 1002 test2
RUN usermod -aG sudo test2
RUN mkdir -p /home/test2/.ssh
RUN echo "$SSH_PUB_KEY" > /home/test2/.ssh/authorized_keys
RUN chmod 700 /home/test2/.ssh
RUN chown -R test2 /home/test2/.ssh

RUN service ssh start

RUN  echo 'test:test' | chpasswd
RUN  echo 'test2:test2' | chpasswd

EXPOSE 22

ADD entrypoint.sh /docker-entrypoint.d/entrypoint.sh
RUN chmod +x /docker-entrypoint.d/entrypoint.sh


CMD ["nginx", "-g", "daemon off;"]
