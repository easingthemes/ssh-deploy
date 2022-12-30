FROM nginx
# Set args to get from Gtihub Action
ARG ssh_pub_key
ARG ssh_user
# Add a user to the container
RUN adduser --disabled-password $ssh_user
# USER $ssh_user
# Add the ssh public key to the container
RUN mkdir -p /home/$ssh_user/.ssh
RUN echo "$ssh_pub_key" > /home/$ssh_user/.ssh/authorized_keys
RUN chmod 700 /home/$ssh_user/.ssh
# Start server
EXPOSE 80
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]
