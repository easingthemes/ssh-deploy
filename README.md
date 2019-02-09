# rsync deployments

This GitHub Action deploys *everything* in `GITHUB_WORKSPACE` to a folder on a server via rsync over ssh. 

This action would usually follow a build/test action which leaves deployable code in `GITHUB_WORKSPACE`.

# Required SECRETs

This action needs a `DEPLOY_KEY` secret variable. This should be the private key part of an ssh key pair. The public key part should be added to the authorized_keys file on the server that receives the deployment.

# Required ARGs

This action can receive three `ARG`s:

1. The first is for any initial/required rsync flags, eg: `-avzr --delete`

2. The second is for any `--exclude` flags and directory pairs, eg: `--exclude .htaccess --exclude /uploads/`. Use "" if none required.

3. The third is for the deployment target, and should be in the format: `[USER]@[HOST]:[PATH]`

# Example usage

```
workflow "All pushes" {
  on = "push"
  resolves = ["Deploy to Staging"]
}

action "Deploy to Staging" {
  uses = "contention/action-rsync-deploy@master"
  secrets = ["DEPLOY_KEY"]
  args = ["-avzr --delete", "--exclude .htaccess --exclude /uploads/", "user@server.com:/srv/myapp/public/htdocs/"]
} 
```

## Disclaimer

If you're using GitHub Actions, you'll probably already know that it's still in limited public beta, and GitHub advise against using Actions in production. 

So, check your keys. Check your deployment paths. And use at your own risk.