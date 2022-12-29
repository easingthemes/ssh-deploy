FROM nginx
# Set args to get from Gtihub Action
ARG ssh_pub_key
ARG ssh_user
# Add a user to the container
RUN adduser -D $ssh_user
USER $ssh_user
# Add the ssh public key to the container
RUN mkdir -p $HOME/.ssh
RUN echo "$ssh_pub_key" > $HOME/.ssh/authorized_keys
RUN chmod 700 $HOME/.ssh
