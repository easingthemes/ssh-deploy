FROM debian:9.5-slim

# Label
LABEL "com.github.actions.name"="ssh deploy"
LABEL "com.github.actions.description"="For deploying code over ssh"
LABEL "com.github.actions.icon"="truck"
LABEL "com.github.actions.color"="green"

LABEL "repository"="http://github.com/easingthemes/ssh-deploy"
LABEL "homepage"="https://github.com/easingthemes/ssh-deploy"
LABEL "maintainer"="Dragan Filipovic <info@frontenddot.com>"

# Copy entrypoint
ADD entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
