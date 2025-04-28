# Sorting Algorithms Simulator

A web-based application for simulation and visualization of sorting algorithms.
This application was developed as part of my Bachelor Thesis.

## Building

### Install prerequisites

To build this web application, first you need to install dependencies.
If you don't have Node.js installed, install it according to the instructions on the [Node.js webpage](https://nodejs.org/en/download).
Afterwards, run a command to install the required packages based on your package manager, for example for NPM it's:

```sh
npm install
```

### Build

To build the application in production mode, you can run the command:

```sh
npm run build:prod
```

To build the application in development mode, run the command:

```sh
npm run build
```

or

```sh
npm run build:dev
```

### Build output

After the building process, the built application will be located in the `dist` folder in the root directory of the repository.

## Usage

### Deployment on a web server

The build application can be deployed to any web server by copying the contents of the `dist` folder created after building the application (See [Building section](#building)) into the directory of any web server. Consult your web server's manual for relevant instructions.

### Running the application from local files

The application can also be ran locally, by opening the `index.html` file in the `dist` folder in your preferred web browser. The application has to be built first, see the [Building section](#building) for instructions.

### Development server

*Usage of the development server requires the dependencies of this application to be installed first. See the [Install prerequisites](#install-prerequisites) section.*

Among the dependencies of this application is a simple HTTP server, that will be installed together with the dependencies of this application an will serve the built application (on loopback interface by default) when it's started.

To start the server use the command:

```sh
npm run serve
```

Note that depending on your system configuration, your default browser may open and automatically navigate to the URL of the newly created server.
**The first load may take several seconds**, because the server is started before the building of the project is finished, so the server has to wait for the building process
to complete before it starts handling incoming requests. Subsequent requests should be handled instantaneously.

#### Development server configuration

The address and port of the development server can be configured by changing the relevant constants in the `webpack.devServer.config.ts` file in the root directory of this repository.

## Documentation

Majority of the application is documented using standard JavaScript documentation comments. Documentation files can also be generated from the source code using the `typedoc` tool. To generate the documentation, use the following command:

```sh
npm run docs
```

The documentation will be generated into the `docs` directory, which will be created in the root directory of the repository. To open the documentation, open the `index.html` file in this folder in your preferred web browser.
