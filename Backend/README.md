# Backend

This folder consists of the backend API for the assignment. 

There is only one API ` POST /become-citizen`. This API makes a user citizen of the continent of which we send the continent ID for.

The user address and PK is added in environment variable so as to use it while signing the transaction using web3.


## Process to run the backend application:

- Local setup

1. Go into backend directory in your terminal: `cd Backend`.

2. run the command `npm i` to install the required packages.

3. Setup `.env` file taking reference from `.env.example`.

4. run the command `npm run start` to run the service on the local PORT mentioned in ENV.

### Note:

- set port as 8080 since docker also expose 8080