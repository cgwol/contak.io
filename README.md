### This is video which explains what does the Project is meant to do ####
https://www.youtube.com/watch?v=QxwC9-_CMa4

# Getting Started with Contak

## 1. Install PostgreSQL
NOTE: Currently using version 15.1.0.103
<br>
Download postgres for your platform at [https://www.postgresql.org/download/](https://www.postgresql.org/download/)

## 2. Install Docker

Download Docker Desktop for your platform at [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)

NOTE: the following commands should be ran in the project git directory
## 3. Install NPM Dependencies

### `npm install`

## 4. Download the most recent snapshot from the [Google Drive](https://drive.google.com/drive/folders/1qPBcYSMn-wFF5MfYE8ibuoCdjmojQCwV?usp=sharing)

Be sure to follow the instructions in "Development Snapshots/README" 

## 5. Start Local Development Environment

NOTE: If using VS Code, you can use the 'Start Node Dev' action in the Run and Debug menu to 
attach a debugger to the opened browser window
<br>
Troubleshooting: supabase access token does not work - use the Without dev.js instructions below
### `node dev.js`

## Without dev.js (manually run the process dev.js would have done)

## Start Local supabase containers (ie. 'the backend')
### `npx supabase start`

## Restore database state from most recent snapshot
NOTE: Windows users should replace / with \\
<br>
Troubleshooting: snaplet access token does not work - remove "projectID" line from .snaplet/config.json
### `npx snaplet snapshot restore --no-reset ./.snaplet/snapshots/SNPASHOT_ID`

## Restore database permissions (pg_dump does not capture roles/permissions)
### `psql --file=./supabase/permissions.sql postgresql://postgres:postgres@localhost:54322/postgres`

## Start Local Web Server and open it in the browser (ie. 'the frontend')
### `npx vite --open`

<br>

# Available Scripts

In the project directory, you can run:

### `npm start -- [--host]`

Runs the app in the development mode.\
Open in localhost to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

See [vite-cli](https://vitejs.dev/guide/cli.html) for more information.


### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.


### `npm run deploy`

Deploys the app to the configured repo and branch.

See [gh-pages docs](https://github.com/gitname/react-gh-pages#deploying-a-react-app-to-github-pages) for more information.

### `npm run preview`

Previews a production build on localhost


### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

***DOES NOT WORK CURRENTLY***



