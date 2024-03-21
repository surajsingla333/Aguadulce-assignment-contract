# Aguadulce Assignment

This repository consists of Aguadulce assignment. 

The assignment is about building an NFT application where there are continents as NFTs. Each NFT will have a unique owner and one user can only own one NFT. The NFTs can be put in auction and anyone can place bids for the auction. The owner can also transfer NFT to any other owner and some fees will be paid by the owner.

We have the backend service inside **Backend** folder.

Frontend web application inside **Frontend** folder.

Contracts and deployment script inside **Contracts** folder.

## Deployment steps

1. Goto the root directory in terminal, `cd ./`

2. Install docker for your machine and setup shell to use docker.

3. run the command `docker-compose up --build`. 

- *Note: This command will run the project in docker containers and do all the deployment tasks. The website will run on localhost:3000, backend will run on localhost:8080, hardhat node will run on localhost:8545.*

### Deployment steps to run on local

1. Follow **README.md** in each folder to run the project in local.
